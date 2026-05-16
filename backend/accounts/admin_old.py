from django.contrib import admin
from django.urls import path
from django.shortcuts import render
from django.http import JsonResponse
from django.utils import timezone
from datetime import timedelta
from django.db.models import Count, Q
from .models import User, Thread, Comment, Like, Tag

# Создаем простую модель для статистики
from django.db import models

class Statistics(models.Model):
    """Фиктивная модель для отображения статистики в админке"""
    class Meta:
        verbose_name = "Статистика"
        verbose_name_plural = "Статистика"
        app_label = "accounts"

@admin.register(Statistics)
class StatisticsAdmin(admin.ModelAdmin):
    """Кастомная админка для отображения статистики"""
    
    def has_add_permission(self, request):
        return False
    
    def has_change_permission(self, request, obj=None):
        return False
    
    def has_delete_permission(self, request, obj=None):
        return False
    
    def changelist_view(self, request, extra_context=None):
        # Получаем статистику
        now = timezone.now()
        seven_days_ago = now - timedelta(days=7)
        one_hour_ago = now - timedelta(hours=1)
        
        # Недавно созданные треды
        recent_threads = Thread.objects.filter(
            created_at__gte=seven_days_ago
        ).order_by('-created_at')[:10]
        
        # Очень недавние треды (за последний час)
        very_recent_threads = Thread.objects.filter(
            created_at__gte=one_hour_ago
        ).order_by('-created_at')[:5]
        
        # Недавние комментарии
        recent_comments = Comment.objects.filter(
            created_at__gte=seven_days_ago
        ).order_by('-created_at')[:10]
        
        # Недавние лайки
        recent_likes = Like.objects.filter(
            created_at__gte=seven_days_ago
        ).order_by('-created_at')[:10]
        
        # Новые пользователи
        new_users = User.objects.filter(
            date_joined__gte=seven_days_ago
        ).order_by('-date_joined')[:10]
        
        # Статистика по категориям
        category_stats = Thread.objects.values('category').annotate(
            count=Count('id'),
            recent_count=Count('id', filter=Q(created_at__gte=seven_days_ago))
        ).order_by('-count')[:10]
        
        # Активные пользователи
        active_users = User.objects.annotate(
            thread_count=Count('thread', filter=Q(thread__created_at__gte=seven_days_ago)),
            comment_count=Count('comment', filter=Q(comment__created_at__gte=seven_days_ago))
        ).filter(
            Q(thread_count__gt=0) | Q(comment_count__gt=0)
        ).order_by('-thread_count', '-comment_count')[:10]
        
        context = {
            **(extra_context or {}),
            'title': 'Статистика сайта',
            'recent_threads': recent_threads,
            'very_recent_threads': very_recent_threads,
            'recent_comments': recent_comments,
            'recent_likes': recent_likes,
            'new_users': new_users,
            'category_stats': category_stats,
            'active_users': active_users,
            'total_threads': Thread.objects.count(),
            'total_comments': Comment.objects.count(),
            'total_users': User.objects.count(),
            'total_likes': Like.objects.count(),
            'threads_last_7_days': Thread.objects.filter(created_at__gte=seven_days_ago).count(),
            'comments_last_7_days': Comment.objects.filter(created_at__gte=seven_days_ago).count(),
            'users_last_7_days': User.objects.filter(date_joined__gte=seven_days_ago).count(),
            'likes_last_7_days': Like.objects.filter(created_at__gte=seven_days_ago).count(),
        }
        
        # Используем кастомный шаблон
        return render(request, 'admin/statistics.html', context)
    
    def get_urls(self):
        urls = super().get_urls()
        custom_urls = [
            path('statistics/', self.admin_site.admin_view(self.changelist_view), name='statistics'),
        ]
        return custom_urls + urls

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ['username', 'email', 'is_staff', 'is_superuser', 'date_joined']
    list_filter = ['is_staff', 'is_superuser', 'date_joined']
    search_fields = ['username', 'email']
    ordering = ['-date_joined']

@admin.register(Thread)
class ThreadAdmin(admin.ModelAdmin):
    list_display = ['title', 'author', 'created_at', 'views', 'category']
    list_filter = ['created_at', 'category', 'tags']
    search_fields = ['title', 'content', 'author__username']
    ordering = ['-created_at']
    filter_horizontal = ['tags']

@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ['author', 'thread', 'created_at', 'is_reply']
    list_filter = ['created_at', 'thread']
    search_fields = ['text', 'author__username', 'thread__title']
    ordering = ['-created_at']

@admin.register(Like)
class LikeAdmin(admin.ModelAdmin):
    list_display = ['user', 'thread', 'created_at']
    list_filter = ['created_at', 'thread']
    search_fields = ['user__username', 'thread__title']
    ordering = ['-created_at']

@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    list_display = ['name', 'created_at']
    search_fields = ['name']
    ordering = ['name']

class StatisticsAdmin(admin.ModelAdmin):
    """Кастомная админка для отображения статистики"""
    
    def has_add_permission(self, request):
        return False
    
    def has_change_permission(self, request, obj=None):
        return False
    
    def has_delete_permission(self, request, obj=None):
        return False
    
    def changelist_view(self, request, extra_context=None):
        # Получаем статистику
        now = timezone.now()
        seven_days_ago = now - timedelta(days=7)
        one_hour_ago = now - timedelta(hours=1)
        
        # Недавно созданные треды
        recent_threads = Thread.objects.filter(
            created_at__gte=seven_days_ago
        ).order_by('-created_at')[:10]
        
        # Очень недавние треды (за последний час)
        very_recent_threads = Thread.objects.filter(
            created_at__gte=one_hour_ago
        ).order_by('-created_at')[:5]
        
        # Недавние комментарии
        recent_comments = Comment.objects.filter(
            created_at__gte=seven_days_ago
        ).order_by('-created_at')[:10]
        
        # Недавние лайки
        recent_likes = Like.objects.filter(
            created_at__gte=seven_days_ago
        ).order_by('-created_at')[:10]
        
        # Новые пользователи
        new_users = User.objects.filter(
            date_joined__gte=seven_days_ago
        ).order_by('-date_joined')[:10]
        
        # Статистика по категориям
        category_stats = Thread.objects.values('category').annotate(
            count=Count('id'),
            recent_count=Count('id', filter=Q(created_at__gte=seven_days_ago))
        ).order_by('-count')[:10]
        
        # Активные пользователи
        active_users = User.objects.annotate(
            thread_count=Count('thread', filter=Q(thread__created_at__gte=seven_days_ago)),
            comment_count=Count('comment', filter=Q(comment__created_at__gte=seven_days_ago))
        ).filter(
            Q(thread_count__gt=0) | Q(comment_count__gt=0)
        ).order_by('-thread_count', '-comment_count')[:10]
        
        context = {
            **(extra_context or {}),
            'title': 'Статистика сайта',
            'recent_threads': recent_threads,
            'very_recent_threads': very_recent_threads,
            'recent_comments': recent_comments,
            'recent_likes': recent_likes,
            'new_users': new_users,
            'category_stats': category_stats,
            'active_users': active_users,
            'total_threads': Thread.objects.count(),
            'total_comments': Comment.objects.count(),
            'total_users': User.objects.count(),
            'total_likes': Like.objects.count(),
            'threads_last_7_days': Thread.objects.filter(created_at__gte=seven_days_ago).count(),
            'comments_last_7_days': Comment.objects.filter(created_at__gte=seven_days_ago).count(),
            'users_last_7_days': User.objects.filter(date_joined__gte=seven_days_ago).count(),
            'likes_last_7_days': Like.objects.filter(created_at__gte=seven_days_ago).count(),
        }
        
        # Используем кастомный шаблон
        return render(request, 'admin/statistics.html', context)
    
    def get_urls(self):
        urls = super().get_urls()
        custom_urls = [
            path('statistics/', self.admin_site.admin_view(self.changelist_view), name='statistics'),
        ]
        return custom_urls + urls

# Регистрируем кастомную админку для статистики
admin.site.register(StatisticsAdmin)
