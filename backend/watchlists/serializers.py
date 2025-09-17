from rest_framework import serializers
from .models import Watchlist, WatchlistItem
from stocks.serializers import StockSerializer


class WatchlistItemSerializer(serializers.ModelSerializer):
    stock = StockSerializer(read_only=True)
    stock_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = WatchlistItem
        fields = ['id', 'stock', 'stock_id', 'added_at', 'notes']

    def create(self, validated_data):
        stock_id = validated_data.pop('stock_id')
        from stocks.models import Stock
        stock = Stock.objects.get(id=stock_id)
        validated_data['stock'] = stock
        return super().create(validated_data)


class WatchlistSerializer(serializers.ModelSerializer):
    items = WatchlistItemSerializer(many=True, read_only=True)
    item_count = serializers.SerializerMethodField()

    class Meta:
        model = Watchlist
        fields = ['id', 'name', 'description', 'is_public', 'created_at', 'updated_at', 'items', 'item_count']

    def get_item_count(self, obj):
        return obj.items.count()


class WatchlistListSerializer(serializers.ModelSerializer):
    item_count = serializers.SerializerMethodField()

    class Meta:
        model = Watchlist
        fields = ['id', 'name', 'description', 'is_public', 'created_at', 'updated_at', 'item_count']

    def get_item_count(self, obj):
        return obj.items.count()

