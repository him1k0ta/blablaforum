"""
Views для API приложения форума.
"""
import logging
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.authtoken.models import Token
from rest_framework.authentication import TokenAuthentication
from django.contrib.auth import authenticate
from django.shortcuts import get_object_or_404
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.db.models import Q

from .models import Thread, Like, Comment, User
from .serializers import (
    UserRegisterSerializer,
    UserLoginSerializer,
    ThreadSerializer,
    CommentSerializer,
    AdminThreadSerializer,
    LikeSerializer,
    TagSerializer
)

logger = logging.getLogger(__name__)


class RegisterView(generics.CreateAPIView):
    """View для регистрации пользователя."""
    queryset = User.objects.all()
    serializer_class = UserRegisterSerializer
    permission_classes = [permissions.AllowAny]


class LoginView(APIView):
    """View для входа пользователя."""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        
        user = authenticate(username=username, password=password)
        
        if user:
            token, created = Token.objects.get_or_create(user=user)
            return Response({
                'token': token.key,
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'is_superuser': user.is_superuser
                }
            })
        
        return Response(
            {'error': 'Неверные учетные данные'}, 
            status=status.HTTP_401_UNAUTHORIZED
        )


class ThreadListCreateView(generics.ListCreateAPIView):
    """View для списка и создания тредов."""
    queryset = Thread.objects.all()
    serializer_class = ThreadSerializer
    authentication_classes = [TokenAuthentication]
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)


class ThreadDetailView(generics.RetrieveUpdateDestroyAPIView):
    """View для детального просмотра, обновления и удаления треда."""
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
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    def perform_destroy(self, instance):
        if not self.request.user.is_superuser:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Только администратор может удалять треды")
        instance.delete()
        return Response({'status': 'Тред удален'}, status=status.HTTP_204_NO_CONTENT)


class CommentListCreateView(generics.ListCreateAPIView):
    """View для списка и создания комментариев."""
    serializer_class = CommentSerializer
    authentication_classes = [TokenAuthentication]
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        thread_id = self.kwargs['thread_id']
        thread = get_object_or_404(Thread, id=thread_id)
        return Comment.objects.filter(thread=thread).order_by('created_at')

    def perform_create(self, serializer):
        thread_id = self.kwargs['thread_id']
        thread = get_object_or_404(Thread, id=thread_id)
        serializer.save(author=self.request.user, thread=thread)


class LikeCreateDestroyView(generics.DestroyAPIView):
    """View для управления лайками."""
    serializer_class = LikeSerializer
    authentication_classes = [TokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, *args, **kwargs):
        thread_id = kwargs['thread_id']
        thread = get_object_or_404(Thread, id=thread_id)
        
        try:
            like = Like.objects.get(user=request.user, thread=thread)
            like.delete()
            return Response({'status': 'Лайк убран'}, status=status.HTTP_204_NO_CONTENT)
        except Like.DoesNotExist:
            return Response(
                {'error': 'Лайк не найден'}, 
                status=status.HTTP_404_NOT_FOUND
            )

    def post(self, request, *args, **kwargs):
        thread_id = kwargs['thread_id']
        thread = get_object_or_404(Thread, id=thread_id)
        
        like, created = Like.objects.get_or_create(user=request.user, thread=thread)
        
        if created:
            return Response({'status': 'Лайк добавлен'}, status=status.HTTP_201_CREATED)
        else:
            return Response({'status': 'Лайк уже существует'}, status=status.HTTP_200_OK)


class ProfileView(generics.RetrieveAPIView):
    """View для профиля пользователя."""
    serializer_class = UserRegisterSerializer
    authentication_classes = [TokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


class UserThreadsView(generics.ListAPIView):
    """View для тредов пользователя."""
    serializer_class = ThreadSerializer
    authentication_classes = [TokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Thread.objects.filter(author=self.request.user).order_by('-created_at')


class LikedThreadsView(generics.ListAPIView):
    """View для лайкнутых тредов пользователя."""
    serializer_class = ThreadSerializer
    authentication_classes = [TokenAuthentication]
    permission_classes =permissions.IsAuthenticated]

    def get_queryset(self):
        return Thread.objects.filter(likes__user=self.request.user).order_by('-created_at')


class VerifyTokenView(APIView):
    """View для проверки валидности токена."""
    authentication_classes = [TokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response({
            'valid': True,
            'user': {
                'id': request.user.id,
                'username': request.user.username,
                'email': request.user.email,
                'is_superuser': request.user.is_superuser
            }
        })


class AdminStatsView(APIView):
    """View для статистики в админке."""
    authentication_classes = [TokenAuthentication]
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        from django.utils import timezone
        from datetime import timedelta
        from django.db.models import Count
        
        now = timezone.now()
        seven_days_ago = now - timedelta(days=7)
        
        stats = {
            'total_users': User.objects.count(),
            'total_threads': Thread.objects.count(),
            'total_comments': Comment.objects.count(),
            'total_likes': Like.objects.count(),
            'users_last_7_days': User.objects.filter(date_joined__gte=seven_days_ago).count(),
            'threads_last_7_days': Thread.objects.filter(created_at__gte=seven_days_ago).count(),
            'comments_last_7_days': Comment.objects.filter(created_at__gte=seven_days_ago).count(),
            'likes_last_7_days': Like.objects.filter(created_at__gte=seven_days_ago).count(),
        }
        
        return Response(stats)


class TagListView(generics.ListAPIView):
    """View для списка тегов."""
    queryset = Tag.objects.all()
    serializer_class = TagSerializer
    permission_classes = [permissions.AllowAny]

	def get(self, request):
		user = request.user
		return Response({
			'status': 'Token is valid',
			'is_admin': user.is_superuser,
			'username': user.username
		}, status=status.HTTP_200_OK)

class CommentView(generics.ListCreateAPIView):
	serializer_class=CommentSerializer
	permission_classes=[permissions.IsAuthenticatedOrReadOnly]
	authentication_classes=[TokenAuthentication]
	def get_queryset(self):
		return Comment.objects.filter(thread_id=self.kwargs['pk'],parent__isnull=True).order_by('-created_at')
	def perform_create(self,serializer):
		thread=get_object_or_404(Thread,id=self.kwargs['pk'])
		parent_id=self.request.data.get('parent_id')
		parent=None
		if parent_id:
			parent=get_object_or_404(Comment,id=parent_id,thread=thread)
		serializer.save(author=self.request.user,thread=thread,parent=parent)
		thread.comments_count=Comment.objects.filter(thread=thread).count()
		thread.save()
class LikeThreadView(APIView):
	permission_classes=[permissions.IsAuthenticated]
	authentication_classes=[TokenAuthentication]
	def post(self,request,pk):
		thread=get_object_or_404(Thread,id=pk)
		if Like.objects.filter(user=request.user,thread=thread).exists():
			return Response({'detail':'Вы уже поставили лайк этому треду'},status=status.HTTP_400_BAD_REQUEST)
		Like.objects.create(user=request.user,thread=thread)
		thread.likes_count=Like.objects.filter(thread=thread).count()
		thread.save()
		return Response(ThreadSerializer(thread,context={'request':request}).data,status=status.HTTP_201_CREATED)
	def delete(self,request,pk):
		thread=get_object_or_404(Thread,id=pk)
		get_object_or_404(Like,user=request.user,thread=thread).delete()
		thread.likes_count=Like.objects.filter(thread=thread).count()
		thread.save()
		return Response(ThreadSerializer(thread,context={'request':request}).data,status=status.HTTP_200_OK)
class RegisterView(APIView):
	permission_classes=[permissions.AllowAny]
	def post(self,request):
		serializer=UserRegisterSerializer(data=request.data)
		if not serializer.is_valid():
			logger.error(f"Validation errors: {serializer.errors}")
			return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)
		try:
			user=serializer.save()
			token=Token.objects.create(user=user)
			logger.info(f"User created: {user.username}")
			return Response({
				"message":"Registration successful",
				"token":token.key,
				"user_id":user.id,
				"username":user.username,
				"is_admin":user.is_superuser,
				"email": user.email
			},status=status.HTTP_201_CREATED)
		except Exception as e:
			logger.error(f"Error: {str(e)}")
			return Response({"error":str(e)},status=status.HTTP_400_BAD_REQUEST)

class LoginView(APIView):
	permission_classes=[permissions.AllowAny]
	
	def get(self, request):
		# Временный GET метод для отладки
		return Response({
			'message': 'Login endpoint working. Use POST for login.',
			'method': 'POST required',
			'example': {
				'username': 'testuser',
				'password': 'testpass123'
			}
		})
	
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
	authentication_classes=[TokenAuthentication]
	permission_classes=[permissions.IsAuthenticated]
	def post(self,request):
		request.user.auth_token.delete()
		return Response({"message":"Successfully logged out"},status=status.HTTP_200_OK)
class ThreadListCreateView(generics.ListCreateAPIView):
	queryset=Thread.objects.all().order_by('-created_at')
	serializer_class=ThreadSerializer
	permission_classes=[permissions.IsAuthenticatedOrReadOnly]
	authentication_classes=[TokenAuthentication]
	def perform_create(self,serializer):
		serializer.save(author=self.request.user)
class AdminThreadListView(generics.ListAPIView):
	queryset=Thread.objects.all().order_by('-created_at')
	serializer_class=AdminThreadSerializer
	permission_classes=[permissions.IsAdminUser]
	authentication_classes=[TokenAuthentication]
	def get_queryset(self):
		queryset=super().get_queryset()
		if search:=self.request.query_params.get('search'):
			queryset=queryset.filter(title__icontains=search)
		return queryset
class AdminThreadDeleteView(generics.DestroyAPIView):
	queryset=Thread.objects.all()
	serializer_class=AdminThreadSerializer
	permission_classes=[permissions.IsAdminUser]
	authentication_classes=[TokenAuthentication]
	def perform_destroy(self,instance):
		instance.delete()
		return Response({'status':'Thread deleted'},status=status.HTTP_204_NO_CONTENT)
class CommentDeleteView(generics.DestroyAPIView):
	queryset=Comment.objects.all()
	serializer_class=CommentSerializer
	permission_classes=[permissions.IsAuthenticated]
	authentication_classes=[TokenAuthentication]
	def get_object(self):
		comment=get_object_or_404(Comment,id=self.kwargs['pk'])
		if comment.author!=self.request.user and not self.request.user.is_superuser:
			raise PermissionDenied("У вас нет прав для удаления этого комментария.")
		return comment
	def perform_destroy(self,instance):
		thread=instance.thread
		instance.delete()
		thread.comments_count=Comment.objects.filter(thread=thread).count()
		thread.save()
		return Response({'status':'Комментарий удален'},status=status.HTTP_204_NO_CONTENT)


class UserProfileView(APIView):
	permission_classes = [permissions.IsAuthenticated]
	authentication_classes = [TokenAuthentication]

	def get(self, request):
		page = int(request.GET.get('page', 1))
		page_size = int(request.GET.get('page_size', 10))
		
		# Созданные треды с пагинацией
		user_threads = Thread.objects.filter(author=request.user).order_by('-created_at')
		total_threads = user_threads.count()
		start = (page - 1) * page_size
		end = start + page_size
		user_threads_page = user_threads[start:end]
		
		# Лайкнутые треды
		liked_threads = Thread.objects.filter(likes__user=request.user).order_by('-created_at')
		liked_threads_data = ThreadSerializer(liked_threads[:10], many=True, context={'request': request}).data
		
		profile_data = {
			'user': {
				'id': request.user.id,
				'username': request.user.username,
				'email': request.user.email,
				'date_joined': request.user.date_joined,
				'is_admin': request.user.is_superuser
			},
			'threads': ThreadSerializer(user_threads_page, many=True, context={'request': request}).data,
			'threads_count': total_threads,
			'total_comments': Comment.objects.filter(author=request.user).count(),
			'total_likes': Like.objects.filter(user=request.user).count(),
			'liked_threads': liked_threads_data,
			'liked_threads_count': liked_threads.count(),
			'pagination': {
				'current_page': page,
				'page_size': page_size,
				'total_pages': (total_threads + page_size - 1) // page_size,
				'has_next': end < total_threads,
				'has_prev': page > 1
			}
		}
		
		return Response(profile_data)


class UserLikedThreadsView(APIView):
	permission_classes = [permissions.IsAuthenticated]
	authentication_classes = [TokenAuthentication]

	def get(self, request):
		page = int(request.GET.get('page', 1))
		page_size = int(request.GET.get('page_size', 10))
		
		# Лайкнутые треды с пагинацией
		liked_threads = Thread.objects.filter(likes__user=request.user).order_by('-created_at')
		total_liked = liked_threads.count()
		start = (page - 1) * page_size
		end = start + page_size
		liked_threads_page = liked_threads[start:end]
		
		response_data = {
			'liked_threads': ThreadSerializer(liked_threads_page, many=True, context={'request': request}).data,
			'liked_threads_count': total_liked,
			'pagination': {
				'current_page': page,
				'page_size': page_size,
				'total_pages': (total_liked + page_size - 1) // page_size,
				'has_next': end < total_liked,
				'has_prev': page > 1
			}
		}
		
		return Response(response_data)


class AdminStatisticsView(APIView):
	permission_classes = [permissions.IsAdminUser]
	authentication_classes = [TokenAuthentication]

	def get(self, request):
		# Общая статистика
		total_users = User.objects.count()
		total_threads = Thread.objects.count()
		total_comments = Comment.objects.count()
		total_likes = Like.objects.count()
		
		# Статистика за последние 7 дней
		from django.utils import timezone
		from datetime import timedelta
		
		seven_days_ago = timezone.now() - timedelta(days=7)
		
		new_users_last_7_days = User.objects.filter(date_joined__gte=seven_days_ago).count()
		new_threads_last_7_days = Thread.objects.filter(created_at__gte=seven_days_ago).count()
		new_comments_last_7_days = Comment.objects.filter(created_at__gte=seven_days_ago).count()
		new_likes_last_7_days = Like.objects.filter(created_at__gte=seven_days_ago).count()
		
		# Топ активных пользователей
		top_users_by_threads = User.objects.annotate(
			thread_count=models.Count('thread')
		).order_by('-thread_count')[:10]
		
		top_users_by_comments = User.objects.annotate(
			comment_count=models.Count('comment')
		).order_by('-comment_count')[:10]
		
		# Статистика по категориям
		category_stats = Thread.objects.values('category').annotate(
			count=models.Count('id'),
			comments_count=models.Count('comment'),
			likes_count=models.Count('like')
		).order_by('-count')
		
		# Ежедневная активность за последние 30 дней
		thirty_days_ago = timezone.now() - timedelta(days=30)
		daily_activity = []
		
		for i in range(30):
			date = thirty_days_ago + timedelta(days=i)
			from datetime import datetime
			date_start = timezone.make_aware(datetime.combine(date, datetime.min.time()))
			date_end = date_start + timedelta(days=1)
			
			daily_activity.append({
				'date': date.strftime('%Y-%m-%d'),
				'threads': Thread.objects.filter(created_at__gte=date_start, created_at__lt=date_end).count(),
				'comments': Comment.objects.filter(created_at__gte=date_start, created_at__lt=date_end).count(),
				'users': User.objects.filter(date_joined__gte=date_start, date_joined__lt=date_end).count()
			})
		
		statistics_data = {
			'overview': {
				'total_users': total_users,
				'total_threads': total_threads,
				'total_comments': total_comments,
				'total_likes': total_likes
			},
			'last_7_days': {
				'new_users': new_users_last_7_days,
				'new_threads': new_threads_last_7_days,
				'new_comments': new_comments_last_7_days,
				'new_likes': new_likes_last_7_days
			},
			'top_users': {
				'by_threads': [
					{
						'username': user.username,
						'thread_count': user.thread_count
					} for user in top_users_by_threads
				],
				'by_comments': [
					{
						'username': user.username,
						'comment_count': user.comment_count
					} for user in top_users_by_comments
				]
			},
			'categories': list(category_stats),
			'daily_activity': daily_activity
		}
		
		return Response(statistics_data)
