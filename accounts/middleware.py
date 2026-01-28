# accounts/middleware.py

from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser
from django.conf import settings
from rest_framework_simplejwt.tokens import AccessToken
from .models import CustomUser


@database_sync_to_async
def get_user_from_token(token):
    try:
        access_token = AccessToken(token)
        user_id = access_token["user_id"]
        return CustomUser.objects.get(id=user_id)
    except Exception:
        return AnonymousUser()


class JWTAuthMiddleware:
    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        # Get cookies from headers
        headers = dict(scope["headers"])
        cookie_header = headers.get(b"cookie", b"").decode()

        # Parse cookies
        cookies = {}
        for cookie in cookie_header.split("; "):
            if "=" in cookie:
                key, value = cookie.split("=", 1)
                cookies[key] = value

        # Get JWT token from cookie
        token = cookies.get(settings.SIMPLE_JWT["AUTH_COOKIE"])

        if token:
            scope["user"] = await get_user_from_token(token)
        else:
            scope["user"] = AnonymousUser()

        return await self.app(scope, receive, send)
