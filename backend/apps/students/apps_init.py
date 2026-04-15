from django.apps import AppConfig

class StudentsConfigInit(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.students'

    def ready(self):
        import apps.students.signals
