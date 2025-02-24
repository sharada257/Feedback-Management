from django.db import models
from django.contrib.auth.models import User
from django.db.models import Count
from django.utils import timezone

class UserProfile(models.Model):
    ROLE_CHOICES = [
        ('admin', 'Admin'),
        ('moderator', 'Moderator'),
        ('contributor', 'Contributor'),
    ]
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='userprofile')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='contributor')
    
    def __str__(self):
        return f"{self.user.username} - {self.role}"

class Board(models.Model):
    name = models.CharField(max_length=255)
    is_public = models.BooleanField(default=True)

    def get_stats(self):
        feedbacks = self.feedback_set.all()
        return {
            'active_feedbacks': feedbacks.filter(status='Open').count(),
            'total_feedbacks': feedbacks.count(),
            'trending_feedbacks': feedbacks.annotate(
                engagement_score=(models.F('upvote_count') + models.F('comment_count'))
            ).order_by('-engagement_score')[:5],
            'feedbacks_by_status': {
                status: feedbacks.filter(status=status).count()
                for status in ['Open', 'In Progress', 'Completed']
            }
        }

class Feedback(models.Model):
    STATUS_CHOICES = [
        ('Open', 'Open'),
        ('In Progress', 'In Progress'),
        ('Completed', 'Completed')
    ]

    board = models.ForeignKey(Board, on_delete=models.CASCADE)  # ✅ Add related_name

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    description = models.TextField()
    status = models.CharField(
        choices=STATUS_CHOICES,
        default='Open',
        max_length=20
    )
    upvote_count = models.PositiveIntegerField(default=0)
    comment_count = models.PositiveIntegerField(default=0)
    upvoted_by = models.ManyToManyField(
        User, 
        related_name='upvoted_feedbacks',
        blank=True
    )
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.title

    def toggle_upvote(self, user):
        if user in self.upvoted_by.all():
            self.upvoted_by.remove(user)
            self.upvote_count -= 1
            self.save()
            return False
        self.upvoted_by.add(user)
        self.upvote_count += 1
        self.save()
        return True

class Comment(models.Model):
    feedback = models.ForeignKey(Feedback, on_delete=models.CASCADE, related_name='comments')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Comment by {self.user.username}"

    def save(self, *args, **kwargs):
        is_new = self._state.adding
        super().save(*args, **kwargs)
        if is_new:
            self.feedback.comment_count = self.feedback.comments.count()
            self.feedback.save()