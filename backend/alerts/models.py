from django.db import models
from django.contrib.auth.models import User
from stocks.models import Stock


class Alert(models.Model):
    ALERT_TYPES = [
        ('price_above', 'Price Above'),
        ('price_below', 'Price Below'),
        ('price_change_percent', 'Price Change %'),
        ('volume_spike', 'Volume Spike'),
    ]
    
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('triggered', 'Triggered'),
        ('cancelled', 'Cancelled'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='alerts')
    stock = models.ForeignKey(Stock, on_delete=models.CASCADE, related_name='alerts')
    alert_type = models.CharField(max_length=20, choices=ALERT_TYPES)
    target_value = models.DecimalField(max_digits=10, decimal_places=2)
    current_value = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='active')
    message = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    triggered_at = models.DateTimeField(blank=True, null=True)
    is_notified = models.BooleanField(default=False)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} - {self.stock.symbol} - {self.get_alert_type_display()}"


class AlertHistory(models.Model):
    alert = models.ForeignKey(Alert, on_delete=models.CASCADE, related_name='history')
    triggered_value = models.DecimalField(max_digits=10, decimal_places=2)
    triggered_at = models.DateTimeField(auto_now_add=True)
    notification_sent = models.BooleanField(default=False)

    class Meta:
        ordering = ['-triggered_at']

    def __str__(self):
        return f"{self.alert} - {self.triggered_value} at {self.triggered_at}"

