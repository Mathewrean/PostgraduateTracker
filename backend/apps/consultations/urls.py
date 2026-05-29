from rest_framework.routers import DefaultRouter

from .views import ConsultationFormViewSet


router = DefaultRouter()
router.register(r'', ConsultationFormViewSet, basename='consultation')

urlpatterns = router.urls
