from django.test import TestCase
from django.utils import timezone
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework.test import APIClient
from apps.users.models import User
from apps.students.models import Student
from apps.stages.models import Stage
from apps.documents.models import Document, Minutes


class StageApprovalWorkflowTests(TestCase):
    def setUp(self):
        self.client = APIClient()

        self.student_user = User.objects.create_user(
            email='stage_student@test.com',
            admission_number='STAGE001',
            phone='+254712345600',
            password='testpass123',
            role='student'
        )
        self.student = Student.objects.get(user=self.student_user)

        self.supervisor_user = User.objects.create_user(
            email='stage_supervisor@test.com',
            admission_number='SUP001',
            phone='+254712345601',
            password='testpass123',
            role='supervisor'
        )

        self.student.assigned_supervisor = self.supervisor_user
        self.student.save(update_fields=['assigned_supervisor'])

        self.stage_concept = Stage.objects.get(
            student=self.student,
            stage_type='CONCEPT'
        )

    def make_pdf_file(self, name='document.pdf'):
        return SimpleUploadedFile(
            name,
            b"%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF",
            content_type='application/pdf'
        )

    def test_supervisor_can_approve_concept_stage_and_progress_student(self):
        self.client.force_authenticate(user=self.supervisor_user)

        Document.objects.create(
            stage=self.stage_concept,
            student=self.student,
            doc_type='TRANSCRIPT',
            file=self.make_pdf_file('transcript.pdf')
        )
        Document.objects.create(
            stage=self.stage_concept,
            student=self.student,
            doc_type='FEE_STATEMENT',
            file=self.make_pdf_file('fee_statement.pdf')
        )

        Minutes.objects.create(
            stage=self.stage_concept,
            student=self.student,
            file=self.make_pdf_file('minutes.pdf'),
            is_approved=True,
            approved_by=self.supervisor_user,
            approved_at=timezone.now()
        )

        response = self.client.post(f'/api/stages/{self.stage_concept.id}/approve/')
        self.assertEqual(response.status_code, 200)

        self.stage_concept.refresh_from_db()
        self.student.refresh_from_db()

        self.assertEqual(self.stage_concept.status, 'COMPLETED')
        self.assertEqual(self.student.current_stage, 'PROPOSAL')
        self.assertTrue(Stage.objects.filter(student=self.student, stage_type='PROPOSAL').exists())

    def test_student_cannot_approve_stage(self):
        self.client.force_authenticate(user=self.student_user)
        response = self.client.post(f'/api/stages/{self.stage_concept.id}/approve/')
        self.assertEqual(response.status_code, 403)

    def test_approval_fails_when_requirements_are_missing(self):
        self.client.force_authenticate(user=self.supervisor_user)
        response = self.client.post(f'/api/stages/{self.stage_concept.id}/approve/')
        self.assertEqual(response.status_code, 400)
        self.assertIn('missing_document_types', response.data)
