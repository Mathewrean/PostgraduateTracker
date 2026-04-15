from rest_framework.routers import DefaultRouter
from .views import NotificationViewSet, MeetingViewSet

router = DefaultRouter()
router.register(r'notifications', NotificationViewSet, basename='notification')
router.register(r'meetings', MeetingViewSet, basename='meeting')

urlpatterns = router.urls
