from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from .models import Watchlist, WatchlistItem
from .serializers import WatchlistSerializer, WatchlistListSerializer, WatchlistItemSerializer


class WatchlistViewSet(viewsets.ModelViewSet):
    serializer_class = WatchlistSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Watchlist.objects.filter(user=self.request.user)

    def get_serializer_class(self):
        if self.action == 'list':
            return WatchlistListSerializer
        return WatchlistSerializer

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['post'])
    def add_stock(self, request, pk=None):
        """Add a stock to the watchlist"""
        watchlist = self.get_object()
        stock_id = request.data.get('stock_id')
        
        if not stock_id:
            return Response({'error': 'stock_id is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            from stocks.models import Stock
            stock = Stock.objects.get(id=stock_id)
            
            # Check if stock is already in watchlist
            if WatchlistItem.objects.filter(watchlist=watchlist, stock=stock).exists():
                return Response({'error': 'Stock already in watchlist'}, status=status.HTTP_400_BAD_REQUEST)
            
            WatchlistItem.objects.create(watchlist=watchlist, stock=stock)
            return Response({'message': 'Stock added to watchlist'}, status=status.HTTP_201_CREATED)
            
        except Stock.DoesNotExist:
            return Response({'error': 'Stock not found'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['delete'])
    def remove_stock(self, request, pk=None):
        """Remove a stock from the watchlist"""
        watchlist = self.get_object()
        stock_id = request.data.get('stock_id')
        
        if not stock_id:
            return Response({'error': 'stock_id is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            from stocks.models import Stock
            stock = Stock.objects.get(id=stock_id)
            watchlist_item = WatchlistItem.objects.get(watchlist=watchlist, stock=stock)
            watchlist_item.delete()
            return Response({'message': 'Stock removed from watchlist'}, status=status.HTTP_200_OK)
            
        except (Stock.DoesNotExist, WatchlistItem.DoesNotExist):
            return Response({'error': 'Stock not found in watchlist'}, status=status.HTTP_404_NOT_FOUND)


class WatchlistItemViewSet(viewsets.ModelViewSet):
    serializer_class = WatchlistItemSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return WatchlistItem.objects.filter(watchlist__user=self.request.user)

    def perform_create(self, serializer):
        watchlist_id = self.request.data.get('watchlist_id')
        watchlist = get_object_or_404(Watchlist, id=watchlist_id, user=self.request.user)
        serializer.save(watchlist=watchlist)

