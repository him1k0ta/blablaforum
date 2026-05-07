from django.urls import path
from .views import (
    ThreadListCreateView,
    ThreadDetailView,
    RegisterView,
    LoginView,
    LogoutView,
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView,
    UserProfileView,
    LikeView,
    FavoriteView,
    CommentView,
    SearchView,
)

urlpatterns = [
    # Регистрация и авторизация
    path('register/', RegisterView.as_view(), name='register'),
    path('auth/login/', LoginView.as_view(), name='login'),
    path('auth/logout/', LogoutView.as_view(), name='logout'),
    path('auth/verify/', TokenVerifyView.as_view(), name='token_verify'),
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Треды
    path('threads/', ThreadListCreateView.as_view(), name='thread-list'),
    path('threads/<int:pk>/', ThreadDetailView.as_view(), name='thread-detail'),
    path('threads/<int:pk>/comments/', CommentView.as_view(), name='thread-comments'),
    
    # Профиль и действия
    path('profile/<int:user_id>/', UserProfileView.as_view(), name='user-profile'),
    path('profile/', UserProfileView.as_view(), name='current-user-profile'),
    path('likes/', LikeView.as_view(), name='like'),
    path('favorites/', FavoriteView.as_view(), name='favorites'),
    
    # Поиск
    path('search/', SearchView.as_view(), name='search'),
]
