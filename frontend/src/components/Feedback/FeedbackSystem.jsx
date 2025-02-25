import React, { useEffect, useState, useCallback } from "react";
import axiosInstance from "../../api/axiosConfig";
import FeedbackForm from "./FeedbackForm";
import FeedbackItem from "./FeedbackItem";
import LoadingState from "../common/LoadingState";
import ErrorState from "../common/ErrorState";

const FeedbackSystem = ({ boardId, currentUser }) => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBoardFeedbacks = useCallback(async () => {
    if (!boardId) return;
    
    setLoading(true);
    try {
      console.log(`Fetching all feedbacks and filtering for board ${boardId}`);
      const response = await axiosInstance.get(`feedbacks/`);
      const filteredFeedbacks = response.data.filter(feedback => feedback.board === parseInt(boardId, 10));
      
      for (const feedback of filteredFeedbacks) {
        if (feedback.comment_count > 0 && (!feedback.comments || feedback.comments.length === 0)) {
          try {
            const commentsResponse = await axiosInstance.get(`comments/?feedback=${feedback.id}`);
            feedback.comments = commentsResponse.data;
          } catch (commentError) {
            console.error(`Error fetching comments for feedback ${feedback.id}:`, commentError);
          }
        }
      }
      
      console.log('Filtered feedbacks with comments:', filteredFeedbacks);
      setFeedbacks(filteredFeedbacks);
      setError(null);
    } catch (error) {
      console.error("Error fetching feedbacks:", error);
      setError("Failed to load feedbacks");
    } finally {
      setLoading(false);
    }
  }, [boardId]);

  
  useEffect(() => {
    if (boardId) {
      fetchBoardFeedbacks();
    }
  }, [boardId, fetchBoardFeedbacks]);

  const handleAddFeedback = (newFeedback) => {
    setFeedbacks(prev => [newFeedback, ...prev]);
  };

  const handleUpdateFeedback = (updatedFeedback) => {
    setFeedbacks(prev => 
      prev.map(feedback => 
        feedback.id === updatedFeedback.id ? updatedFeedback : feedback
      )
    );
  };

  const handleDeleteFeedback = (feedbackId) => {
    setFeedbacks(prev => prev.filter(feedback => feedback.id !== feedbackId));
  };

  const handleToggleUpvote = (feedbackId, upvoteData) => {
    setFeedbacks(prev => 
      prev.map(feedback => {
        if (feedback.id === feedbackId) {
          return {
            ...feedback,
            upvote_count: upvoteData.upvote_count,
            upvoted_by: upvoteData.upvoted_by
          };
        }
        return feedback;
      })
    );
  };

  const handleAddComment = (feedbackId, newComment) => {
    setFeedbacks(prev => 
      prev.map(feedback => {
        if (feedback.id === feedbackId) {
          return {
            ...feedback,
            comments: [...(feedback.comments || []), newComment],
            comment_count: (feedback.comment_count || 0) + 1
          };
        }
        return feedback;
      })
    );
  };

  const handleUpdateComment = (feedbackId, updatedComment) => {
    setFeedbacks(prev => 
      prev.map(feedback => {
        if (feedback.comments?.some(c => c.id === updatedComment.id)) {
          return {
            ...feedback,
            comments: feedback.comments.map(comment => 
              comment.id === updatedComment.id ? updatedComment : comment
            )
          };
        }
        return feedback;
      })
    );
  };

  const handleDeleteComment = (feedbackId, commentId) => {
    setFeedbacks(prev => 
      prev.map(feedback => {
        if (feedback.comments?.some(c => c.id === commentId)) {
          return {
            ...feedback,
            comments: feedback.comments.filter(c => c.id !== commentId),
            comment_count: feedback.comment_count - 1
          };
        }
        return feedback;
      })
    );
  };

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState error={error} retry={fetchBoardFeedbacks} />;
  }

  return (
    <div className="space-y-8">
      <FeedbackForm 
        boardId={boardId} 
        currentUser={currentUser} 
        onFeedbackAdded={handleAddFeedback} 
      />

  
      {feedbacks.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg p-6 text-center">
          <p className="text-gray-500">No feedback for this board yet. Be the first to add one!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {feedbacks.map((feedback) => (
            <FeedbackItem
              key={feedback.id}
              feedback={feedback}
              currentUser={currentUser}
              onUpdateFeedback={handleUpdateFeedback}
              onDeleteFeedback={handleDeleteFeedback}
              onToggleUpvote={handleToggleUpvote}
              onAddComment={handleAddComment}
              onUpdateComment={handleUpdateComment}
              onDeleteComment={handleDeleteComment}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default FeedbackSystem;
