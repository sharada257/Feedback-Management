from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Board, Feedback, Comment, UserProfile

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']
        read_only_fields = ['id']

class UserProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = UserProfile
        fields = ['user', 'role']

class BoardSerializer(serializers.ModelSerializer):
    class Meta:
        model = Board
        fields = '__all__'

class CommentSerializer(serializers.ModelSerializer):
    # Show basic user info
    user = UserSerializer(read_only=True)

    class Meta:
        model = Comment
        fields = ['id', 'feedback', 'user', 'text', 'created_at']
        read_only_fields = ['user', 'created_at']

from rest_framework import serializers
from .models import Feedback

class FeedbackSerializer(serializers.ModelSerializer):
    class Meta:
        model = Feedback
        fields = '__all__'  

