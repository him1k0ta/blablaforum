from django.urls import path
from .views import (
    ThreadListCreateView,
    ThreadDetailView,
    LikeThreadView,
    CommentView,  # Используем объединенный класс CommentView вместо CommentListView и CommentCreateView
    RegisterView,
    LoginView,
    LogoutView,
    AdminThreadListView,
    AdminThreadDeleteView,
    VerifyTokenView,
    CommentDeleteView
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('auth/login/', LoginView.as_view(), name='login'),
    path('auth/logout/', LogoutView.as_view(), name='logout'),
    path('auth/verify/', VerifyTokenView.as_view(), name='verify-token'),
    path('comments/<int:pk>/', CommentDeleteView.as_view(), name='comment-delete'),

    path('threads/', ThreadListCreateView.as_view(), name='thread-list'),
    path('threads/<int:pk>/', ThreadDetailView.as_view(), name='thread-detail'),
    path('threads/<int:pk>/like/', LikeThreadView.as_view(), name='thread-like'),

    # Объединенный путь для комментариев (GET и POST)
    path('threads/<int:pk>/comments/', CommentView.as_view(), name='comment-list'),

    # Удален путь 'threads/<int:pk>/comments/create/' так как он теперь объединен

    path('admin/threads/', AdminThreadListView.as_view(), name='admin-thread-list'),
    path('admin/threads/<int:pk>/', AdminThreadDeleteView.as_view(), name='admin-thread-delete'),
]