#!/usr/bin/env python
"""
Script to create test users for PST application
"""
from apps.students.models import Student
from apps.users.models import User
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'pst_project.settings')
django.setup()


# Test user data
test_users = [
    {
        'email': 'student@test.com',
        'password': 'student123',
        'first_name': 'John',
        'last_name': 'Doe',
        'role': 'student',
        'admission_number': 'STU001'
    },
    {
        'email': 'student@example.com',
        'password': 'password123',
        'first_name': 'Jane',
        'last_name': 'Smith',
        'role': 'student',
        'admission_number': 'STU002'
    },
    {
        'email': 'supervisor@test.com',
        'password': 'supervisor123',
        'first_name': 'Prof',
        'last_name': 'Supervisor',
        'role': 'supervisor',
        'admission_number': 'SUP001'
    },
    {
        'email': 'coordinator@test.com',
        'password': 'coordinator123',
        'first_name': 'Dr',
        'last_name': 'Coordinator',
        'role': 'coordinator',
        'admission_number': 'COORD001'
    },
    {
        'email': 'dean@test.com',
        'password': 'dean123',
        'first_name': 'Dean',
        'last_name': 'Faculty',
        'role': 'dean',
        'admission_number': 'DEAN001'
    },
    {
        'email': 'cod@test.com',
        'password': 'cod123',
        'first_name': 'COD',
        'last_name': 'User',
        'role': 'cod',
        'admission_number': 'COD001'
    },
    {
        'email': 'director@test.com',
        'password': 'director123',
        'first_name': 'Director',
        'last_name': 'BPS',
        'role': 'director_bps',
        'admission_number': 'DIR001'
    },
]

for user_data in test_users:
    try:
        user, created = User.objects.get_or_create(
            email=user_data['email'],
            defaults={
                'first_name': user_data['first_name'],
                'last_name': user_data['last_name'],
                'role': user_data['role'],
                'admission_number': user_data['admission_number'],
                'phone': '+254700000000',
            }
        )

        if created:
            pass  # User was created
        else:
            user.first_name = user_data['first_name']
            user.last_name = user_data['last_name']
            user.role = user_data['role']
            user.phone = '+254700000000'
            user.set_password(user_data['password'])
            user.save()

        if user_data['role'] == 'student':
            # Find a supervisor user to assign as preferred supervisor
            supervisor_user = User.objects.filter(role='supervisor').first()
            student_profile, student_created = Student.objects.get_or_create(
                user=user,
                defaults={
                    'project_title': f"Research Project by {user_data['first_name']}",
                    'preferred_supervisor': supervisor_user,
                    'profile_complete': True,
                }
            )
            if student_created:
                pass  # Student profile was created

    except Exception as e:
        print(f"Error creating user {user_data['email']}: {e}")

print("Test users created successfully!")
