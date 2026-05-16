from django.urls import path, include
from rest_framework import routers
from .views import ModerationQueueViewSet

router = routers.DefaultRouter()
router.register(r'moderation', ModerationQueueViewSet)

urlpatterns = [
    path('api/', include(router.urls)),
    # Дополнительные URL для действий модерации
    path('api/moderation/<int:pk>/approve/', ModerationQueueViewSet.as_view({'post': 'approve'}), name='moderation-approve'),
    path('api/moderation/<int:pk>/reject/', ModerationQueueViewSet.as_view({'post': 'reject'}), name='moderation-reject'),
    path('api/moderation/<int:pk>/delete/', ModerationQueueViewSet.as_view({'post': 'delete_content'}), name='moderation-delete'),
]
