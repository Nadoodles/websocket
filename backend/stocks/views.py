from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
from django.core.cache import cache
from .models import Stock, StockPrice, StockHistoricalData
from .serializers import StockSerializer, StockPriceSerializer, StockHistoricalDataSerializer, StockListSerializer
from .tasks import fetch_stock_data_task
import logging

logger = logging.getLogger(__name__)


class StockViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Stock.objects.filter(is_active=True)
    serializer_class = StockSerializer

    def get_serializer_class(self):
        if self.action == 'list':
            return StockListSerializer
        return StockSerializer

    def get_queryset(self):
        queryset = Stock.objects.filter(is_active=True)
        
        # Search functionality
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(symbol__icontains=search) | 
                Q(name__icontains=search)
            )
        
        # Filter by sector
        sector = self.request.query_params.get('sector', None)
        if sector:
            queryset = queryset.filter(sector__icontains=sector)
        
        # Filter by industry
        industry = self.request.query_params.get('industry', None)
        if industry:
            queryset = queryset.filter(industry__icontains=industry)
        
        return queryset

    @action(detail=True, methods=['get'])
    def prices(self, request, pk=None):
        """Get price history for a specific stock"""
        stock = self.get_object()
        limit = request.query_params.get('limit', 100)
        
        prices = stock.prices.all()[:int(limit)]
        serializer = StockPriceSerializer(prices, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def historical(self, request, pk=None):
        """Get historical data for a specific stock"""
        stock = self.get_object()
        limit = request.query_params.get('limit', 30)
        
        historical_data = stock.historical_data.all()[:int(limit)]
        serializer = StockHistoricalDataSerializer(historical_data, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def refresh_all(self, request):
        """Trigger refresh of all stock data"""
        try:
            # Trigger Celery task to fetch all stock data
            fetch_stock_data_task.delay()
            return Response({'message': 'Stock data refresh initiated'}, status=status.HTTP_202_ACCEPTED)
        except Exception as e:
            logger.error(f"Error triggering stock refresh: {str(e)}")
            return Response({'error': 'Failed to trigger stock refresh'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['get'])
    def top_gainers(self, request):
        """Get top gaining stocks"""
        cache_key = 'top_gainers'
        cached_data = cache.get(cache_key)
        
        if cached_data:
            return Response(cached_data)
        
        stocks = Stock.objects.filter(
            is_active=True,
            prices__change_percent__isnull=False
        ).order_by('-prices__change_percent')[:10]
        
        serializer = StockListSerializer(stocks, many=True)
        data = serializer.data
        
        # Cache for 5 minutes
        cache.set(cache_key, data, 300)
        return Response(data)

    @action(detail=False, methods=['get'])
    def top_losers(self, request):
        """Get top losing stocks"""
        cache_key = 'top_losers'
        cached_data = cache.get(cache_key)
        
        if cached_data:
            return Response(cached_data)
        
        stocks = Stock.objects.filter(
            is_active=True,
            prices__change_percent__isnull=False
        ).order_by('prices__change_percent')[:10]
        
        serializer = StockListSerializer(stocks, many=True)
        data = serializer.data
        
        # Cache for 5 minutes
        cache.set(cache_key, data, 300)
        return Response(data)


class StockPriceViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = StockPrice.objects.all()
    serializer_class = StockPriceSerializer

    def get_queryset(self):
        queryset = StockPrice.objects.all()
        
        # Filter by stock symbol
        symbol = self.request.query_params.get('symbol', None)
        if symbol:
            queryset = queryset.filter(stock__symbol=symbol)
        
        return queryset.order_by('-timestamp')

