# accounts/consumers.py

import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import CustomUser

class OnlineUsersConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_group_name = 'online_users'
        
        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        
        await self.accept()
        
        # Pošalji trenutne online korisnike
        if self.scope["user"].is_authenticated:
            await self.update_user_status(self.scope["user"].id, True)
            await self.broadcast_online_users()
    
    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
        
        # Update user status
        if self.scope["user"].is_authenticated:
            await self.update_user_status(self.scope["user"].id, False)
            await self.broadcast_online_users()
    
    async def receive(self, text_data):
        # Handle incoming messages if needed (for heartbeat/ping-pong)
        pass
    
    async def user_status_update(self, event):
        # Fetchuj listu iz cache-a umesto da koristiš event['users']
        online_users = await self.get_online_users()
        
        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            'type': 'online_users',
            'users': online_users
        }))
    
    @database_sync_to_async
    def update_user_status(self, user_id, is_online):
        from django.core.cache import cache
        cache_key = f'user_online_{user_id}'
        if is_online:
            cache.set(cache_key, True, timeout=None)
        else:
            cache.delete(cache_key)
    
    @database_sync_to_async
    def get_online_users(self):
        from django.core.cache import cache
        users = CustomUser.objects.all()
        online_users = []
        for user in users:
            if cache.get(f'user_online_{user.id}'):
                online_users.append({
                    'id': user.id,
                    'username': user.username,
                    'role': user.role
                })
        return online_users
    
    async def broadcast_online_users(self):
        online_users = await self.get_online_users()
        
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'user_status_update',
                'users': online_users
            }
        )