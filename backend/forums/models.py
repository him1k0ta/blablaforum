from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone

User = get_user_model()


class Board(models.Model):
    """
    Модель доски (раздела форума).
    """
    name = models.CharField(max_length=100, unique=True, verbose_name='Название доски')
    description = models.TextField(blank=True, verbose_name='Описание')
    slug = models.SlugField(max_length=100, unique=True, verbose_name='Slug')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Дата создания')
    is_active = models.BooleanField(default=True, verbose_name='Активна')
    position = models.PositiveIntegerField(default=0, verbose_name='Позиция')

    class Meta:
        verbose_name = 'Доска'
        verbose_name_plural = 'Доски'
        ordering = ['position', 'name']

    def __str__(self):
        return self.name

    def get_absolute_url(self):
        return f'/board/{self.slug}/'


class Post(models.Model):
    """
    Модель поста (сообщения) в треде.
    """
    thread = models.ForeignKey(
        'accounts.Thread',
        on_delete=models.CASCADE,
        related_name='posts',
        verbose_name='Тред'
    )
    author = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='posts',
        verbose_name='Автор'
    )
    content = models.TextField(verbose_name='Содержание')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Дата создания')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Дата обновления')
    is_op = models.BooleanField(default=False, verbose_name='Оригинальный пост')
    image = models.ImageField(
        upload_to='post_images/',
        blank=True,
        null=True,
        verbose_name='Изображение'
    )

    class Meta:
        verbose_name = 'Пост'
        verbose_name_plural = 'Посты'
        ordering = ['created_at']

    def __str__(self):
        return f"Post by {self.author.username} in {self.thread.title[:50]}"

    def save(self, *args, **kwargs):
        # Если это первый пост в треде, отмечаем его как OP
        if not self.pk and self.thread.posts.count() == 0:
            self.is_op = True
        super().save(*args, **kwargs)
