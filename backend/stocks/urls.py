from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import StockViewSet, StockPriceViewSet

router = DefaultRouter()
router.register(r'stocks', StockViewSet, basename='stock')
router.register(r'prices', StockPriceViewSet, basename='stockprice')

urlpatterns = [
    path('', include(router.urls)),
]

