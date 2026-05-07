from rest_framework import viewsets, permissions
from rest_framework.authentication import TokenAuthentication
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Board, Post
from accounts.models import Thread
from accounts.serializers import ThreadSerializer
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
        thread_id = self.request.data.get('thread_id')
        is_sage = self.request.data.get('is_sage', False)
        content = self.request.data.get('content', '')
        
        # Анализируем токсичность контента
        from accounts.toxicity import ToxicityAnalyzer
        is_toxic, toxicity_score, detected_words = ToxicityAnalyzer.analyze_text(content)
        
        if is_toxic:
            # Если контент токсичный, отправляем на модерацию
            from moderation.models import ModerationQueue
            from accounts.models import Thread
            
            thread = get_object_or_404(Thread, id=thread_id) if thread_id else None
            
            # Создаем запись в очереди модерации
            ModerationQueue.objects.create(
                content_type='post',
                content=content,
                author=self.request.user,
                thread=thread,
                status='pending',
                toxicity_score=toxicity_score,
                detected_words=', '.join(detected_words)
            )
            
            # Возвращаем ошибку с информацией о том, что контент отправлен на модерацию
            from rest_framework.response import Response
            from rest_framework import status
            return Response({
                'error': 'Контент отправлен на модерацию',
                'toxicity_score': toxicity_score,
                'detected_words': detected_words,
                'message': 'Ваш пост содержит недопустимый контент и будет проверен модератором'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Если контент не токсичный, сохраняем пост
        if thread_id:
            from accounts.models import Thread
            thread = get_object_or_404(Thread, id=thread_id)
            
            # Проверяем можно ли бампнуть тред
            can_bump, bump_message = thread.can_bump()
            
            if not is_sage and can_bump:
                # Если не sage и можно бампнуть
                serializer.save(author=self.request.user, thread=thread, is_sage=is_sage)
                thread.increment_posts_count()
                thread.bump_thread()
            elif not is_sage and not can_bump:
                # Если не sage но бамп запрещен
                from rest_framework.response import Response
                from rest_framework import status
                return Response({
                    'error': 'Бамп запрещен',
                    'message': bump_message
                }, status=status.HTTP_403_FORBIDDEN)
            else:
                # Если sage или бамп разрешен
                serializer.save(author=self.request.user, thread=thread, is_sage=is_sage)
                thread.increment_posts_count()
        else:
            serializer.save(author=self.request.user, is_sage=is_sage)


class BoardThreadsView(viewsets.GenericViewSet):
    """
    ViewSet для тредов в конкретной доске.
    """
    permission_classes = [permissions.AllowAny]
    
    def list(self, request, board_id=None):
        if board_id:
            board = get_object_or_404(Board, id=board_id)
            threads = Thread.objects.filter(board=board).order_by('-bump_time', '-created_at')
        else:
            threads = Thread.objects.all().order_by('-bump_time', '-created_at')
        
        page = self.paginate_queryset(threads)
        serializer = ThreadSerializer(page, many=True, context={'request': request})
        return self.get_paginated_response(serializer)
