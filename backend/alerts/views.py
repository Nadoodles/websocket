from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.utils import timezone
from .models import Alert, AlertHistory
from .serializers import AlertSerializer, AlertListSerializer, AlertHistorySerializer


class AlertViewSet(viewsets.ModelViewSet):
    serializer_class = AlertSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Alert.objects.filter(user=self.request.user)

    def get_serializer_class(self):
        if self.action == 'list':
            return AlertListSerializer
        return AlertSerializer

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['post'])
    def trigger(self, request, pk=None):
        """Manually trigger an alert"""
        alert = self.get_object()
        if alert.status != 'active':
            return Response({'error': 'Alert is not active'}, status=status.HTTP_400_BAD_REQUEST)
        
        alert.status = 'triggered'
        alert.triggered_at = timezone.now()
        alert.save()
        
        # Create history record
        AlertHistory.objects.create(
            alert=alert,
            triggered_value=alert.current_value or alert.target_value
        )
        
        return Response({'message': 'Alert triggered'}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Cancel an alert"""
        alert = self.get_object()
        alert.status = 'cancelled'
        alert.save()
        
        return Response({'message': 'Alert cancelled'}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['get'])
    def history(self, request, pk=None):
        """Get alert history"""
        alert = self.get_object()
        history = alert.history.all()
        serializer = AlertHistorySerializer(history, many=True)
        return Response(serializer.data)


class AlertHistoryViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = AlertHistorySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return AlertHistory.objects.filter(alert__user=self.request.user)

