from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AlertViewSet, AlertHistoryViewSet

router = DefaultRouter()
router.register(r'alerts', AlertViewSet, basename='alert')
router.register(r'history', AlertHistoryViewSet, basename='alerthistory')

urlpatterns = [
    path('', include(router.urls)),
]

