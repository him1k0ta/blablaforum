from rest_framework import serializers
from .models import ModerationQueue


class ModerationQueueSerializer(serializers.ModelSerializer):
    content_type_display = serializers.CharField(source='get_content_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    reported_by_username = serializers.CharField(source='reported_by.username', read_only=True)
    moderated_by_username = serializers.CharField(source='moderated_by.username', read_only=True)
    
    class Meta:
        model = ModerationQueue
        fields = ['id', 'content_type', 'content_id', 'content_data', 'reported_by',
                  'reason', 'toxicity_score', 'status', 'moderated_by', 
                  'moderated_at', 'moderator_comment', 'created_at', 'updated_at',
                  'content_type_display', 'status_display', 'reported_by_username',
                  'moderated_by_username']
        read_only_fields = ['id', 'created_at', 'updated_at', 'content_type_display',
                           'status_display', 'reported_by_username', 'moderated_by_username']
