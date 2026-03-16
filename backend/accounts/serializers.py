"""
Сериализаторы для API приложения форума.
"""
from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from .models import Thread, Like, Comment, Tag


User = get_user_model()


class UserRegisterSerializer(serializers.ModelSerializer):
    """Сериализатор для регистрации пользователя."""
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password2']
        extra_kwargs = {'email': {'required': True}}

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs

    def create(self, validated_data):
        return User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )


class UserLoginSerializer(serializers.Serializer):
    """Сериализатор для входа пользователя."""
    username = serializers.CharField(required=True)
    password = serializers.CharField(write_only=True, required=True)


class TagSerializer(serializers.ModelSerializer):
    """Сериализатор для тегов."""
    
    class Meta:
        model = Tag
        fields = ['id', 'name', 'created_at']
        read_only_fields = ['created_at']


class CommentSerializer(serializers.ModelSerializer):
    """Сериализатор для комментариев."""
    author = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = Comment
        fields = ['id', 'text', 'author', 'created_at']
        read_only_fields = ['author', 'created_at']


class ThreadSerializer(serializers.ModelSerializer):
    """Сериализатор для тредов."""
    author = serializers.StringRelatedField(read_only=True)
    tags = TagSerializer(many=True, read_only=True)
    likes_count = serializers.SerializerMethodField()
    comments_count = serializers.SerializerMethodField()
    is_liked = serializers.SerializerMethodField()

    class Meta:
        model = Thread
        fields = [
            'id', 'title', 'content', 'author', 'created_at', 'updated_at',
            'views', 'category', 'tags', 'likes_count', 'comments_count', 'is_liked'
        ]
        read_only_fields = ['author', 'created_at', 'updated_at', 'views']

    def get_likes_count(self, obj):
        return obj.likes.count()

    def get_comments_count(self, obj):
        return obj.comments.count()

    def get_is_liked(self, obj):
        request = self.context.get('request')
        return request and request.user.is_authenticated and obj.likes.filter(user=request.user).exists()


class AdminThreadSerializer(serializers.ModelSerializer):
    """Сериализатор для тредов в админке."""
    author = serializers.StringRelatedField()
    tags = TagSerializer(many=True, read_only=True)
    likes_count = serializers.SerializerMethodField()
    comments_count = serializers.SerializerMethodField()

    class Meta:
        model = Thread
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at', 'views']

    def get_likes_count(self, obj):
        return obj.likes.count()

    def get_comments_count(self, obj):
        return obj.comments.count()


class LikeSerializer(serializers.ModelSerializer):
    """Сериализатор для лайков."""
    
    class Meta:
        model = Like
        fields = ['id', 'user', 'thread', 'created_at']
        read_only_fields = ['user', 'thread', 'created_at']