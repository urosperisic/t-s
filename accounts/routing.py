# accounts/routing.py

from django.urls import path
from .consumers import OnlineUsersConsumer

websocket_urlpatterns = [
    path('ws/online-users/', OnlineUsersConsumer.as_asgi()),
]