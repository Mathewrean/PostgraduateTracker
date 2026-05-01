from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework import status
from rest_framework.test import APITestCase

from apps.activities.models import Activity
from apps.audit.models import AuditLog
from apps.complaints.models import Complaint
from apps.documents.models import Minutes
from apps.stages.models import Stage
from apps.students.models import Student
from apps.users.models import User


class ContractAuditTests(APITestCase):
    def setUp(self):
        self.student_user = User.objects.create_user(
            email='student.audit@test.com',
            admission_number='AUD001',
            phone='+254700000001',
            password='student123',
            role='student',
            first_name='Audit',
            last_name='Student',
        )
        self.supervisor_user = User.objects.create_user(
            email='supervisor.audit@test.com',
            admission_number='AUD002',
            phone='+254700000002',
            password='supervisor123',
            role='supervisor',
            first_name='Audit',
            last_name='Supervisor',
        )
        self.coordinator_user = User.objects.create_user(
            email='coordinator.audit@test.com',
            admission_number='AUD003',
            phone='+254700000003',
            password='coordinator123',
            role='coordinator',
        )
        self.dean_user = User.objects.create_user(
            email='dean.audit@test.com',
            admission_number='AUD004',
            phone='+254700000004',
            password='dean12345',
            role='dean',
        )
        self.cod_user = User.objects.create_user(
            email='cod.audit@test.com',
            admission_number='AUD005',
            phone='+254700000005',
            password='cod12345',
            role='cod',
        )
        self.director_user = User.objects.create_user(
            email='director.audit@test.com',
            admission_number='AUD006',
            phone='+254700000006',
            password='director123',
            role='director_bps',
        )

        self.student = Student.objects.get(user=self.student_user)
        self.student.project_title = 'Contract Audit Project'
        self.student.preferred_supervisor = 'Dr. Willy Kangojo (Coordinator)'
        self.student.profile_complete = True
        self.student.assigned_supervisor = self.supervisor_user
        self.student.save()
        self.student_user.refresh_from_db()

        self.concept_stage = Stage.objects.get(student=self.student, stage_type='CONCEPT')

    def _authenticate(self, user):
        self.client.force_authenticate(user=user)

    def _pdf_upload(self, name='sample.pdf'):
        return SimpleUploadedFile(name, b'%PDF-1.4\n1 0 obj\n<<>>\nendobj\n', content_type='application/pdf')

    def _invalid_upload(self, name='fake.pdf'):
        return SimpleUploadedFile(name, b'not-a-pdf', content_type='application/pdf')

    def test_auth_profile_endpoint_returns_student_payload(self):
        self._authenticate(self.student_user)
        response = self.client.get('/api/auth/profile/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['email'], self.student_user.email)
        self.assertEqual(response.data['role'], 'student')
        self.assertTrue(response.data['profile_complete'])

    def test_student_list_is_forbidden_to_student(self):
        self._authenticate(self.student_user)
        response = self.client.get('/api/students/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_document_upload_rejects_spoofed_mime(self):
        self._authenticate(self.student_user)
        response = self.client.post(
            '/api/documents/',
            {
                'stage': self.concept_stage.id,
                'doc_type': 'TRANSCRIPT',
                'file': self._invalid_upload(),
            },
            format='multipart',
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)

    def test_stage_approval_is_blocked_until_minutes_are_approved(self):
        self._authenticate(self.student_user)
        self.client.post(
            '/api/documents/',
            {'stage': self.concept_stage.id, 'doc_type': 'TRANSCRIPT', 'file': self._pdf_upload('transcript.pdf')},
            format='multipart',
        )
        self.client.post(
            '/api/documents/',
            {'stage': self.concept_stage.id, 'doc_type': 'FEE_STATEMENT', 'file': self._pdf_upload('fees.pdf')},
            format='multipart',
        )
        self.client.post(
            '/api/minutes/',
            {'stage': self.concept_stage.id, 'file': self._pdf_upload('minutes.pdf')},
            format='multipart',
        )
        Activity.objects.create(
            stage=self.concept_stage,
            created_by=self.student_user,
            title='Prepare concept notes',
            planned_date='2026-05-02T09:00:00Z',
            status='COMPLETED',
            marked_done_by=self.student_user,
        )

        self._authenticate(self.supervisor_user)
        response = self.client.post(f'/api/stages/{self.concept_stage.id}/approve/')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('minutes', response.data)

    def test_stage_approval_returns_missing_documents_and_incomplete_activities(self):
        Activity.objects.create(
            stage=self.concept_stage,
            created_by=self.student_user,
            title='Unfinished activity',
            planned_date='2026-05-02T09:00:00Z',
            status='PLANNED',
        )
        self._authenticate(self.supervisor_user)
        response = self.client.post(f'/api/stages/{self.concept_stage.id}/approve/')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('missing_document_types', response.data)

    def test_complaint_submission_notifies_admin_chain(self):
        self._authenticate(self.student_user)
        response = self.client.post('/api/complaints/', {'content': 'Need help with feedback delay.'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertNotIn('recipient', response.data)
        self.assertEqual(Complaint.objects.count(), 1)

    def test_audit_log_access_for_dean_and_denial_for_coordinator(self):
        AuditLog.objects.create(
            user=self.student_user,
            action='LOGIN',
            description='Test login',
            ip_address='127.0.0.1',
        )

        self._authenticate(self.coordinator_user)
        denied = self.client.get('/api/logs/')
        self.assertEqual(denied.status_code, status.HTTP_403_FORBIDDEN)

        self._authenticate(self.dean_user)
        allowed = self.client.get('/api/logs/')
        self.assertEqual(allowed.status_code, status.HTTP_200_OK)
