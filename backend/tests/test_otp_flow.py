import time

from apps.users.models import EmailOTP, User
from apps.users.views import (
    PasswordResetConfirmView,
    PasswordResetRequestView,
    ResendOTPView,
    VerifyOTPView,
)
from rest_framework import status
from rest_framework.test import APIClient, APITestCase


class OTPFlowTests(APITestCase):
    def setUp(self):
        self.client = APIClient()
        timestamp = str(int(time.time() * 1000))[-6:]
        self.email = f'otp_test_{timestamp}@example.com'
        self.phone = f'+2547{timestamp}'
        self.password = 'TestPass123'
        self.user = User.objects.create_user(
            email=self.email,
            phone=self.phone,
            password=self.password,
            is_active=True,
        )

    def test_registration_emits_otp(self):
        response = self.client.post('/api/users/register/', {
            'full_name': 'OTP Test',
            'email': f'reg_{self.email}',
            'admission_number': f'ADM{int(time.time()*1000)}',
            'phone': f'+2547000000{self.email[-2:]}',
            'password': self.password,
            'password_confirm': self.password,
            'role': 'student',
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_password_reset_request_generic_message(self):
        response = self.client.post('/api/auth/password-reset/', {
            'email': self.email,
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('reset code', response.data['message'])

    def test_password_reset_confirm_sets_new_password(self):
        self.client.post('/api/auth/password-reset/', {
            'email': self.email,
        })
        otp = self.user.email_otp.code
        response = self.client.post('/api/auth/password-reset/confirm/', {
            'email': self.email,
            'otp': otp,
            'new_password': 'NewPass456',
            'new_password_confirm': 'NewPass456',
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password('NewPass456'))
        self.assertIsNotNone(self.user.email_otp.used_at)

    def test_password_reset_wrong_code_fails(self):
        self.client.post('/api/auth/password-reset/', {
            'email': self.email,
        })
        response = self.client.post('/api/auth/password-reset/confirm/', {
            'email': self.email,
            'otp': '000000',
            'new_password': 'NewPass456',
            'new_password_confirm': 'NewPass456',
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password(self.password))

    def test_resend_otp_returns_message(self):
        response = self.client.post('/api/auth/resend-otp/', {
            'email': self.email,
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
