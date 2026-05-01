from django.db import models
from apps.users.models import User
from apps.stages.models import Stage
from apps.students.models import Student  # Added import for Student model


class Activity(models.Model):
    STATUS_CHOICES = [
        ('PLANNED', 'Planned'),
        ('COMPLETED', 'Completed'),
    ]

    stage = models.ForeignKey(
        Stage,
        on_delete=models.CASCADE,
        related_name='activities')
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_activities')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    planned_date = models.DateTimeField()
    completed_date = models.DateTimeField(null=True, blank=True)
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='PLANNED')
    marked_done_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='completed_activities')
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


class Meeting(models.Model):
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('CONFIRMED', 'Confirmed'),
        ('COMPLETED', 'Completed'),
    ]

    student = models.ForeignKey(
        Student,
        on_delete=models.CASCADE,
        related_name='meetings')
    supervisor = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='supervised_meetings')
    scheduled_date = models.DateTimeField()
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='PENDING')
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'meetings'
        ordering = ['scheduled_date']
        indexes = [
            models.Index(fields=['student', 'status']),
            models.Index(fields=['scheduled_date']),
        ]

    def __str__(self):
        return f"Meeting with {self.student.user.email} on {self.scheduled_date.strftime('%Y-%m-%d %H:%M')}"
