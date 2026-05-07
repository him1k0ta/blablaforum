from django.urls import path
from .views import ModerationQueueViewSet

urlpatterns = [
    path('api/moderation/', ModerationQueueViewSet.as_view({
        'get': 'list',
        'post': 'create'
    }), name='moderation-queue'),
]
