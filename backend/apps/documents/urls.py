from rest_framework.routers import DefaultRouter
from .views import DocumentViewSet, MinutesViewSet

router = DefaultRouter()
router.register(r'documents', DocumentViewSet, basename='document')
router.register(r'minutes', MinutesViewSet, basename='minutes')

urlpatterns = router.urls
