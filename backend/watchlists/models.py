from django.db import models
from django.contrib.auth.models import User
from stocks.models import Stock


class Watchlist(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='watchlists')
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    is_public = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['user', 'name']
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} - {self.name}"


class WatchlistItem(models.Model):
    watchlist = models.ForeignKey(Watchlist, on_delete=models.CASCADE, related_name='items')
    stock = models.ForeignKey(Stock, on_delete=models.CASCADE)
    added_at = models.DateTimeField(auto_now_add=True)
    notes = models.TextField(blank=True, null=True)

    class Meta:
        unique_together = ['watchlist', 'stock']
        ordering = ['-added_at']

    def __str__(self):
        return f"{self.watchlist.name} - {self.stock.symbol}"

