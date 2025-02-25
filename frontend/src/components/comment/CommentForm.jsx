import React, { useState } from "react";

const CommentForm = ({ feedbackId, currentUser, onAddComment }) => {
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !currentUser || isSubmitting) return;
    
    setIsSubmitting(true);
    const success = await onAddComment(newComment);
    
    if (success) {
      setNewComment("");
    }
    
    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
      <input
        type="text"
        value={newComment}
        onChange={(e) => setNewComment(e.target.value)}
        placeholder="Add a comment..."
        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
      <button
        type="submit"
        disabled={!newComment.trim() || !currentUser || isSubmitting}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? "Posting..." : "Comment"}
      </button>
    </form>
  );
};

export default CommentForm;