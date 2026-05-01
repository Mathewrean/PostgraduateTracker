from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.exceptions import PermissionDenied
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User, normalize_role_value
from .serializers import UserSerializer, UserRegistrationSerializer, UserDetailSerializer, UserProfileUpdateSerializer
from .permissions import RoleBasedPermission
from apps.audit.services import log_audit_event
import logging

logger = logging.getLogger(__name__)

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated, RoleBasedPermission]

    def get_queryset(self):
        user = self.request.user
        if user.role_key in ['coordinator', 'dean', 'cod', 'director_bps']:
            queryset = User.objects.all()
        elif user.role_key == 'supervisor':
            queryset = User.objects.filter(id=user.id) | User.objects.filter(student_profile__assigned_supervisor=user)
        else:
            queryset = User.objects.filter(id=user.id)

        role_filter = self.request.query_params.get('role')
        if role_filter:
            queryset = queryset.filter(role=normalize_role_value(role_filter))
        return queryset

    def _require_admin_or_coordinator(self):
        if self.request.user.role_key not in ['coordinator', 'dean', 'cod', 'director_bps']:
            raise PermissionDenied('You are not allowed to manage users.')

    def list(self, request, *args, **kwargs):
        self._require_admin_or_coordinator()
        return super().list(request, *args, **kwargs)

    def retrieve(self, request, *args, **kwargs):
        self._require_admin_or_coordinator()
        return super().retrieve(request, *args, **kwargs)

    def create(self, request, *args, **kwargs):
        self._require_admin_or_coordinator()
        return super().create(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        self._require_admin_or_coordinator()
        return super().update(request, *args, **kwargs)

    def partial_update(self, request, *args, **kwargs):
        self._require_admin_or_coordinator()
        return super().partial_update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        self._require_admin_or_coordinator()
        return super().destroy(request, *args, **kwargs)

    def get_serializer_class(self):
        if self.action == 'register':
            return UserRegistrationSerializer
        elif self.action == 'update_profile':
            return UserProfileUpdateSerializer
        elif self.action == 'retrieve':
            return UserDetailSerializer
        return UserSerializer

    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def register(self, request):
        """Register a new user"""
        data = request.data.copy()
        data['role'] = normalize_role_value(data.get('role', 'student'))

        serializer = self.get_serializer(data=data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            return Response({
                'user': UserSerializer(user).data,
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post', 'patch'])
    def update_profile(self, request):
        """Update user profile"""
        user = request.user
        serializer = self.get_serializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'])
    def me(self, request):
        """Get current user details"""
        serializer = UserSerializer(request.user, context={'request': request})
        return Response(serializer.data)

    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def login(self, request):
        """Legacy login endpoint (for non-OIDC flows)"""
        email = request.data.get('email')
        password = request.data.get('password')
        
        if not email or not password:
            return Response({
                'error': 'Email and password are required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        user = authenticate(request, email=email, password=password)
        if user:
            refresh = RefreshToken.for_user(user)
            user.update_last_login(request.client_ip if hasattr(request, 'client_ip') else None)
            log_audit_event(
                user=user,
                action='LOGIN',
                description='User logged into the PST platform.',
                ip_address=getattr(request, 'client_ip', None),
            )
            return Response({
                'user': UserSerializer(user, context={'request': request}).data,
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            })
        
        return Response({
            'error': 'Invalid credentials'
        }, status=status.HTTP_401_UNAUTHORIZED)

    @action(detail=False, methods=['post'])
    def logout(self, request):
        """Logout user"""
        try:
            refresh_token = request.data.get('refresh')
            token = RefreshToken(refresh_token)
            token.blacklist()
            log_audit_event(
                user=request.user,
                action='LOGOUT',
                description='User logged out of the PST platform.',
                ip_address=getattr(request, 'client_ip', None),
            )
            return Response({'success': True}, status=status.HTTP_205_RESET_CONTENT)
        except Exception:
            return Response({'error': 'Invalid or expired refresh token'}, status=status.HTTP_400_BAD_REQUEST)


class AuthLoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')

        if not email or not password:
            return Response({'error': 'Email and password are required'}, status=status.HTTP_400_BAD_REQUEST)

        user = authenticate(request, email=email, password=password)
        if not user:
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

        refresh = RefreshToken.for_user(user)
        user.update_last_login(request.client_ip if hasattr(request, 'client_ip') else None)
        log_audit_event(
            user=user,
            action='LOGIN',
            description='User logged into the PST platform.',
            ip_address=getattr(request, 'client_ip', None),
        )
        return Response({
            'user': UserSerializer(user, context={'request': request}).data,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        })


class AuthLogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            token = RefreshToken(refresh_token)
            token.blacklist()
            log_audit_event(
                user=request.user,
                action='LOGOUT',
                description='User logged out of the PST platform.',
                ip_address=getattr(request, 'client_ip', None),
            )
            return Response({'success': True}, status=status.HTTP_205_RESET_CONTENT)
        except Exception:
            return Response({'error': 'Invalid or expired refresh token'}, status=status.HTTP_400_BAD_REQUEST)


class AuthProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user, context={'request': request}).data)

    def patch(self, request):
        serializer = UserProfileUpdateSerializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(UserSerializer(request.user, context={'request': request}).data)
