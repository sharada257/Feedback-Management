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
from .serializers import (
    BoardSerializer, FeedbackSerializer, CommentSerializer, UserProfileSerializer
)


@api_view(['POST'])
@permission_classes([permissions.AllowAny]) 
def login_view(request):
    username = request.data.get('username')
    password = request.data.get('password')

    user = authenticate(username=username, password=password)
    if user is not None:
        login(request, user)
        token, created = Token.objects.get_or_create(user=user)
        
        # Get user role
        try:
            user_profile = user.userprofile
            role = user_profile.role
        except UserProfile.DoesNotExist:
            role = "contributor"

        return Response({
            "message": "Login successful",
            "token": token.key,
            "role": role,
            "username": user.username
        }, status=status.HTTP_200_OK)

    return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)

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
        return Response({"error": "User profile not found"}, status=404)

    serializer = UserProfileSerializer(user.userprofile)
    return Response(serializer.data)

class IsAdminOrModeratorOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return request.user.is_authenticated
        
        if not request.user.is_authenticated:
            return False

        if request.user.is_superuser:
            return True

        try:
            profile = request.user.userprofile
            return profile.role in ['admin', 'moderator', 'contributor']
        except AttributeError:
            return False
        
from rest_framework.decorators import action
from rest_framework.response import Response

from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet
from .models import Board
from .serializers import BoardSerializer, FeedbackSerializer

class BoardViewSet(ModelViewSet):
    queryset = Board.objects.all()
    serializer_class = BoardSerializer

    def get_queryset(self):
        user = self.request.user
        if hasattr(user, 'userprofile') and user.userprofile.role in ['admin', 'moderator']:
            return Board.objects.all()
        return Board.objects.filter(is_public=True)

    @action(detail=True, methods=['get'])  # ✅ This makes it accessible at /api/boards/<id>/stats/
    def stats(self, request, pk=None):  # ✅ Change method name to 'stats'
        """
        GET /api/boards/<id>/stats/
        Returns statistics for the board.
        """
        board = self.get_object()  # Fetch the Board instance

        # Get feedback related to this board
        feedbacks = board.feedbacks.all() 
        serialized_feedbacks = FeedbackSerializer(feedbacks, many=True).data  # Serialize feedback data

        stats_data = {
            "total_feedback": feedbacks.count(),
            "completed_feedback": feedbacks.filter(status="Completed").count(),
            "in_progress_feedback": feedbacks.filter(status="In Progress").count(),
            "feedbacks": serialized_feedbacks,  # ✅ Now it's serializable
        }

        return Response(stats_data)  # ✅ Return JSON response

class FeedbackViewSet(ModelViewSet):
    queryset = Feedback.objects.all()
    serializer_class = FeedbackSerializer
    permission_classes = [permissions.IsAuthenticated]  # Only logged-in users

    authentication_classes = [TokenAuthentication]  # Token-based auth

    def perform_create(self, serializer):
        # Auto-assign the logged-in user as the feedback owner
        if self.request.user.is_authenticated:
            serializer.save(user=self.request.user)

    # -----------
    #  Upvote Toggle
    # -----------
    @action(detail=True, methods=['post'])
    def toggle_upvote(self, request, pk=None):
        """
        POST /api/feedbacks/{id}/toggle_upvote/
        Toggles the upvote for the current user on this feedback.
        """
        feedback = self.get_object()  # get the Feedback instance
        toggled = feedback.toggle_upvote(request.user)
        serializer = self.get_serializer(feedback)
        return Response(serializer.data)

# -------------------------
#  Comment ViewSet
# -------------------------

class CommentViewSet(ModelViewSet):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [TokenAuthentication]

    def perform_create(self, serializer):
        # Auto-assign the logged-in user as the comment owner
        serializer.save(user=self.request.user)
