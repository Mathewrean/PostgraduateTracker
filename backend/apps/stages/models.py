from django.db import models
from django.utils import timezone
from datetime import timedelta
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

    @property
    def required_document_types(self):
        mapping = {
            'CONCEPT': ['TRANSCRIPT', 'FEE_STATEMENT'],
            'PROPOSAL': ['FEE_STATEMENT', 'PROPOSAL'],
            'THESIS': ['THESIS', 'INTENT_TO_SUBMIT', 'FEE_STATEMENT'],
        }
        return mapping.get(self.stage_type, [])

    @property
    def requires_minutes(self):
        return self.stage_type in ['CONCEPT', 'PROPOSAL']

    def missing_document_types(self):
        from apps.documents.models import Document

        uploaded_docs = set(
            Document.objects.filter(stage=self, doc_type__in=self.required_document_types)
            .values_list('doc_type', flat=True)
        )
        missing = [doc_type for doc_type in self.required_document_types if doc_type not in uploaded_docs]
        if self.requires_minutes and not hasattr(self, 'minutes'):
            missing.insert(0, 'MINUTES')
        return missing

    def incomplete_activity_titles(self):
        return list(
            self.activities.filter(status='PLANNED').values_list('title', flat=True)
        )

    def minutes_approved(self):
        if not self.requires_minutes:
            return True
        return bool(hasattr(self, 'minutes') and self.minutes.is_approved)

    def approval_blockers(self):
        blockers = {}
        missing_docs = self.missing_document_types()
        if missing_docs:
            blockers['missing_documents'] = missing_docs

        incomplete_activities = self.incomplete_activity_titles()
        if incomplete_activities:
            blockers['incomplete_activities'] = incomplete_activities

        if self.requires_minutes and hasattr(self, 'minutes') and not self.minutes.is_approved:
            blockers['minutes'] = ['Minutes of Presentation must be approved by the assigned supervisor']

        if self.requires_minutes and not hasattr(self, 'minutes'):
            blockers['minutes'] = ['Minutes of Presentation must be uploaded and approved']

        return blockers

    def check_thesis_submission_complete(self):
        """Lock thesis stage for 90 days once all required thesis documents are uploaded."""
        if self.stage_type != 'THESIS':
            return False

        from apps.documents.models import Document

        required_doc_types = set(self.required_document_types)
        uploaded_docs = set(
            Document.objects.filter(stage=self, doc_type__in=required_doc_types)
            .values_list('doc_type', flat=True)
        )

        if required_doc_types.issubset(uploaded_docs) and self.status != 'IN_PROGRESS':
            submitted_at = timezone.now()
            self.status = 'IN_PROGRESS'
            self.thesis_submission_date = submitted_at
            self.three_month_unlock_date = submitted_at + timedelta(days=90)
            self.save(update_fields=['status', 'thesis_submission_date', 'three_month_unlock_date'])
            return True

        return False
