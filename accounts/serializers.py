# accounts/serializers.py

from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

from .models import CustomUser


class RegisterSerializer(serializers.ModelSerializer):
    """Serializer for user registration with password validation."""

    password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password],
        style={"input_type": "password"},
    )
    email = serializers.EmailField(required=True)

    class Meta:
        model = CustomUser
        fields = ("username", "email", "password")

    def validate_username(self, value):
        """Validate that username is unique."""
        if CustomUser.objects.filter(username=value).exists():
            raise serializers.ValidationError("Username already exists")
        return value

    def validate_email(self, value):
        """Validate that email is unique."""
        if CustomUser.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already exists")
        return value.lower()

    def create(self, validated_data):
        """Create and return a new user with encrypted password."""
        user = CustomUser.objects.create_user(
            username=validated_data["username"],
            email=validated_data["email"],
            password=validated_data["password"],
        )
        return user


class LoginSerializer(serializers.Serializer):
    """Serializer for user login."""

    username = serializers.CharField(required=True)
    password = serializers.CharField(
        required=True, write_only=True, style={"input_type": "password"}
    )


class UserSerializer(serializers.ModelSerializer):
    """Serializer for user data."""

    class Meta:
        model = CustomUser
        fields = ("id", "username", "email", "role", "date_joined", "last_login")
        read_only_fields = ("id", "date_joined", "last_login")


class UserListSerializer(serializers.ModelSerializer):
    """Serializer for listing users (admin only)."""

    class Meta:
        model = CustomUser
        fields = (
            "id",
            "username",
            "email",
            "role",
            "is_active",
            "date_joined",
            "last_login",
        )
        read_only_fields = fields
