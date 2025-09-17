from rest_framework import serializers
from .models import Alert, AlertHistory
from stocks.serializers import StockSerializer


class AlertSerializer(serializers.ModelSerializer):
    stock = StockSerializer(read_only=True)
    stock_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = Alert
        fields = ['id', 'stock', 'stock_id', 'alert_type', 'target_value', 'current_value', 
                 'status', 'message', 'created_at', 'triggered_at', 'is_notified']

    def create(self, validated_data):
        stock_id = validated_data.pop('stock_id')
        from stocks.models import Stock
        stock = Stock.objects.get(id=stock_id)
        validated_data['stock'] = stock
        return super().create(validated_data)


class AlertHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = AlertHistory
        fields = ['id', 'triggered_value', 'triggered_at', 'notification_sent']


class AlertListSerializer(serializers.ModelSerializer):
    stock_symbol = serializers.CharField(source='stock.symbol', read_only=True)
    stock_name = serializers.CharField(source='stock.name', read_only=True)

    class Meta:
        model = Alert
        fields = ['id', 'stock_symbol', 'stock_name', 'alert_type', 'target_value', 
                 'current_value', 'status', 'created_at', 'triggered_at', 'is_notified']

