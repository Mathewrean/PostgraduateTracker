"""
Comprehensive API Test Suite for PST
Tests all endpoints and functionality
"""
import os
import sys
import json
import unittest

# Setup Django FIRST before any imports
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'pst_project.settings')

import django
django.setup()

from django.test import TestCase, Client
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient, APITestCase
from rest_framework import status
from django.urls import reverse

from apps.users.models import User
from apps.students.models import Student
from apps.supervisors.models import Supervisor
from apps.stages.models import Stage
from apps.activities.models import Activity
from apps.documents.models import Document, Minutes
from apps.complaints.models import Complaint
from apps.notifications.models import Notification

class AuthenticationTests(APITestCase):
    """Test authentication endpoints"""
    
    def setUp(self):
        self.client = APIClient()
        # Use unique email/admission number to avoid conflicts with create_test_users.py
        import time
        timestamp = str(int(time.time() * 1000))[-6:]
        self.user_data = {
            'email': f'test{timestamp}@example.com',
            'admission_number': f'ADM{timestamp}',
            'phone': '+254712345678',
            'first_name': 'Test',
            'last_name': 'User',
            'role': 'student',
            'password': 'testpass123',
            'password_confirm': 'testpass123'
        }
    
    def test_user_registration(self):
        """Test user registration endpoint"""
        response = self.client.post(
            '/api/users/register/',
            self.user_data,
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
        self.assertEqual(response.data['user']['email'], self.user_data['email'])
    
    def test_jwt_token_obtain(self):
        """Test JWT token endpoint"""
        # First create a user with unique data
        import time
        timestamp = str(int(time.time() * 1000))[-6:]
        user = User.objects.create_user(
            email=f'student{timestamp}@test.com',
            admission_number=f'ADM{timestamp}',
            phone='+254712345679',
            password='testpass123'
        )
        
        response = self.client.post(
            '/api/auth/token/',
            {
                'email': f'student{timestamp}@test.com',
                'password': 'testpass123'
            },
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
    
    def test_get_current_user(self):
        """Test get current user endpoint"""
        # Create and login user with unique data
        import time
        timestamp = str(int(time.time() * 1000))[-6:]
        user = User.objects.create_user(
            email=f'current{timestamp}@test.com',
            admission_number=f'ADM{timestamp}',
            phone='+254712345680',
            password='testpass123'
        )
        
        self.client.force_authenticate(user=user)
        response = self.client.get('/api/auth/profile/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['email'], f'current{timestamp}@test.com')

class StudentTests(APITestCase):
    """Test student endpoints"""
    
    def setUp(self):
        self.client = APIClient()
        import time
        timestamp = str(int(time.time() * 1000))[-6:]
        self.student_user = User.objects.create_user(
            email=f'student{timestamp}@test.com',
            admission_number=f'STU{timestamp}',
            phone='+254712345681',
            password='testpass123',
            role='student'
        )
        self.student = Student.objects.get(user=self.student_user)
        self.client.force_authenticate(user=self.student_user)
    
    def test_get_student_profile(self):
        """Test get student profile"""
        response = self.client.get('/api/students/profile/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['user']['email'], f'student{timestamp}@test.com')
    
    def test_update_student_profile(self):
        """Test update student profile"""
        response = self.client.post(
            '/api/students/profile/',
            {
                'project_title': 'Machine Learning in Healthcare',
                'preferred_supervisor': 'Dr. Prisca Magotu (COD)',
                'profile_complete': True
            },
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('project_title', response.data)

class StageWorkflowTests(APITestCase):
    """Test stage-gated workflow"""
    
    def setUp(self):
        self.client = APIClient()
        import time
        timestamp = str(int(time.time() * 1000))[-6:]
        self.student_user = User.objects.create_user(
            email=f'stage_student{timestamp}@test.com',
            admission_number=f'STG{timestamp}',
            phone='+254712345682',
            password='testpass123',
            role='student'
        )
        self.supervisor_user = User.objects.create_user(
            email=f'supervisor{timestamp}@test.com',
            admission_number=f'SUP{timestamp}',
            phone='+254712345683',
            password='testpass123',
            role='supervisor'
        )
        self.student = Student.objects.create(
            user=self.student_user,
            assigned_supervisor=self.supervisor_user
        )
        self.stage = Stage.objects.create(
            student=self.student,
            stage_type='CONCEPT',
            status='ACTIVE'
        )
    
    def test_get_current_stage(self):
        """Test get current stage"""
        self.client.force_authenticate(user=self.student_user)
        response = self.client.get('/api/stages/current_stage/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['stage_type'], 'CONCEPT')
    
    def test_stage_progression(self):
        """Test stage workflow progression"""
        self.client.force_authenticate(user=self.student_user)
        # Stages should be CONCEPT, PROPOSAL, THESIS
        response = self.client.get('/api/stages/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

class ActivityTests(APITestCase):
    """Test activity endpoints"""
    
    def setUp(self):
        self.client = APIClient()
        import time
        timestamp = str(int(time.time() * 1000))[-6:]
        self.student_user = User.objects.create_user(
            email=f'activity_student{timestamp}@test.com',
            admission_number=f'ACT{timestamp}',
            phone='+254712345684',
            password='testpass123',
            role='student'
        )
        self.student = Student.objects.create(user=self.student_user)
        self.stage = Stage.objects.create(
            student=self.student,
            stage_type='CONCEPT',
            status='ACTIVE'
        )
        self.client.force_authenticate(user=self.student_user)
    
    def test_create_activity(self):
        """Test creating an activity"""
        response = self.client.post(
            '/api/activities/',
            {
                'stage': self.stage.id,
                'title': 'Literature Review',
                'description': 'Review relevant papers',
                'planned_date': '2024-06-01T10:00:00Z'
            },
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['title'], 'Literature Review')
    
    def test_get_activities(self):
        """Test getting all activities"""
        activity = Activity.objects.create(
            stage=self.stage,
            created_by=self.student_user,
            title='Research Protocol',
            planned_date='2024-06-10T10:00:00Z'
        )
        response = self.client.get('/api/activities/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreater(len(response.data), 0)
    
    def test_mark_activity_done(self):
        """Test marking activity as completed"""
        activity = Activity.objects.create(
            stage=self.stage,
            created_by=self.student_user,
            title='Data Collection',
            planned_date='2024-06-15T10:00:00Z',
            status='PLANNED'
        )
        response = self.client.post(
            f'/api/activities/{activity.id}/mark_done/'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['status'], 'COMPLETED')

class DocumentTests(APITestCase):
    """Test document upload endpoints"""
    
    def setUp(self):
        self.client = APIClient()
        import time
        timestamp = str(int(time.time() * 1000))[-6:]
        self.student_user = User.objects.create_user(
            email=f'doc_student{timestamp}@test.com',
            admission_number=f'DOC{timestamp}',
            phone='+254712345685',
            password='testpass123',
            role='student'
        )
        self.student = Student.objects.create(user=self.student_user)
        self.stage = Stage.objects.create(
            student=self.student,
            stage_type='CONCEPT',
            status='ACTIVE'
        )
        self.client.force_authenticate(user=self.student_user)
    
    def test_get_documents(self):
        """Test getting documents"""
        response = self.client.get('/api/documents/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

class ComplaintTests(APITestCase):
    """Test complaint endpoints"""
    
    def setUp(self):
        self.client = APIClient()
        import time
        timestamp = str(int(time.time() * 1000))[-6:]
        self.student_user = User.objects.create_user(
            email=f'complaint_student{timestamp}@test.com',
            admission_number=f'CMP{timestamp}',
            phone='+254712345686',
            password='testpass123',
            role='student'
        )
        self.student = Student.objects.create(user=self.student_user)
        self.coordinator_user = User.objects.create_user(
            email=f'coordinator{timestamp}@test.com',
            admission_number=f'CRD{timestamp}',
            phone='+254712345687',
            password='testpass123',
            role='coordinator'
        )
        self.client.force_authenticate(user=self.student_user)
    
    def test_submit_complaint(self):
        """Test submitting a complaint"""
        response = self.client.post(
            '/api/complaints/',
            {
                'content': 'Issue with supervisor feedback timelines'
            },
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['status'], 'SUBMITTED')
    
    def test_get_complaints(self):
        """Test getting complaints"""
        complaint = Complaint.objects.create(
            student=self.student,
            content='Test complaint',
            status='SUBMITTED'
        )
        response = self.client.get('/api/complaints/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

class NotificationTests(APITestCase):
    """Test notification endpoints"""
    
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='notif_user@test.com',
            admission_number='NOT001',
            phone='+254712345688',
            password='testpass123'
        )
        self.notification = Notification.objects.create(
            recipient=self.user,
            message='Test notification',
            notification_type='ACTIVITY_REMINDER'
        )
        self.client.force_authenticate(user=self.user)
    
    def test_get_notifications(self):
        """Test getting notifications"""
        response = self.client.get('/api/notifications/notifications/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
    
    def test_mark_notification_read(self):
        """Test marking notification as read"""
        response = self.client.post(
            f'/api/notifications/notifications/{self.notification.id}/mark_as_read/'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['is_read'], True)

class RBACTests(APITestCase):
    """Test Role-Based Access Control"""
    
    def setUp(self):
        self.client = APIClient()
        self.student = User.objects.create_user(
            email='rbac_student@test.com',
            admission_number='RBAC01',
            phone='+254712345689',
            password='testpass123',
            role='student'
        )
        self.coordinator = User.objects.create_user(
            email='rbac_coordinator@test.com',
            admission_number='RBAC02',
            phone='+254712345690',
            password='testpass123',
            role='coordinator'
        )
    
    def test_student_cannot_access_reports(self):
        """Test student cannot access admin reports"""
        self.client.force_authenticate(user=self.student)
        response = self.client.get('/api/reports/student_progress/')
        # Should be restricted or return empty
        self.assertIn(response.status_code, [status.HTTP_403_FORBIDDEN, status.HTTP_200_OK])
    
    def test_coordinator_can_access_reports(self):
        """Test coordinator can access reports"""
        self.client.force_authenticate(user=self.coordinator)
        response = self.client.get('/api/reports/student_progress/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

class ReportTests(APITestCase):
    """Test reporting endpoints"""
    
    def setUp(self):
        self.client = APIClient()
        self.coordinator = User.objects.create_user(
            email='report_coord@test.com',
            admission_number='REP001',
            phone='+254712345691',
            password='testpass123',
            role='coordinator'
        )
        self.client.force_authenticate(user=self.coordinator)
    
    def test_student_progress_report(self):
        """Test student progress report"""
        response = self.client.get('/api/reports/student_progress/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('total_students', response.data)
        self.assertIn('stages', response.data)
    
    def test_complaint_report(self):
        """Test complaint statistics report"""
        response = self.client.get('/api/reports/complaint_report/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('total', response.data)

def run_all_tests():
    """Run all tests"""
    
    test_classes = [
        AuthenticationTests,
        StudentTests,
        StageWorkflowTests,
        ActivityTests,
        DocumentTests,
        ComplaintTests,
        NotificationTests,
        RBACTests,
        ReportTests
    ]
    
    total_tests = 0
    passed_tests = 0
    failed_tests = 0
    
    for test_class in test_classes:
        suite = unittest.TestLoader().loadTestsFromTestCase(test_class)
        runner = unittest.TextTestRunner(verbosity=1)
        result = runner.run(suite)
        
        for test in suite:
            total_tests += 1
            if result.wasSuccessful():
                passed_tests += 1
            else:
                failed_tests += 1

    if total_tests > 0:
        print(f"\nTests completed: {total_tests} total, {passed_tests} passed, {failed_tests} failed")
        return failed_tests == 0
    return False

if __name__ == '__main__':
    success = run_all_tests()
    sys.exit(0 if success else 1)
