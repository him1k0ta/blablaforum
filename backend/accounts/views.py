from rest_framework import generics, permissions, status, request
from django.db import models
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.authtoken.models import Token
from rest_framework.authentication import TokenAuthentication
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.shortcuts import get_object_or_404
from .models import Thread, Like, Comment, User, FavoriteThread, Tag
from .serializers import (
	UserRegisterSerializer,
	UserLoginSerializer,
	ThreadSerializer,
	ThreadDetailSerializer,
	CommentSerializer,
	AdminThreadSerializer,
	LikeSerializer,
	TagSerializer
)
import logging

logger = logging.getLogger(__name__)


class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = UserRegisterSerializer(data=request.data)
        if not serializer.is_valid():
            logger.error(f"Validation errors: {serializer.errors}")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        try:
            user = serializer.save()
            token = Token.objects.create(user=user)
            logger.info(f"User created: {user.username}")
            return Response({
                "message": "Registration successful",
                "token": token.key,
                "user_id": user.id,
                "username": user.username,
                "is_admin": user.is_superuser,
                "email": user.email
            }, status=status.HTTP_201_CREATED)
        except Exception as e:
            logger.error(f"Error: {str(e)}")
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    permission_classes=[permissions.AllowAny]
    def post(self,request):
        serializer=UserLoginSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)
        user=authenticate(
            username=serializer.validated_data['username'],
            password=serializer.validated_data['password']
        )
        if not user:
            return Response({"error":"Invalid credentials"},status=status.HTTP_401_UNAUTHORIZED)
        token=Token.objects.get_or_create(user=user)[0]
        return Response({
            "token":token.key,
            "user_id":user.id,
            "username":user.username,
            "email":user.email,
            "is_superuser":user.is_superuser
        })


class LogoutView(APIView):
    """Эндпоинт для выхода из системы."""
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        response = Response({'message': 'Successfully logged out'})
        
        # Очищаем все auth cookies с правильными параметрами
        response.delete_cookie('access_token', domain='localhost', path='/')
        response.delete_cookie('refresh_token', domain='localhost', path='/')
        
        return response




class ThreadListCreateView(generics.ListCreateAPIView):
    queryset = Thread.objects.all().order_by('-created_at')
    serializer_class = ThreadSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    authentication_classes = [TokenAuthentication]
    
    def perform_create(self, serializer):
        serializer.save(author=self.request.user)


class ThreadDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Thread.objects.all()
    serializer_class = ThreadSerializer
    authentication_classes = [TokenAuthentication]

    def get_permissions(self):
        if self.request.method == 'DELETE':
            return [permissions.IsAdminUser()]
        return [permissions.IsAuthenticatedOrReadOnly()]

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.increment_views()
        serializer = ThreadDetailSerializer(instance, context={'request': request})
        return Response(serializer.data)

    def perform_destroy(self, instance):
        if not request.user.is_admin():
            raise PermissionDenied("Только администратор может удалять треды")
        instance.delete()
        return Response({'status': 'Тред удален'}, status=status.HTTP_204_NO_CONTENT)


class TokenObtainPairView(APIView):
    """Эндпоинт для получения JWT токена."""
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        
        user = authenticate(username=username, password=password)
        if user is not None:
            refresh = RefreshToken.for_user(user)
            response = Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            })
            
            # Устанавливаем JWT токены в cookies
            from rest_framework_simplejwt.settings import api_settings
            from datetime import datetime, timedelta
            
            access_token_expiry = datetime.utcnow() + api_settings.ACCESS_TOKEN_LIFETIME
            refresh_token_expiry = datetime.utcnow() + api_settings.REFRESH_TOKEN_LIFETIME
            
            response.set_cookie(
                'access_token',
                str(refresh.access_token),
                expires=access_token_expiry,
                httponly=False,  # Разрешаем доступ из JavaScript
                samesite='None',  # Для кросс-доменных запросов
                domain='localhost'  # Явно указываем домен
            )
            response.set_cookie(
                'refresh_token',
                str(refresh),
                expires=refresh_token_expiry,
                httponly=False,  # Разрешаем доступ из JavaScript
                samesite='None',  # Для кросс-доменных запросов
                domain='localhost'  # Явно указываем домен
            )
            
            return response
        else:
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)


class TokenRefreshView(APIView):
    """Эндпоинт для обновления JWT токена."""
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        refresh_token = request.data.get('refresh') or request.COOKIES.get('refresh_token')
        
        if refresh_token:
            try:
                refresh = RefreshToken(refresh_token)
                access_token = str(refresh.access_token)
                
                response = Response({'access': access_token})
                
                # Обновляем access_token в cookies
                from rest_framework_simplejwt.settings import api_settings
                from datetime import datetime, timedelta
                
                access_token_expiry = datetime.utcnow() + api_settings.ACCESS_TOKEN_LIFETIME
                
                response.set_cookie(
                    'access_token',
                    access_token,
                    expires=access_token_expiry,
                    httponly=False,  # Разрешаем доступ из JavaScript
                    samesite='None',  # Для кросс-доменных запросов
                    domain='localhost'  # Явно указываем домен
                )
                
                return response
            except Exception:
                return Response({'error': 'Invalid refresh token'}, status=status.HTTP_401_UNAUTHORIZED)
        else:
            return Response({'error': 'Refresh token required'}, status=status.HTTP_400_BAD_REQUEST)


class TokenVerifyView(APIView):
    """Эндпоинт для верификации JWT токена."""
    permission_classes = [permissions.AllowAny]
    
    def get(self, request):
        # Проверяем токен из cookies или Authorization header
        access_token = request.COOKIES.get('access_token')
        
        if not access_token:
            auth_header = request.META.get('HTTP_AUTHORIZATION', '')
            if auth_header.startswith('Bearer '):
                access_token = auth_header[7:]
        
        if access_token:
            try:
                from rest_framework_simplejwt.tokens import AccessToken
                token = AccessToken(access_token)
                return Response({
                    'valid': True,
                    'user_id': token['user_id'],
                    'username': token.get('username', ''),
                    'exp': token['exp']
                })
            except Exception:
                return Response({'valid': False}, status=status.HTTP_401_UNAUTHORIZED)
        else:
            return Response({'valid': False}, status=status.HTTP_401_UNAUTHORIZED)


class UserProfileView(APIView):
    """Эндпоинт профиля пользователя."""
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [TokenAuthentication]
    
    def get(self, request, user_id=None):
        if user_id:
            # Получение профиля другого пользователя
            user = get_object_or_404(User, id=user_id)
        else:
            # Получение собственного профиля
            user = request.user
            
        # Получение тредов пользователя
        user_threads = Thread.objects.filter(author=user).order_by('-created_at')
        
        # Получение лайкнутых тредов
        liked_threads = Thread.objects.filter(likes__user=user).order_by('-created_at')
        
        # Получение избранных тредов
        favorite_threads = Thread.objects.filter(favorited_by__user=user).order_by('-created_at')
        
        return Response({
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'avatar': user.avatar.url if user.avatar else None,
                'date_joined': user.date_joined,
            },
            'threads_count': user_threads.count(),
            'liked_threads_count': liked_threads.count(),
            'favorite_threads_count': favorite_threads.count(),
            'threads': ThreadSerializer(user_threads, many=True, context={'request': request}).data,
            'liked_threads': ThreadSerializer(liked_threads, many=True, context={'request': request}).data,
            'favorite_threads': ThreadSerializer(favorite_threads, many=True, context={'request': request}).data,
        })
    
    def put(self, request, user_id=None):
        """Обновление профиля."""
        if user_id and user_id != str(request.user.id) and not request.user.is_superuser:
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
            
        user = request.user if not user_id else get_object_or_404(User, id=user_id)
        
        # Обновление полей
        if 'username' in request.data:
            user.username = request.data['username']
        if 'email' in request.data:
            user.email = request.data['email']
        if 'avatar' in request.data:
            user.avatar = request.data['avatar']
            
        user.save()
        return Response({
            'message': 'Profile updated successfully',
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'avatar': user.avatar.url if user.avatar else None,
            }
        })


class LikeView(APIView):
    """Эндпоинт для лайков постов."""
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [TokenAuthentication]
    
    def post(self, request):
        post_id = request.data.get('post_id')
        if not post_id:
            return Response({'error': 'post_id required'}, status=status.HTTP_400_BAD_REQUEST)
            
        # Проверяем существование лайка (для постов используем ту же логику что и для тредов)
        existing_like = Like.objects.filter(user=request.user, thread__id=post_id).first()
        if existing_like:
            return Response({'error': 'Already liked'}, status=status.HTTP_400_BAD_REQUEST)
            
        # Создаем лайк
        thread = get_object_or_404(Thread, id=post_id)
        Like.objects.create(user=request.user, thread=thread)
        
        return Response({'message': 'Liked successfully'}, status=status.HTTP_201_CREATED)
    
    def delete(self, request):
        post_id = request.data.get('post_id')
        if not post_id:
            return Response({'error': 'post_id required'}, status=status.HTTP_400_BAD_REQUEST)
            
        # Удаляем лайк
        thread = get_object_or_404(Thread, id=post_id)
        like = get_object_or_404(Like, user=request.user, thread=thread)
        like.delete()
        
        return Response({'message': 'Like removed successfully'}, status=status.HTTP_200_OK)


class FavoriteView(APIView):
    """Эндпоинт для избранных тредов."""
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [TokenAuthentication]
    
    def get(self, request):
        favorite_threads = Thread.objects.filter(favorited_by__user=request.user).order_by('-created_at')
        return Response(ThreadSerializer(favorite_threads, many=True, context={'request': request}).data)
    
    def post(self, request):
        thread_id = request.data.get('thread_id')
        if not thread_id:
            return Response({'error': 'thread_id required'}, status=status.HTTP_400_BAD_REQUEST)
            
        thread = get_object_or_404(Thread, id=thread_id)
        
        # Проверяем существование
        existing_favorite = FavoriteThread.objects.filter(user=request.user, thread=thread).first()
        if existing_favorite:
            return Response({'error': 'Already in favorites'}, status=status.HTTP_400_BAD_REQUEST)
            
        # Добавляем в избранное
        FavoriteThread.objects.create(user=request.user, thread=thread)
        
        return Response({'message': 'Added to favorites successfully'}, status=status.HTTP_201_CREATED)
    
    def delete(self, request):
        thread_id = request.data.get('thread_id')
        if not thread_id:
            return Response({'error': 'thread_id required'}, status=status.HTTP_400_BAD_REQUEST)
            
        thread = get_object_or_404(Thread, id=thread_id)
        favorite = get_object_or_404(FavoriteThread, user=request.user, thread=thread)
        favorite.delete()
        
        return Response({'message': 'Removed from favorites successfully'}, status=status.HTTP_200_OK)


class CommentView(generics.ListCreateAPIView):
    """Эндпоинт для комментариев треда."""
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    authentication_classes = [TokenAuthentication]
    
    def get_queryset(self):
        thread_id = self.kwargs.get('pk')
        return Comment.objects.filter(thread_id=thread_id, parent__isnull=True).order_by('created_at')
    
    def perform_create(self, serializer):
        thread_id = self.kwargs.get('pk')
        thread = get_object_or_404(Thread, id=thread_id)
        parent_id = self.request.data.get('parent_id')
        parent = None
        if parent_id:
            parent = get_object_or_404(Comment, id=parent_id, thread=thread)
        
        serializer.save(
            author=self.request.user,
            thread=thread,
            parent=parent
        )


class SearchView(APIView):
    """Эндпоинт для поиска."""
    permission_classes = [permissions.AllowAny]
    
    def get(self, request):
        query = request.GET.get('q', '').strip()
        if not query:
            return Response({'error': 'Search query required'}, status=status.HTTP_400_BAD_REQUEST)
            
        # Поиск по тредам
        threads = Thread.objects.filter(
            models.Q(title__icontains=query) | 
            models.Q(content__icontains=query) |
            models.Q(author__username__icontains=query)
        ).distinct().order_by('-created_at')
        
        return Response(ThreadSerializer(threads, many=True, context={'request': request}).data)
