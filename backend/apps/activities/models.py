from django.db import models
from apps.users.models import User
from apps.stages.models import Stage

class Activity(models.Model):
    STATUS_CHOICES = [
        ('PLANNED', 'Planned'),
        ('COMPLETED', 'Completed'),
    ]

    stage = models.ForeignKey(Stage, on_delete=models.CASCADE, related_name='activities')
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='created_activities')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    planned_date = models.DateTimeField()
    completed_date = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PLANNED')
    marked_done_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='completed_activities')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'activities'
        ordering = ['planned_date']
        indexes = [
            models.Index(fields=['stage', 'status']),
            models.Index(fields=['planned_date']),
        ]

    def __str__(self):
        return f"{self.title} - {self.status}"
