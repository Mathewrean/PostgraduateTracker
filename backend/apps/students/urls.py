from rest_framework.routers import DefaultRouter
from .views import StudentViewSet  # Removed SupervisorViewSet

router = DefaultRouter()
router.register(r'', StudentViewSet, basename='student')

urlpatterns = router.urls
