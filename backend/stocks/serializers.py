from rest_framework import serializers
from .models import Stock, StockPrice, StockHistoricalData


class StockSerializer(serializers.ModelSerializer):
    latest_price = serializers.SerializerMethodField()
    change_percent = serializers.SerializerMethodField()

    class Meta:
        model = Stock
        fields = ['id', 'symbol', 'name', 'sector', 'industry', 'market_cap', 
                 'is_active', 'latest_price', 'change_percent', 'created_at', 'updated_at']

    def get_latest_price(self, obj):
        latest_price = obj.prices.first()
        return float(latest_price.price) if latest_price else None

    def get_change_percent(self, obj):
        latest_price = obj.prices.first()
        return float(latest_price.change_percent) if latest_price and latest_price.change_percent else None


class StockPriceSerializer(serializers.ModelSerializer):
    stock_symbol = serializers.CharField(source='stock.symbol', read_only=True)

    class Meta:
        model = StockPrice
        fields = ['id', 'stock_symbol', 'price', 'volume', 'open_price', 'high_price', 
                 'low_price', 'previous_close', 'change', 'change_percent', 'timestamp']


class StockHistoricalDataSerializer(serializers.ModelSerializer):
    stock_symbol = serializers.CharField(source='stock.symbol', read_only=True)

    class Meta:
        model = StockHistoricalData
        fields = ['id', 'stock_symbol', 'date', 'open_price', 'high_price', 'low_price', 
                 'close_price', 'volume', 'adjusted_close']


class StockListSerializer(serializers.ModelSerializer):
    latest_price = serializers.SerializerMethodField()
    change_percent = serializers.SerializerMethodField()

    class Meta:
        model = Stock
        fields = ['id', 'symbol', 'name', 'latest_price', 'change_percent']

    def get_latest_price(self, obj):
        latest_price = obj.prices.first()
        return float(latest_price.price) if latest_price else None

    def get_change_percent(self, obj):
        latest_price = obj.prices.first()
        return float(latest_price.change_percent) if latest_price and latest_price.change_percent else None

