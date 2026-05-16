from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone

class User(AbstractUser):
    """
    Расширенная модель пользователя.
    """
    avatar = models.ImageField(
        upload_to='avatars/',
        blank=True,
        null=True,
        verbose_name='Аватар'
    )
    
    class Meta:
        verbose_name = 'Пользователь'
        verbose_name_plural = 'Пользователи'

class Tag(models.Model):
    """
    Модель тегов для категоризации тредов.
    """
    name = models.CharField(max_length=50, unique=True)
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        verbose_name = 'Тег'
        verbose_name_plural = 'Теги'
        ordering = ['name']

    def __str__(self):
        return self.name

class Thread(models.Model):
    """
    Модель треда (обсуждения).
    """
    title = models.CharField(max_length=200)
    content = models.TextField()
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='threads')
    board = models.ForeignKey('forums.Board', on_delete=models.CASCADE, related_name='threads', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    views = models.PositiveIntegerField(default=0)
    posts_count = models.PositiveIntegerField(default=0)  # Количество постов в треде
    bump_time = models.DateTimeField(default=timezone.now)  # Для сортировки по последнему ответу
    category = models.CharField(max_length=100, blank=True, null=True)
    tags = models.ManyToManyField('Tag', related_name='threads', blank=True)

    class Meta:
        verbose_name = 'Тред'
        verbose_name_plural = 'Треды'
        ordering = ['-created_at']

    def __str__(self):
        return self.title

    def increment_views(self):
        """Увеличивает счетчик просмотров треда."""
        self.views += 1
        self.save(update_fields=['views'])

    def refresh_comment_count(self):
        self.comments_count = self.comments.count()
        self.save(update_fields=['comments_count'])

    def increment_posts_count(self):
        """Увеличивает счетчик постов."""
        self.posts_count += 1
        self.save(update_fields=['posts_count'])

    def can_bump(self):
        """Проверяет, можно ли бампнуть тред."""
        if not self.is_bump_allowed:
            return False, "Бамп запрещен для этого треда"
        
        # Проверяем лимит постов
        MAX_POSTS_LIMIT = 1000
        if self.posts_count >= MAX_POSTS_LIMIT:
            return False, f"Достигнут лимит постов ({MAX_POSTS_LIMIT})"
        
        # Проверяем время жизни треда (например, 7 дней)
        from datetime import timedelta
        if timezone.now() - self.created_at > timedelta(days=7):
            return False, "Тред слишком старый для бампа"
        
        return True, "Бамп разрешен"

    def bump_thread(self):
        """Обновляет bump_time треда."""
        can_bump, message = self.can_bump()
        if can_bump:
            self.bump_time = timezone.now()
            self.save(update_fields=['bump_time'])
        return can_bump, message

class Comment(models.Model):
    """
    Модель комментария к треду.
    """
    thread = models.ForeignKey(
        Thread,
        on_delete=models.CASCADE,
        related_name='comments'
    )
    author = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='comments'
    )
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    parent = models.ForeignKey(
        'self',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='replies'
    )
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Комментарий'
        verbose_name_plural = 'Комментарии'
        ordering = ['created_at']

    def __str__(self):
        return f"Comment by {self.author.username} on {self.thread.title}"

    @property
    def is_reply(self):
        """Проверяет, является ли комментарий ответом."""
        return self.parent is not None

class Like(models.Model):
    """
    Модель лайка для треда.
    """
    thread = models.ForeignKey(Thread, on_delete=models.CASCADE, related_name='likes')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='likes')
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        unique_together = ('thread', 'user')
        verbose_name = 'Лайк'
        verbose_name_plural = 'Лайки'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user} likes {self.thread}"
    
    def save(self, *args, **kwargs):
        """При сохранении лайка проверяем, первый ли это лайк пользователя."""
        is_new = self.pk is None
        super().save(*args, **kwargs)
        
        # Если это первый лайк пользователя в треде, добавляем в избранное
        if is_new:
            from .models import FavoriteThread
            favorite, created = FavoriteThread.objects.get_or_create(
                user=self.user,
                thread=self.thread
            )
            if created:
                print(f"Тред {self.thread.title} добавлен в избранное для пользователя {self.user.username}")
    
    def delete(self, *args, **kwargs):
        """При удалении лайка проверяем, есть ли другие лайки пользователя в треде."""
        thread_id = self.thread_id
        user_id = self.user_id
        super().delete(*args, **kwargs)
        
        # Если других лайков нет, удаляем из избранного
        remaining_likes = Like.objects.filter(thread_id=thread_id, user_id=user_id).exists()
        if not remaining_likes:
            from .models import FavoriteThread
            try:
                favorite = FavoriteThread.objects.get(user_id=user_id, thread_id=thread_id)
                favorite.delete()
                print(f"Тред удален из избранного для пользователя {self.user.username}")
            except FavoriteThread.DoesNotExist:
                pass

class FavoriteThread(models.Model):
    """
    Модель избранных тредов.
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='favorite_threads')
    thread = models.ForeignKey(Thread, on_delete=models.CASCADE, related_name='favorited_by')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'thread')
        verbose_name = 'Избранный тред'
        verbose_name_plural = 'Избранные треды'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user} favorited {self.thread}"