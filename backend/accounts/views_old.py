from rest_framework import generics, permissions, status, request
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework.authentication import TokenAuthentication
from django.contrib.auth import authenticate
from django.shortcuts import get_object_or_404
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from .models import Thread, Like, Comment, User
from .serializers import (
	UserRegisterSerializer,
	UserLoginSerializer,
	ThreadSerializer,
	CommentSerializer,
	AdminThreadSerializer,
	LikeSerializer,
	UserProfileSerializer
)
import logging

logger = logging.getLogger(__name__)


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
		serializer = self.get_serializer(instance)
		return Response(serializer.data)

	def perform_destroy(self, instance):
		if not self.request.user.is_superuser:
			raise PermissionDenied("Только администратор может удалять треды")
		instance.delete()
		return Response({'status': 'Тред удален'}, status=status.HTTP_204_NO_CONTENT)


class VerifyTokenView(APIView):
	authentication_classes = [TokenAuthentication]
	permission_classes = [permissions.IsAuthenticated]

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
	
	@method_decorator(csrf_exempt, name='dispatch')
	def dispatch(self, request, *args, **kwargs):
		return super().dispatch(request, *args, **kwargs)
	
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
@method_decorator(csrf_exempt, name='dispatch')
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


class UserProfileView(generics.RetrieveAPIView):
	serializer_class = UserProfileSerializer
	permission_classes = [permissions.IsAuthenticated]
	authentication_classes = [TokenAuthentication]

	def get_object(self):
		user_threads = Thread.objects.filter(author=self.request.user).order_by('-created_at')
		return {
			'user': {
				'id': self.request.user.id,
				'username': self.request.user.username,
				'email': self.request.user.email,
				'date_joined': self.request.user.date_joined,
				'is_admin': self.request.user.is_superuser
			},
			'threads': ThreadSerializer(user_threads, many=True, context={'request': self.request}).data,
			'threads_count': user_threads.count(),
			'total_comments': Comment.objects.filter(author=self.request.user).count(),
			'total_likes': Like.objects.filter(user=self.request.user).count()
		}