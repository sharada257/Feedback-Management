import React, { useState } from "react";
import { ThumbsUp, MessageSquare, Edit, Trash2 } from "lucide-react";
import axiosInstance from "../../api/axiosConfig";
import CommentList from "../comment/CommentList";
import CommentForm from "../comment/CommentForm";
import FeedbackEditForm from "./FeedbackEditForm";

const FeedbackItem = ({ 
  feedback, 
  currentUser, 
  onUpdateFeedback, 
  onDeleteFeedback, 
  onToggleUpvote,
  onAddComment,
  onUpdateComment,
  onDeleteComment
}) => {
  const [editingFeedbackId, setEditingFeedbackId] = useState(null);
  const [showComments, setShowComments] = useState(false);

  // Check if user has admin/moderator permissions
  const hasModeratorPermissions = () => {
    return currentUser?.role === 'Admin' || currentUser?.role === 'Moderator';
  };

  // Check if user owns a specific feedback
  const isOwnFeedback = (feedbackUserId) => {
    return currentUser?.id === feedbackUserId;
  };

  const handleEditFeedback = () => {
    setEditingFeedbackId(feedback.id);
  };

  const handleCancelEdit = () => {
    setEditingFeedbackId(null);
  };

  const handleEditFeedbackSubmit = async (editFeedbackData) => {
    try {
      const response = await axiosInstance.put(`feedbacks/${feedback.id}/`, {
        ...editFeedbackData,
        board: feedback.board
      });
      
      onUpdateFeedback(response.data);
      setEditingFeedbackId(null);
    } catch (error) {
      console.error("Error updating feedback:", error);
      alert("Failed to update feedback. Please try again.");
    }
  };

  const handleDeleteFeedback = async () => {
    if (!window.confirm("Are you sure you want to delete this feedback?")) return;
    
    try {
      await axiosInstance.delete(`feedbacks/${feedback.id}/`);
      onDeleteFeedback(feedback.id);
    } catch (error) {
      console.error("Error deleting feedback:", error);
      alert("Failed to delete feedback. Please try again.");
    }
  };

  const handleToggleUpvote = async () => {
    if (!currentUser) return;
    
    try {
      const response = await axiosInstance.post(`feedbacks/${feedback.id}/toggle_upvote/`);
      onToggleUpvote(feedback.id, {
        upvote_count: response.data.upvote_count,
        upvoted_by: response.data.upvoted_by
      });
    } catch (error) {
      console.error("Error toggling upvote:", error);
    }
  };

  const handleToggleComments = () => {
    setShowComments(!showComments);
  };

  const handleAddComment = async (commentText) => {
    if (!commentText.trim() || !currentUser) return;

    try {
      const response = await axiosInstance.post("comments/", {
        feedback: feedback.id,
        text: commentText
      });
      
      onAddComment(feedback.id, response.data);
      return true; // Success
    } catch (error) {
      console.error("Error adding comment:", error);
      alert("Failed to add comment. Please try again.");
      return false; // Failed
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      {editingFeedbackId === feedback.id ? (
        <FeedbackEditForm 
          feedback={feedback}
          onSave={handleEditFeedbackSubmit}
          onCancel={handleCancelEdit}
        />
      ) : (
        <>
          <div className="flex justify-between">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {feedback.title}
            </h3>
            
            {/* Feedback Actions - Always visible for authorized users */}
            {(isOwnFeedback(feedback.user) || hasModeratorPermissions()) && (
              <div className="flex space-x-2">
                {isOwnFeedback(feedback.user) && (
                  <button
                    onClick={handleEditFeedback}
                    className="text-blue-600 hover:text-blue-800"
                    aria-label="Edit feedback"
                  >
                    <Edit size={18} />
                  </button>
                )}
                
                <button
                  onClick={handleDeleteFeedback}
                  className="text-red-600 hover:text-red-800"
                  aria-label="Delete feedback"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            )}
          </div>
          
          <p className="text-gray-600 mb-4">{feedback.description}</p>

          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={handleToggleUpvote}
              className={`flex items-center gap-1 px-3 py-1 rounded-lg transition-colors ${
                feedback.upvoted_by?.includes(currentUser?.id)
                  ? 'bg-blue-100 text-blue-700'
                  : 'hover:bg-gray-100'
              }`}
              disabled={!currentUser}
              aria-label="Upvote feedback"
            >
              <ThumbsUp size={18} />
              <span>{feedback.upvote_count || 0}</span>
            </button>

            <button
              onClick={handleToggleComments}
              className={`flex items-center gap-1 text-gray-500 hover:text-gray-700 ${
                showComments ? 'font-medium text-blue-600' : ''
              }`}
              aria-label="Show comments"
            >
              <MessageSquare size={18} />
              <span>{feedback.comment_count || 0} comments</span>
            </button>
          </div>
        </>
      )}

      {/* Comments Section - Conditionally rendered based on showComments state */}
      {showComments && (
        <div className="border-t border-gray-200 mt-4 pt-4">
          <CommentList 
            comments={feedback.comments || []} 
            currentUser={currentUser}
            feedbackId={feedback.id}
            onUpdateComment={onUpdateComment}
            onDeleteComment={onDeleteComment}
          />
          
          <CommentForm 
            feedbackId={feedback.id}
            currentUser={currentUser}
            onAddComment={handleAddComment}
          />
        </div>
      )}
    </div>
  );
};

export default FeedbackItem;