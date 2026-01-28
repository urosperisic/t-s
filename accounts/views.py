# accounts/views.py

from django.conf import settings
from django.contrib.auth import authenticate
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from rest_framework_simplejwt.tokens import RefreshToken
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

from .models import CustomUser
from .permissions import IsAdmin
from .serializers import (
    LoginSerializer,
    RegisterSerializer,
    UserListSerializer,
    UserSerializer,
)


def broadcast_online_users():
    """Broadcast online users list to all WebSocket connections"""
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        'online_users',
        {
            'type': 'user_status_update',
            'users': []  # Consumer će sam fetchovati listu iz cache-a
        }
    )


def set_auth_cookies(response, access_token, refresh_token):
    """Helper function to set authentication cookies."""
    response.set_cookie(
        key=settings.SIMPLE_JWT["AUTH_COOKIE"],
        value=access_token,
        max_age=settings.SIMPLE_JWT["ACCESS_TOKEN_LIFETIME"].total_seconds(),
        secure=settings.SIMPLE_JWT["AUTH_COOKIE_SECURE"],
        httponly=settings.SIMPLE_JWT["AUTH_COOKIE_HTTP_ONLY"],
        samesite=settings.SIMPLE_JWT["AUTH_COOKIE_SAMESITE"],
        path="/",
    )
    response.set_cookie(
        key=settings.SIMPLE_JWT["AUTH_COOKIE_REFRESH"],
        value=refresh_token,
        max_age=settings.SIMPLE_JWT["REFRESH_TOKEN_LIFETIME"].total_seconds(),
        secure=settings.SIMPLE_JWT["AUTH_COOKIE_SECURE"],
        httponly=settings.SIMPLE_JWT["AUTH_COOKIE_HTTP_ONLY"],
        samesite=settings.SIMPLE_JWT["AUTH_COOKIE_SAMESITE"],
        path="/",
    )


def delete_auth_cookies(response):
    """Helper function to delete authentication cookies."""
    response.delete_cookie(
        key=settings.SIMPLE_JWT["AUTH_COOKIE"],
        path="/",
    )
    response.delete_cookie(
        key=settings.SIMPLE_JWT["AUTH_COOKIE_REFRESH"],
        path="/",
    )


@api_view(["POST"])
@permission_classes([AllowAny])
def register_view(request):
    """
    Register a new user.

    POST /api/auth/register/
    Body: {"username": "...", "email": "...", "password": "..."}
    """
    serializer = RegisterSerializer(data=request.data)

    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    user = serializer.save()

    return Response(
        {
            "detail": "Registration successful",
            "user": UserSerializer(user).data,
        },
        status=status.HTTP_201_CREATED,
    )


@api_view(["POST"])
@permission_classes([AllowAny])
def login_view(request):
    """
    Login user and set JWT cookies.

    POST /api/auth/login/
    Body: {"username": "...", "password": "..."}
    """
    serializer = LoginSerializer(data=request.data)

    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    username = serializer.validated_data["username"]
    password = serializer.validated_data["password"]

    user = authenticate(username=username, password=password)

    if user is None:
        return Response(
            {"detail": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED
        )

    if not user.is_active:
        return Response(
            {"detail": "Account is disabled"}, status=status.HTTP_403_FORBIDDEN
        )

    # Generate tokens
    refresh = RefreshToken.for_user(user)
    access_token = str(refresh.access_token)
    refresh_token = str(refresh)

    # Create response with token expiry info
    response = Response(
        {
            "detail": "Login successful",
            "user": UserSerializer(user).data,
            "access_token_expires_in": settings.SIMPLE_JWT["ACCESS_TOKEN_LIFETIME"].total_seconds(),
        },
        status=status.HTTP_200_OK,
    )

    # Set cookies
    set_auth_cookies(response, access_token, refresh_token)

    # Broadcast to WebSocket - DON'T do it here, WebSocket connect will handle it
    # broadcast_online_users()

    return response


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def logout_view(request):
    """
    Logout user and clear JWT cookies.

    POST /api/auth/logout/
    """
    try:
        # Get refresh token from cookie
        refresh_token = request.COOKIES.get(settings.SIMPLE_JWT["AUTH_COOKIE_REFRESH"])

        if refresh_token:
            # Blacklist the refresh token
            token = RefreshToken(refresh_token)
            token.blacklist()

    except (InvalidToken, TokenError):
        # Token is already invalid or blacklisted
        pass

    # Clear user from cache BEFORE creating response
    from django.core.cache import cache
    cache.delete(f'user_online_{request.user.id}')

    # Create response
    response = Response({"detail": "Logout successful"}, status=status.HTTP_200_OK)

    # Delete cookies
    delete_auth_cookies(response)

    # Broadcast to WebSocket that user list changed
    broadcast_online_users()

    return response


@api_view(["POST"])
@permission_classes([AllowAny])
def refresh_view(request):
    """
    Refresh access token using refresh token from cookie.

    POST /api/auth/refresh/
    """
    refresh_token = request.COOKIES.get(settings.SIMPLE_JWT["AUTH_COOKIE_REFRESH"])

    if not refresh_token:
        return Response(
            {"detail": "Refresh token not found"}, status=status.HTTP_401_UNAUTHORIZED
        )

    try:
        # Validate and refresh
        refresh = RefreshToken(refresh_token)
        access_token = str(refresh.access_token)

        # Create response with token expiry info
        response = Response(
            {
                "detail": "Token refreshed successfully",
                "access_token_expires_in": settings.SIMPLE_JWT["ACCESS_TOKEN_LIFETIME"].total_seconds(),
            },
            status=status.HTTP_200_OK,
        )

        # Set new access token cookie
        response.set_cookie(
            key=settings.SIMPLE_JWT["AUTH_COOKIE"],
            value=access_token,
            max_age=settings.SIMPLE_JWT["ACCESS_TOKEN_LIFETIME"].total_seconds(),
            secure=settings.SIMPLE_JWT["AUTH_COOKIE_SECURE"],
            httponly=settings.SIMPLE_JWT["AUTH_COOKIE_HTTP_ONLY"],
            samesite=settings.SIMPLE_JWT["AUTH_COOKIE_SAMESITE"],
            path="/",
        )

        return response

    except (InvalidToken, TokenError) as e:
        return Response(
            {"detail": f"Invalid refresh token: {str(e)}"},
            status=status.HTTP_401_UNAUTHORIZED,
        )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def user_view(request):
    """
    Get current authenticated user data.

    GET /api/auth/user/
    """
    serializer = UserSerializer(request.user)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(["GET"])
@permission_classes([IsAuthenticated, IsAdmin])
def list_users_view(request):
    """
    List all users (admin only).

    GET /api/auth/users/
    """
    users = CustomUser.objects.all().order_by("-date_joined")
    serializer = UserListSerializer(users, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(["DELETE"])
@permission_classes([IsAuthenticated, IsAdmin])
def delete_user_view(request, user_id):
    """
    Delete a user by ID (admin only).
    Cannot delete yourself.

    DELETE /api/auth/users/<user_id>/
    """
    try:
        user = CustomUser.objects.get(id=user_id)
    except CustomUser.DoesNotExist:
        return Response({"detail": "User not found"}, status=status.HTTP_404_NOT_FOUND)

    # Prevent admin from deleting themselves
    if user.id == request.user.id:
        return Response(
            {"detail": "Cannot delete yourself"}, status=status.HTTP_400_BAD_REQUEST
        )

    # Prevent deleting superusers
    if user.is_superuser:
        return Response(
            {"detail": "Cannot delete superuser"}, status=status.HTTP_403_FORBIDDEN
        )

    username = user.username
    
    # Clear user from cache
    from django.core.cache import cache
    cache.delete(f'user_online_{user.id}')
    
    user.delete()

    # Broadcast to WebSocket
    broadcast_online_users()

    return Response(
        {"detail": f"User '{username}' deleted successfully"},
        status=status.HTTP_200_OK,
    )