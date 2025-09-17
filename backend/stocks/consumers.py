import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import Stock, StockPrice
from .serializers import StockListSerializer


class StockConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_group_name = 'stock_updates'
        
        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        
        await self.accept()
        
        # Send initial data
        await self.send_initial_data()

    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message_type = text_data_json.get('type')
        
        if message_type == 'subscribe':
            # Handle subscription to specific stocks
            symbols = text_data_json.get('symbols', [])
            await self.subscribe_to_stocks(symbols)
        elif message_type == 'unsubscribe':
            # Handle unsubscription
            symbols = text_data_json.get('symbols', [])
            await self.unsubscribe_from_stocks(symbols)

    async def send_initial_data(self):
        """Send initial stock data when client connects"""
        stocks = await self.get_all_stocks()
        await self.send(text_data=json.dumps({
            'type': 'initial_data',
            'data': stocks
        }))

    async def stock_update(self, event):
        """Send stock update to WebSocket"""
        await self.send(text_data=json.dumps({
            'type': 'stock_update',
            'data': event['data']
        }))

    async def subscribe_to_stocks(self, symbols):
        """Subscribe to updates for specific stocks"""
        # In a more complex implementation, you might want to track
        # which stocks each client is subscribed to
        await self.send(text_data=json.dumps({
            'type': 'subscription_confirmed',
            'symbols': symbols
        }))

    async def unsubscribe_from_stocks(self, symbols):
        """Unsubscribe from updates for specific stocks"""
        await self.send(text_data=json.dumps({
            'type': 'unsubscription_confirmed',
            'symbols': symbols
        }))

    @database_sync_to_async
    def get_all_stocks(self):
        """Get all active stocks with latest prices"""
        stocks = Stock.objects.filter(is_active=True)[:50]  # Limit for performance
        serializer = StockListSerializer(stocks, many=True)
        return serializer.data

