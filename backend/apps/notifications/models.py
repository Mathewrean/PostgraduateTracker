from django.db import models
from apps.users.models import User


class Notification(models.Model):
    NOTIFICATION_TYPES = [
        ('ACTIVITY_REMINDER', 'Activity Reminder'),
        ('DOCUMENT_UPLOAD', 'Document Upload'),
        ('SUPERVISOR_APPROVAL', 'Supervisor Approval'),
        ('MINUTES_APPROVAL', 'Minutes Approval'),
        ('COMPLAINT_RECEIVED', 'Complaint Received'),
        ('COMPLAINT_RESPONSE', 'Complaint Response'),
        ('COMPLAINT_OVERDUE', 'Complaint Overdue'),
        ('MEETING_REQUEST', 'Meeting Request'),
        ('STAGE_BLOCKED', 'Stage Completion Blocked'),
    ]

    recipient = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='notifications')
    message = models.TextField()
    notification_type = models.CharField(
        max_length=50, choices=NOTIFICATION_TYPES)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    link = models.CharField(max_length=500, blank=True)

    class Meta:
        db_table = 'notifications'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['recipient', 'is_read']),
            models.Index(fields=['created_at']),
        ]

    def __str__(self):
        return f"{self.recipient.email} - {self.notification_type}"
