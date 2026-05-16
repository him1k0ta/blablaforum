from rest_framework import serializers
from .models import Board, Post


class BoardSerializer(serializers.ModelSerializer):
    class Meta:
        model = Board
        fields = ['id', 'name', 'description', 'slug', 'created_at', 'is_active', 'position']
        read_only_fields = ['id', 'created_at']


class PostSerializer(serializers.ModelSerializer):
    author_username = serializers.CharField(source='author.username', read_only=True)
    thread_title = serializers.CharField(source='thread.title', read_only=True)
    
    class Meta:
        model = Post
        fields = ['id', 'thread', 'author', 'content', 'created_at', 'updated_at', 
                  'is_op', 'is_sage', 'image', 'author_username', 'thread_title']
        read_only_fields = ['id', 'created_at', 'updated_at', 'author_username', 'thread_title']
