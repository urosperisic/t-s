# accounts/urls.py

from django.urls import path

from .views import (
    delete_user_view,
    list_users_view,
    login_view,
    logout_view,
    refresh_view,
    register_view,
    user_view,
)

app_name = "accounts"

urlpatterns = [
    # Public endpoints
    path("register/", register_view, name="register"),
    path("login/", login_view, name="login"),
    path("refresh/", refresh_view, name="refresh"),
    # Protected endpoints
    path("logout/", logout_view, name="logout"),
    path("user/", user_view, name="user"),
    # Admin endpoints
    path("users/", list_users_view, name="list_users"),
    path("users/<int:user_id>/", delete_user_view, name="delete_user"),
]
