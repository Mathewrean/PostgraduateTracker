# Tests for users app
from django.test import TestCase
from .models import User

class UserModelTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email='test@example.com',
            admission_number='ADM001',
            phone='+254712345678',
            password='testpass123',
            first_name='Test',
            last_name='User'
        )

    def test_user_creation(self):
        self.assertEqual(self.user.email, 'test@example.com')
        self.assertEqual(self.user.admission_number, 'ADM001')
        self.assertTrue(self.user.is_active)

    def test_user_full_name(self):
        self.assertEqual(self.user.get_full_name(), 'Test User')

    def test_user_password_hashing(self):
        self.assertNotEqual(self.user.password, 'testpass123')
        self.assertTrue(self.user.check_password('testpass123'))
