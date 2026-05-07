from rest_framework import viewsets, permissions, status
from rest_framework.authentication import TokenAuthentication
from rest_framework.response import Response
from .models import ModerationQueue
from .serializers import ModerationQueueSerializer


class ModerationQueueViewSet(viewsets.ModelViewSet):
    """
    ViewSet для очереди модерации.
    """
    queryset = ModerationQueue.objects.all().order_by('-created_at')
    serializer_class = ModerationQueueSerializer
    permission_classes = [permissions.IsAdminUser]
    authentication_classes = [TokenAuthentication]
    
    def approve(self, request, pk=None):
        """Одобрить контент."""
        instance = self.get_object()
        instance.approve(request.user, request.data.get('comment', ''))
        return Response({'status': 'approved'}, status=status.HTTP_200_OK)
    
    def reject(self, request, pk=None):
        """Отклонить жалобу."""
        instance = self.get_object()
        instance.reject(request.user, request.data.get('comment', ''))
        return Response({'status': 'rejected'}, status=status.HTTP_200_OK)
    
    def delete_content(self, request, pk=None):
        """Удалить контент."""
        instance = self.get_object()
        instance.delete_content(request.user, request.data.get('comment', ''))
        return Response({'status': 'deleted'}, status=status.HTTP_200_OK)
