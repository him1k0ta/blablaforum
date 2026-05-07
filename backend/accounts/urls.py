from django.urls import path
from .views import (
    ThreadListCreateView,
    ThreadDetailView,
    RegisterView,
    LoginView,
    LogoutView,
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('auth/login/', LoginView.as_view(), name='login'),
    path('auth/logout/', LogoutView.as_view(), name='logout'),
    path('threads/', ThreadListCreateView.as_view(), name='thread-list'),
    path('threads/<int:pk>/', ThreadDetailView.as_view(), name='thread-detail'),
]
