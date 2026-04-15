from django.db import models
from django.core.validators import FileExtensionValidator
from django.conf import settings
from apps.users.models import User
from apps.stages.models import Stage
from apps.students.models import Student
import os

class Document(models.Model):
    DOC_TYPE_CHOICES = [
        ('MINUTES', 'Minutes of Presentation'),
        ('TRANSCRIPT', 'Academic Transcript'),
        ('FEE_STATEMENT', 'Fee Statement Balance'),
        ('PROPOSAL', 'Proposal Document'),
        ('THESIS', 'Thesis Document'),
        ('INTENT_TO_SUBMIT', 'Intent to Submit Form'),
        ('OTHER', 'Other'),
    ]

    stage = models.ForeignKey(Stage, on_delete=models.CASCADE, related_name='documents')
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='documents')
    doc_type = models.CharField(max_length=50, choices=DOC_TYPE_CHOICES)
    file = models.FileField(upload_to='documents/%Y/%m/%d/', validators=[
        FileExtensionValidator(allowed_extensions=['pdf', 'doc', 'docx'])
    ])
    uploaded_at = models.DateTimeField(auto_now_add=True)
    file_size = models.BigIntegerField(null=True, blank=True)
    is_verified = models.BooleanField(default=False)
    verified_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='verified_documents')
    verified_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'documents'
        indexes = [
            models.Index(fields=['stage', 'doc_type']),
            models.Index(fields=['student']),
        ]

    def __str__(self):
        return f"{self.student.user.email} - {self.doc_type}"

    def save(self, *args, **kwargs):
        if self.file:
            self.file_size = self.file.size
        super().save(*args, **kwargs)

class Minutes(models.Model):
    stage = models.OneToOneField(Stage, on_delete=models.CASCADE, related_name='minutes')
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='minutes')
    file = models.FileField(upload_to='minutes/%Y/%m/%d/')
    uploaded_at = models.DateTimeField(auto_now_add=True)
    is_approved = models.BooleanField(default=False)
    approved_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='approved_minutes')
    approved_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'minutes'
        verbose_name_plural = 'Minutes'

    def __str__(self):
        return f"Minutes - {self.student.user.email}"
