from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone

User = get_user_model()


class ModerationQueue(models.Model):
    """
    Модель очереди на модерацию для сообщений с пометкой "токсично".
    """
    STATUS_CHOICES = [
        ('pending', 'В ожидании'),
        ('approved', 'Одобрено'),
        ('rejected', 'Отклонено'),
        ('deleted', 'Удалено'),
    ]

    CONTENT_TYPE_CHOICES = [
        ('thread', 'Тред'),
        ('comment', 'Комментарий'),
        ('post', 'Пост'),
    ]

    content_type = models.CharField(
        max_length=20,
        choices=CONTENT_TYPE_CHOICES,
        verbose_name='Тип контента'
    )
    content_id = models.PositiveIntegerField(verbose_name='ID контента')
    content_data = models.JSONField(default=dict, verbose_name='Данные контента')
    reported_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='reported_content',
        verbose_name='Пожаловался'
    )
    reason = models.TextField(blank=True, verbose_name='Причина жалобы')
    toxicity_score = models.FloatField(
        null=True,
        blank=True,
        verbose_name='Оценка токсичности'
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending',
        verbose_name='Статус'
    )
    moderated_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='moderated_content',
        verbose_name='Модератор'
    )
    moderated_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name='Дата модерации'
    )
    moderator_comment = models.TextField(
        blank=True,
        verbose_name='Комментарий модератора'
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Дата создания')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Дата обновления')

    class Meta:
        verbose_name = 'Очередь модерации'
        verbose_name_plural = 'Очереди модерации'
        ordering = ['-created_at']

    def __str__(self):
        return f"Moderation for {self.content_type} by {self.reported_by}"

    def approve(self, moderator, comment=''):
        """Одобрить контент."""
        self.status = 'approved'
        self.moderated_by = moderator
        self.moderated_at = timezone.now()
        self.moderator_comment = comment
        self.save()

    def reject(self, moderator, comment=''):
        """Отклонить жалобу."""
        self.status = 'rejected'
        self.moderated_by = moderator
        self.moderated_at = timezone.now()
        self.moderator_comment = comment
        self.save()

    def delete_content(self, moderator, comment=''):
        """Удалить контент."""
        self.status = 'deleted'
        self.moderated_by = moderator
        self.moderated_at = timezone.now()
        self.moderator_comment = comment
        self.save()
