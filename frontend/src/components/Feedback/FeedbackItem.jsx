import React, { useState, useEffect } from "react";
import { ThumbsUp, MessageSquare, Edit, Trash2, Users } from "lucide-react";
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
  const [isUpvoteLoading, setIsUpvoteLoading] = useState(false);
  const [localFeedback, setLocalFeedback] = useState(feedback);

  // Ensure we have the latest feedback data
  useEffect(() => {
    if (feedback) {
      setLocalFeedback(feedback);
    }
  }, [feedback]);

  // Fix 1: Check if currentUser exists first
  useEffect(() => {
    if (feedback) {
      setLocalFeedback(feedback);
    }
  }, [currentUser, feedback]);

  // Fix 2: Add better console logging
  useEffect(() => {
    if (currentUser) {
      console.log("Current User Loaded:", currentUser);
    } else {
      console.warn("Current user is not available");
    }
  }, [currentUser]);

  // Fix 3: Improve permission checks
  const hasModeratorPermissions = () => {
    if (!currentUser) return false;
    return currentUser.role === 'admin' || currentUser.role === 'moderator';
  };
  
  // FIX: Properly check user ownership by examining user IDs
  const isOwnFeedback = () => {
    if (!currentUser || !localFeedback) return false;
    
    // Check if localFeedback.user is an object with an id property or just an id
    const feedbackUserId = typeof localFeedback.user === 'object' && localFeedback.user !== null 
      ? localFeedback.user.id 
      : localFeedback.user;
    
    // Make sure currentUser.id exists
    const currentUserId = currentUser?.id;
    
    // Log the values for debugging
    console.log("isOwnFeedback check:", { 
      currentUserId: currentUserId || "missing", 
      feedbackUserId: feedbackUserId || "missing",
      currentUserType: typeof currentUserId,
      feedbackUserType: typeof feedbackUserId
    });
    
    // If either ID is missing, return false
    if (!currentUserId || !feedbackUserId) return false;
    
    // Convert both to strings for reliable comparison
    return String(currentUserId) === String(feedbackUserId);
  };

  const canEditFeedback = () => {
    return isOwnFeedback() || hasModeratorPermissions();
  };

  // Fix 4: Improved delete permissions
  const canDeleteFeedback = () => {
    return isOwnFeedback() || hasModeratorPermissions();
  };

  const handleEditFeedback = () => setEditingFeedbackId(localFeedback?.id);
  const handleCancelEdit = () => setEditingFeedbackId(null);
  const handleToggleComments = () => setShowComments(!showComments);

  const handleEditFeedbackSubmit = async (editFeedbackData) => {
    if (!localFeedback) return;
    
    try {
      const response = await axiosInstance.put(`feedbacks/${localFeedback.id}/`, {
        ...editFeedbackData,
        board: localFeedback.board
      });
      
      setLocalFeedback(response.data);
      onUpdateFeedback(response.data);
      setEditingFeedbackId(null);
    } catch (error) {
      console.error("Error updating feedback:", error);
      alert("Failed to update feedback. Please try again.");
    }
  };

  const handleDeleteFeedback = async () => {
    if (!localFeedback) return;
    if (!canDeleteFeedback()) {
      alert("You don't have permission to delete this feedback.");
      return;
    }
    
    if (!window.confirm("Are you sure you want to delete this feedback?")) return;
    
    try {
      await axiosInstance.delete(`feedbacks/${localFeedback.id}/`);
      onDeleteFeedback(localFeedback.id);
    } catch (error) {
      console.error("Error deleting feedback:", error);
      alert("Failed to delete feedback. Please try again.");
    }
  };

  // Fix 5: Improved toggle upvote handling
  const handleToggleUpvote = async () => {
    if (!currentUser) {
      alert("Please log in to upvote");
      return;
    }
    
    if (!localFeedback || isUpvoteLoading) return;

    setIsUpvoteLoading(true);

    try {
      const response = await axiosInstance.post(`feedbacks/${localFeedback.id}/toggle_upvote/`);

      if (response?.data) {
        // Ensure upvoted_by is always an array
        const upvotedBy = Array.isArray(response.data.upvoted_by) 
          ? response.data.upvoted_by 
          : [];
        
        console.log("Toggle Upvote Response:", response.data);
        
        setLocalFeedback(prev => ({
          ...prev,
          upvoted_by: upvotedBy,
          upvote_count: response.data.upvote_count || upvotedBy.length
        }));
        
        onToggleUpvote(localFeedback.id, response.data);
      }
    } catch (error) {
      console.error("Error toggling upvote:", error);
      alert("Failed to update upvote. Please try again.");
    } finally {
      setIsUpvoteLoading(false);
    }
  };

  const handleAddComment = async (commentText) => {
    if (!commentText.trim() || !currentUser || !localFeedback) return;

    try {
      const response = await axiosInstance.post("comments/", {
        feedback: localFeedback.id,
        text: commentText
      });
      
      const updatedFeedback = {
        ...localFeedback,
        comment_count: (localFeedback.comment_count || 0) + 1
      };
      
      setLocalFeedback(updatedFeedback);
      onAddComment(localFeedback.id, response.data);
      return true; // Success
    } catch (error) {
      console.error("Error adding comment:", error);
      alert("Failed to add comment. Please try again.");
      return false; // Failed
    }
  };

  // Guard against rendering with invalid data
  if (!localFeedback) {
    return <div className="bg-white rounded-xl shadow-lg p-6">Loading feedback...</div>;
  }

  // FIX: Better handling of upvote count
  // First ensure we have an array of upvoted_by
  const upvotedBy = Array.isArray(localFeedback.upvoted_by) 
    ? localFeedback.upvoted_by 
    : [];
  
  // Use upvote_count if available, otherwise fall back to array length
  const upvotedByCount = localFeedback.upvote_count !== undefined 
    ? localFeedback.upvote_count 
    : upvotedBy.length;

  // Fix 7: More reliable upvote check
  const isUpvotedByCurrentUser = currentUser 
    ? upvotedBy.some(id => String(id) === String(currentUser.id)) 
    : false;
  
  // Log upvote data for debugging
  useEffect(() => {
    console.log("Upvote data:", {
      upvote_count: localFeedback.upvote_count,
      upvoted_by: localFeedback.upvoted_by,
      calculated_count: upvotedByCount
    });
  }, [localFeedback]);
  
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      {editingFeedbackId === localFeedback.id ? (
        <FeedbackEditForm 
          feedback={localFeedback}
          onSave={handleEditFeedbackSubmit}
          onCancel={handleCancelEdit}
        />
      ) : (
        <>
          <div className="flex justify-between">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {localFeedback.title}
            </h3>
            
            {/* Fix 8: Only show actions container when there are actions to perform */}
            {(canEditFeedback() || canDeleteFeedback()) && (
              <div className="flex space-x-2">
                {canEditFeedback() && (
                  <button
                    onClick={handleEditFeedback}
                    className="text-blue-600 hover:text-blue-800"
                    aria-label="Edit feedback"
                  >
                    <Edit size={18} />
                  </button>
                )}
                
                {canDeleteFeedback() && (
                  <button
                    onClick={handleDeleteFeedback}
                    className="text-red-600 hover:text-red-800"
                    aria-label="Delete feedback"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            )}
          </div>
          
          <p className="text-gray-600 mb-4">{localFeedback.description}</p>

          <div className="flex items-center gap-4 mb-4">
            {/* FIX: Improved upvote UI with proper count display */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleToggleUpvote}
                disabled={isUpvoteLoading}
                className={`flex items-center justify-center p-2 rounded-lg transition-colors border
                  ${isUpvotedByCurrentUser ? 'bg-green-100 text-green-700 border-green-300' : 'bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-500'}
                  ${!currentUser ? 'opacity-70 hover:bg-gray-50' : ''} 
                  ${isUpvoteLoading ? 'animate-pulse' : ''}`}
                aria-label={isUpvotedByCurrentUser ? "Remove upvote" : "Upvote feedback"}
              >
                <ThumbsUp 
                  size={18} 
                  className={isUpvotedByCurrentUser ? "fill-green-700 text-green-700" : ""}
                />
              </button>
              
              {/* FIX: Improved counter with proper count display */}
              <div className="flex items-center gap-1 text-sm px-2 py-1 bg-gray-100 rounded-lg">
                <Users size={14} className="text-gray-600" />
                <span className="font-medium">
                  {upvotedByCount === 0 
                    ? "0 people" 
                    : upvotedByCount === 1 
                      ? "1 person" 
                      : `${upvotedByCount} people`}
                </span>
              </div>
            </div>

            <button
              onClick={handleToggleComments}
              className={`flex items-center gap-1 text-gray-500 hover:text-gray-700 ${
                showComments ? 'font-medium text-blue-600' : ''
              }`}
              aria-label="Show comments"
            >
              <MessageSquare size={18} />
              <span>{localFeedback.comment_count || 0} comments</span>
            </button>
          </div>
        </>
      )}

      {showComments && (
        <div className="border-t border-gray-200 mt-4 pt-4">
          <CommentList 
            comments={localFeedback.comments || []} 
            currentUser={currentUser}
            feedbackId={localFeedback.id}
            onUpdateComment={onUpdateComment}
            onDeleteComment={onDeleteComment}
            canModerateComments={hasModeratorPermissions} // Fix 11: Pass moderator permissions to comment list
          />
          
          <CommentForm 
            feedbackId={localFeedback.id}
            currentUser={currentUser}
            onAddComment={handleAddComment}
          />
        </div>
      )}
    </div>
  );
};

export default FeedbackItem;