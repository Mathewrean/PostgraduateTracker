from django.contrib.auth import get_user_model
from django.contrib.auth.backends import ModelBackend
from django.db.models import Q


class EmailOrPhoneBackend(ModelBackend):
    def authenticate(self, request, username=None, password=None, **kwargs):
        UserModel = get_user_model()
        identifier = (
            kwargs.get('identifier')
            or kwargs.get('email')
            or kwargs.get(UserModel.USERNAME_FIELD)
            or username
        )
        if not identifier or password is None:
            return None

        try:
            user = UserModel.objects.get(
                Q(email__iexact=identifier) | Q(phone__iexact=identifier)
            )
        except UserModel.DoesNotExist:
            return None
        except UserModel.MultipleObjectsReturned:
            return None

        if user.check_password(password) and self.user_can_authenticate(user):
            return user
        return None
