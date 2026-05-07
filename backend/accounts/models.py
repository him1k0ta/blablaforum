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
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    views = models.PositiveIntegerField(default=0)
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