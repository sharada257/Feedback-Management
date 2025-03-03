from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework.authtoken.views import obtain_auth_token
from .views import toggle_upvote
from .views import (
    login_view, logout_view, register_view, get_user_info,get_users,
    BoardViewSet, FeedbackViewSet, CommentViewSet
)

router = DefaultRouter()
router.register(r'boards', BoardViewSet) 
router.register(r'feedbacks', FeedbackViewSet)
router.register(r'comments', CommentViewSet)


"""
The DefaultRouter class automatically creates the API endpoint for the registered viewset.
now here we are registering the viewsets for the boards, feedbacks, and comments.
now it will automatically create the API endpoint for the registered viewset.
for example :   http://localhost:8000/api/boards/
                http://localhost:8000/api/feedbacks/    
                http://localhost:8000/api/comments/
"""

urlpatterns = [
    path('', include(router.urls)),
    path('register/', register_view, name='register'),
    path('login/', login_view, name='login'),
    path('logout/', logout_view, name='logout'),
    path('profile/', get_user_info, name='user-info'),
    path('api-token-auth/', obtain_auth_token, name='api_token_auth'),
    path('feedbacks/<int:feedback_id>/toggle_upvote/', toggle_upvote, name='toggle-upvote'),
    path('users/', get_users, name='get-users'),  


    #Endpoint: POST /api-token-auth/
    #Sends username & password → Returns an auth token.
]