# urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework.authtoken.views import obtain_auth_token
from .views import (
    login_view, logout_view, register_view, get_user_info,
    BoardViewSet, FeedbackViewSet, CommentViewSet
)

router = DefaultRouter()
router.register(r'boards', BoardViewSet)
router.register(r'feedbacks', FeedbackViewSet)
router.register(r'comments', CommentViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('register/', register_view, name='register'),
    path('login/', login_view, name='login'),
    path('logout/', logout_view, name='logout'),
    path('profile/', get_user_info, name='user-info'),
    path('api-token-auth/', obtain_auth_token, name='api_token_auth'),
]