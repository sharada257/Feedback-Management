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
    user = UserSerializer(read_only=True)

    class Meta:
        model = Comment
        fields = ['id', 'feedback', 'user', 'text', 'created_at']
        read_only_fields = ['user', 'created_at']

class FeedbackSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = Feedback
        fields = ['id', 'board', 'title', 'description', 'status', 
                 'upvote_count', 'comment_count', 'created_at', 'user']
        read_only_fields = ['user', 'created_at'] 

    def get_upvotes_count(self, obj):
        return obj.upvotes.count()  
    
    def get_upvoted_by(self, obj):
        return [user.id for user in obj.upvotes.all()] 
 
        
        
        
        
        
        
        
        
"""
serializers → Provides tools to convert Django models to JSON and validate API input.
User → The default Django authentication model.
Board, Feedback, Comment, UserProfile → The custom models from models.py.

serializers.ModelSerializer: Automatically maps Django models to JSON.
UserSerializer: Handles user details but makes id read-only.
read_only=True: Ensures certain fields (like user, created_at) cannot be modified via API.
Nested Serializers (UserSerializer inside CommentSerializer & FeedbackSerializer):
   Allows structured JSON responses instead of just IDs.
   Provides better API readability.

"""