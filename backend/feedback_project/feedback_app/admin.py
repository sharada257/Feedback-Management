from django.contrib import admin
from .models import Board, Feedback, Comment, UserProfile

admin.site.register(UserProfile)
admin.site.register(Board)
admin.site.register(Feedback)
admin.site.register(Comment)
