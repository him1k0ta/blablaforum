from rest_framework import viewsets, permissions
from rest_framework.authentication import TokenAuthentication
from .models import Board, Post
from .serializers import BoardSerializer, PostSerializer


class BoardViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet для досок (только чтение).
    """
    queryset = Board.objects.filter(is_active=True).order_by('position', 'name')
    serializer_class = BoardSerializer
    permission_classes = [permissions.AllowAny]
    authentication_classes = []


class PostViewSet(viewsets.ModelViewSet):
    """
    ViewSet для постов.
    """
    queryset = Post.objects.all().order_by('-created_at')
    serializer_class = PostSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    authentication_classes = [TokenAuthentication]
    
    def perform_create(self, serializer):
        serializer.save(author=self.request.user)
