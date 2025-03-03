from django.db import models
from django.contrib.auth.models import User
from django.db.models import Count, F, Sum
from django.utils import timezone
from django.db import transaction

class UserProfile(models.Model):
    ROLE_CHOICES = [('admin', 'Admin'),('moderator', 'Moderator'),('contributor', 'Contributor'),]
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='userprofile')#Each user has one profile
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='contributor')

class Board(models.Model):
    name = models.CharField(max_length=255)
    is_public = models.BooleanField(default=True)

    def get_stats(self):
        feedbacks = (
            self.feedbacks.annotate(
                engagement_score=(F('upvote_count') + F('comment_count'))
            ).values(
                'id', 
                'title', 
                'status',
                'engagement_score'
            )
        )
        
        trending_feedbacks = sorted(
            feedbacks,
            key=lambda x: x['engagement_score'],
            reverse=True
        )[:5]
        
        status_counts = {}
        active_count = 0
        total_count = 0
        
        for feedback in feedbacks:
            status = feedback['status']
            status_counts[status] = status_counts.get(status, 0) + 1
            if status == 'Open':
                active_count += 1
            total_count += 1
        
        return {
            'active_feedbacks': active_count,
            'total_feedbacks': total_count,
            'trending_feedbacks': trending_feedbacks,
            'feedbacks_by_status': status_counts
        }

class Feedback(models.Model):
    STATUS_CHOICES = [
        ('Open', 'Open'),
        ('In Progress', 'In Progress'),
        ('Completed', 'Completed')
    ]

    board = models.ForeignKey(Board, on_delete=models.CASCADE, related_name="feedbacks")
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    description = models.TextField()
    status = models.CharField(
        choices=STATUS_CHOICES,
        default='Open',
        max_length=20,
        db_index=True  
    )
    upvote_count = models.PositiveIntegerField(default=0)
    comment_count = models.PositiveIntegerField(default=0)
    upvoted_by = models.ManyToManyField(User, related_name='upvoted_feedbacks',blank=True)
    created_at = models.DateTimeField(default=timezone.now, db_index=True)

    class Meta:
        ordering = ['-created_at']

    def toggle_upvote(self, user):
        if self.upvoted_by.filter(id=user.id).exists():
            self.upvoted_by.remove(user)
        else:
            self.upvoted_by.add(user)

        self.upvote_count = self.upvoted_by.count()
        self.save(update_fields=['upvote_count'])

        return {
            "upvoted_by": list(self.upvoted_by.values_list('id', flat=True)),  
            "upvote_count": self.upvote_count,
        }

class Comment(models.Model):
    feedback = models.ForeignKey(Feedback, on_delete=models.CASCADE, related_name='comments')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        is_new = self._state.adding
        super().save(*args, **kwargs)
        if is_new:
            self.feedback.comment_count = self.feedback.comments.count()
            self.feedback.save(update_fields=['comment_count'])  