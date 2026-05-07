from rest_framework import generics, permissions, status, request
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.authtoken.models import Token
from rest_framework.authentication import TokenAuthentication
from django.contrib.auth import authenticate
from django.shortcuts import get_object_or_404
from .models import Thread, Like, Comment, User
from .serializers import (
	UserRegisterSerializer,
	UserLoginSerializer,
	ThreadSerializer,
	CommentSerializer,
	AdminThreadSerializer,
	LikeSerializer
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
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = UserLoginSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        user = authenticate(
            username=serializer.validated_data['username'],
            password=serializer.validated_data['password']
        )
        if not user:
            return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)
        token = Token.objects.get_or_create(user=user)[0]
        return Response({
            "token": token.key,
            "user_id": user.id,
            "username": user.username,
            "email": user.email,
            "is_superuser": user.is_superuser
        })


class LogoutView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        request.user.auth_token.delete()
        return Response({"message": "Successfully logged out"}, status=status.HTTP_200_OK)


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
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    def perform_destroy(self, instance):
        if not request.user.is_admin():
            raise PermissionDenied("Только администратор может удалять треды")
        instance.delete()
        return Response({'status': 'Тред удален'}, status=status.HTTP_204_NO_CONTENT)
