# Django Management Command to Initialize PST

from django.core.management.base import BaseCommand
from apps.users.models import User
from apps.supervisors.models import Supervisor


class Command(BaseCommand):
    help = 'Initialize PST with default data'

    def handle(self, *args, **options):
        # Create default supervisor users
        supervisors_data = [
            {'email': 'okello@jooust.ac.ke', 'name': 'Professor Okello', 'role': 'dean'},
            {'email': 'magotu@jooust.ac.ke', 'name': 'Dr. Prisca Magotu', 'role': 'cod'},
            {'email': 'titus@jooust.ac.ke', 'name': 'Prof. Miner Titus', 'role': 'supervisor'},
            {'email': 'nyakinda@jooust.ac.ke', 'name': 'Dr. Joseph Nyakinda', 'role': 'supervisor'},
            {'email': 'kangojo@jooust.ac.ke', 'name': 'Dr. Willy Kangojo', 'role': 'coordinator'},
            {'email': 'owino@jooust.ac.ke', 'name': 'Dr. Julius Owino', 'role': 'supervisor'},
            {'email': 'odhiambo@jooust.ac.ke', 'name': 'Dr. Francis Akwenda Odhiambo', 'role': 'supervisor'},
            {'email': 'director_bps@jooust.ac.ke', 'name': 'Director BPS', 'role': 'director_bps'},
        ]

        for sup_data in supervisors_data:
            user, created = User.objects.get_or_create(
                email=sup_data['email'],
                defaults={
                    'admission_number': sup_data['email'].split('@')[0],
                    'phone': '+254700000000',
                    'first_name': sup_data['name'].split()[0],
                    'last_name': ' '.join(sup_data['name'].split()[1:]),
                    'role': sup_data['role'],
                }
            )

            if created:
                user.set_password('defaultpassword123')
                user.save()
                self.stdout.write(f'Created user: {sup_data["email"]} ({sup_data["role"]})')

            if sup_data['role'] == 'supervisor':
                Supervisor.objects.get_or_create(
                    user=user,
                    defaults={'department': 'Pure and Applied Mathematics'}
                )

        self.stdout.write(self.style.SUCCESS('Successfully initialized PST'))
