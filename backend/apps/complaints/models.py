from django.db import models
from django.utils import timezone
from apps.users.models import User
from apps.students.models import Student


class Complaint(models.Model):
    STATUS_CHOICES = [
        ('SUBMITTED', 'Submitted'),
        ('UNDER_REVIEW', 'Under Review'),
        ('RESOLVED', 'Resolved'),
    ]

    student = models.ForeignKey(
        Student,
        on_delete=models.CASCADE,
        related_name='complaints')
    content = models.TextField()
    submitted_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='SUBMITTED')
    response_content = models.TextField(blank=True)
    responded_at = models.DateTimeField(null=True, blank=True)
    responded_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='responded_complaints')
    is_overdue = models.BooleanField(default=False)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'complaints'
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['submitted_at']),
        ]

    def __str__(self):
        return f"Complaint by {self.student.user.email} - {self.status}"

    def check_overdue(self):
        from django.conf import settings
        if self.status != 'RESOLVED':
            days_since_submission = (timezone.now() - self.submitted_at).days
            if days_since_submission > settings.COMPLAINT_RESPONSE_DEADLINE_DAYS:
                self.is_overdue = True
                self.save()
                return True
        return False
