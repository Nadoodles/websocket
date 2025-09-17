from django.db import models
from django.contrib.auth.models import User


class Stock(models.Model):
    symbol = models.CharField(max_length=10, unique=True)
    name = models.CharField(max_length=200)
    sector = models.CharField(max_length=100, blank=True, null=True)
    industry = models.CharField(max_length=100, blank=True, null=True)
    market_cap = models.BigIntegerField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['symbol']

    def __str__(self):
        return f"{self.symbol} - {self.name}"


class StockPrice(models.Model):
    stock = models.ForeignKey(Stock, on_delete=models.CASCADE, related_name='prices')
    price = models.DecimalField(max_digits=10, decimal_places=2)
    volume = models.BigIntegerField(blank=True, null=True)
    open_price = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    high_price = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    low_price = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    previous_close = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    change = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    change_percent = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['stock', '-timestamp']),
            models.Index(fields=['-timestamp']),
        ]

    def __str__(self):
        return f"{self.stock.symbol} - ${self.price} at {self.timestamp}"


class StockHistoricalData(models.Model):
    stock = models.ForeignKey(Stock, on_delete=models.CASCADE, related_name='historical_data')
    date = models.DateField()
    open_price = models.DecimalField(max_digits=10, decimal_places=2)
    high_price = models.DecimalField(max_digits=10, decimal_places=2)
    low_price = models.DecimalField(max_digits=10, decimal_places=2)
    close_price = models.DecimalField(max_digits=10, decimal_places=2)
    volume = models.BigIntegerField()
    adjusted_close = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)

    class Meta:
        unique_together = ['stock', 'date']
        ordering = ['-date']
        indexes = [
            models.Index(fields=['stock', '-date']),
        ]

    def __str__(self):
        return f"{self.stock.symbol} - {self.date} - ${self.close_price}"

