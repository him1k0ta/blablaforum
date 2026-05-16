from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BoardViewSet, PostViewSet, BoardThreadsView
from .serializers import BoardSerializer, PostSerializer

router = DefaultRouter()
router.register(r'boards', BoardViewSet, basename='board')
router.register(r'posts', PostViewSet, basename='post')

urlpatterns = [
    path('', include(router.urls)),
    path('boards/<slug:slug>/threads/', BoardThreadsView.as_view(), name='board-threads'),
]
