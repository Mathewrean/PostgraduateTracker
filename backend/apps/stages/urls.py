from rest_framework.routers import DefaultRouter
from .views import StageViewSet

router = DefaultRouter()
router.register(r'', StageViewSet, basename='stage')

urlpatterns = router.urls
