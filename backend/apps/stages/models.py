from django.db import models
from apps.users.models import User
from apps.students.models import Student

class Stage(models.Model):
    STAGE_TYPES = [
        ('CONCEPT', 'Concept'),
        ('PROPOSAL', 'Proposal'),
        ('THESIS', 'Thesis Submission'),
    ]
    
    STATUS_CHOICES = [
        ('ACTIVE', 'Active'),
        ('COMPLETED', 'Completed'),
        ('IN_PROGRESS', 'In Progress'),
        ('LOCKED', 'Locked'),
    ]

    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='stages')
    stage_type = models.CharField(max_length=20, choices=STAGE_TYPES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='ACTIVE')
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    approved_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='approved_stages')
    approval_date = models.DateTimeField(null=True, blank=True)
    thesis_submission_date = models.DateTimeField(null=True, blank=True)
    three_month_unlock_date = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'stages'
        unique_together = ('student', 'stage_type')
        indexes = [
            models.Index(fields=['student', 'stage_type']),
            models.Index(fields=['status']),
        ]

    def __str__(self):
        return f"{self.student.user.email} - {self.stage_type}"
