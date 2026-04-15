from rest_framework.routers import DefaultRouter
from .views import StudentViewSet, SupervisorViewSet

router = DefaultRouter()
router.register(r'', StudentViewSet, basename='student')

urlpatterns = router.urls
