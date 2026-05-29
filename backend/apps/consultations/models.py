from django.db import models
from django.utils import timezone

from apps.stages.models import Stage
from apps.students.models import Student
from apps.users.models import User


class ConsultationForm(models.Model):
    FORM_TYPE_CHOICES = [
        ('monthly', 'Monthly'),
        ('bimonthly', 'Bimonthly'),
    ]
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('submitted', 'Submitted'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]

    student = models.ForeignKey(
        Student,
        on_delete=models.CASCADE,
        related_name='consultation_forms')
    supervisor = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='consultation_forms')
    stage = models.ForeignKey(
        Stage,
        on_delete=models.CASCADE,
        related_name='consultation_forms')
    form_type = models.CharField(max_length=20, choices=FORM_TYPE_CHOICES)
    consultation_date = models.DateField()
    topics_discussed = models.TextField()
    decisions_made = models.TextField()
    action_items = models.TextField()
    submitted_at = models.DateTimeField(null=True, blank=True)
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='draft')
    approval_trail = models.JSONField(default=list, blank=True)
    minutes_file = models.FileField(
        upload_to='consultation_minutes/%Y/%m/%d/',
        null=True,
        blank=True)
    minutes_uploaded_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='uploaded_consultation_minutes')
    minutes_uploaded_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'consultation_forms'
        ordering = ['-consultation_date', '-created_at']
        indexes = [
            models.Index(fields=['student', 'stage']),
            models.Index(fields=['supervisor', 'status']),
            models.Index(fields=['status']),
        ]

    def __str__(self):
        return (
            f'{self.student.user.email} - {self.stage.stage_type} - '
            f'{self.form_type}')

    def append_trail(self, actor, action, signature='', comment=''):
        entry = {
            'actor_name': actor.get_full_name() or actor.email,
            'actor_role': actor.role_key,
            'action': action,
            'timestamp': timezone.now().isoformat(),
            'signature': signature,
            'comment': comment,
        }
        self.approval_trail = [*self.approval_trail, entry]
        self.save(update_fields=['approval_trail', 'updated_at'])
        return entry
