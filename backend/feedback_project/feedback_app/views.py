from rest_framework import permissions, status
from rest_framework.decorators import (
    api_view, permission_classes, authentication_classes, action
)
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet
from django.contrib.auth import authenticate, login
from rest_framework.authtoken.models import Token
from django.contrib.auth.models import User
from rest_framework.authentication import TokenAuthentication
from .models import Board, Feedback, Comment, UserProfile
from .serializers import (BoardSerializer, FeedbackSerializer, CommentSerializer, UserProfileSerializer)


@api_view(['POST'])
@permission_classes([permissions.AllowAny]) 
def login_view(request):
    username = request.data.get('username')
    password = request.data.get('password')

    user = authenticate(username=username, password=password)
    if user is not None:
        token, created = Token.objects.get_or_create(user=user)
        return Response({
            "message": "Login successful",
            "token": token.key,
            "role": getattr(user.userprofile, 'role', 'contributor'),
            "username": user.username
        }, status=status.HTTP_200_OK)

    return Response({"error": "Invalid credentials"}, 
                   status=status.HTTP_401_UNAUTHORIZED)

@api_view(['POST'])
@permission_classes([permissions.AllowAny]) 
def register_view(request):
    username = request.data.get('username')
    password = request.data.get('password')
    email = request.data.get('email')
    role = request.data.get('role', 'contributor')

    if User.objects.filter(username=username).exists():
        return Response(
            {"error": "Username already exists"}, 
            status=status.HTTP_400_BAD_REQUEST
        )

    user = User.objects.create_user(username=username, password=password, email=email)
    UserProfile.objects.create(user=user, role=role)
    token, _ = Token.objects.get_or_create(user=user)
    
    return Response({
        "message": "Registration successful",
        "token": token.key,
        "role": role,
        "username": user.username
    }, status=status.HTTP_201_CREATED)

@api_view(['GET'])
def logout_view(request):
    if request.auth:
        request.auth.delete()
    return Response({"message": "Logout successful"}, status=status.HTTP_200_OK)

@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated])
@authentication_classes([TokenAuthentication])
def get_user_info(request):
    user = request.user
    if not hasattr(user, 'userprofile'):
        return Response({"error": "User profile not found"}, status=status.HTTP_404_NOT_FOUND)

    serializer = UserProfileSerializer(user.userprofile)
    return Response(serializer.data)

class IsAdminOrModeratorOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return request.user.is_authenticated
        
        if not request.user.is_authenticated:
            return False

        if request.user.is_superuser:
            return True  # Superusers have full access

        try:
            profile = request.user.userprofile
            return profile.role in ['admin', 'moderator']  # Contributors can't create/update
        except AttributeError:
            return False

from rest_framework.decorators import action
from rest_framework.response import Response

class BoardViewSet(ModelViewSet):
    queryset = Board.objects.all()
    serializer_class = BoardSerializer

    def get_queryset(self):
        user = self.request.user
        if hasattr(user, 'userprofile') and user.userprofile.role in ['admin', 'moderator']:
            return Board.objects.all()
        return Board.objects.filter(is_public=True)

    @action(detail=True, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def get_stats(self, request, pk=None):
        board = self.get_object()
        stats = board.get_stats()  
        return Response(stats)

class FeedbackViewSet(ModelViewSet):
    queryset = Feedback.objects.all()
    serializer_class = FeedbackSerializer
    permission_classes = [permissions.IsAuthenticated]  # Only logged-in users

    authentication_classes = [TokenAuthentication]  # Token-based auth

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
@authentication_classes([TokenAuthentication])
def toggle_upvote(request, feedback_id):
    try:
        feedback = Feedback.objects.get(id=feedback_id)
        user = request.user  

        result = feedback.toggle_upvote(user)
        return Response(result, status=status.HTTP_200_OK)
    
    except Feedback.DoesNotExist:
        return Response({"error": "Feedback not found"}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class CommentViewSet(ModelViewSet):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [TokenAuthentication]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)