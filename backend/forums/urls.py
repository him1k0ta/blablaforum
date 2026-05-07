from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BoardViewSet, PostViewSet, BoardThreadsView
from .serializers import BoardSerializer, PostSerializer

router = DefaultRouter()
router.register(r'boards', BoardViewSet)
router.register(r'posts', PostViewSet)

urlpatterns = [
    path('api/', include(router.urls)),
    path('api/boards/<int:board_id>/threads/', BoardThreadsView.as_view({'get': 'list'}), name='board-threads'),
]
