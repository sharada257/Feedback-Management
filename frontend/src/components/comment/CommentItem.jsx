import React, { useState } from "react";
import { Edit, Trash2 } from "lucide-react";
import axiosInstance from "../../api/axiosConfig";

const CommentItem = ({ comment, currentUser, feedbackId, onUpdateComment, onDeleteComment }) => {
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editCommentData, setEditCommentData] = useState("");

  // Check if user has admin/moderator permissions
  const hasModeratorPermissions = () => {
    return currentUser?.role === 'admin' || currentUser?.role === 'moderator';
  };

  // Check if user owns a specific comment
  const isOwnComment = (commentUserId) => {
    return currentUser?.id === commentUserId;
  };

  const handleEditComment = () => {
    setEditingCommentId(comment.id);
    setEditCommentData(comment.text);
  };

  const handleEditCommentSubmit = async () => {
    if (!editCommentData.trim()) return;
    
    try {
      const response = await axiosInstance.put(`comments/${comment.id}/`, {
        text: editCommentData,
        feedback: feedbackId
      });
      
      onUpdateComment(feedbackId, response.data);
      setEditingCommentId(null);
    } catch (error) {
      console.error("Error updating comment:", error);
      alert("Failed to update comment. Please try again.");
    }
  };

  const handleDeleteComment = async () => {
    if (!window.confirm("Are you sure you want to delete this comment?")) return;
    
    try {
      await axiosInstance.delete(`comments/${comment.id}/`);
      onDeleteComment(feedbackId, comment.id);
    } catch (error) {
      console.error("Error deleting comment:", error);
      alert("Failed to delete comment. Please try again.");
    }
  };

  return (
    <div className="bg-gray-50 rounded-lg p-3">
      {editingCommentId === comment.id ? (
        <div className="space-y-2">
          <textarea
            value={editCommentData}
            onChange={(e) => setEditCommentData(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <div className="flex space-x-2">
            <button
              onClick={handleEditCommentSubmit}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Save
            </button>
            <button
              onClick={() => setEditingCommentId(null)}
              className="px-3 py-1 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div>
          <div className="flex justify-between items-center mb-1">
            <p className="font-medium text-gray-800">{comment.user?.username || "User"}:</p>
            
            {/* Comment Actions - Always visible for authorized users */}
            {(isOwnComment(comment.user) || hasModeratorPermissions()) && (
              <div className="flex space-x-1">
                {isOwnComment(comment.user) && (
                  <button
                    onClick={handleEditComment}
                    className="text-blue-600 hover:text-blue-800"
                    aria-label="Edit comment"
                  >
                    <Edit size={16} />
                  </button>
                )}
                
                <button
                  onClick={handleDeleteComment}
                  className="text-red-600 hover:text-red-800"
                  aria-label="Delete comment"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            )}
          </div>
          <p className="text-gray-600">{comment.text}</p>
        </div>
      )}
    </div>
  );
};

export default CommentItem;