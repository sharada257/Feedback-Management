import React, { useEffect, useState } from "react";
import axiosInstance from "../api/axiosConfig";
import { ThumbsUp, Send, MessageSquare } from "lucide-react";

const FeedbackSystem = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [newFeedback, setNewFeedback] = useState({
    title: "",
    description: "",
    board: 1,
  });
  const [newComment, setNewComment] = useState("");
  const [activeCommentId, setActiveCommentId] = useState(null);



  const fetchAllFeedbacks = async () => {
    try {
      const res = await axiosInstance.get("feedbacks/");
      setFeedbacks(res.data);
    } catch (err) {
      console.error("Error fetching feedbacks:", err);
    }
  };

  useEffect(() => {
    fetchAllFeedbacks();
  }, []);

  
  const handleAddFeedback = async (e) => {
    e.preventDefault();
    if (newFeedback.title.trim() === "") return;

    try {
      const res = await axiosInstance.post("feedbacks/", newFeedback);
      setFeedbacks((prev) => [...prev, res.data]);
      setNewFeedback({ title: "", description: "", board: 1 });
    } catch (err) {
      console.error("Error posting feedback:", err);
    }
  };

  const handleToggleUpvote = async (feedbackId) => {
    try {
      await axiosInstance.post(`feedbacks/${feedbackId}/toggle_upvote/`);
      fetchAllFeedbacks(); 
    } catch (err) {
      console.error("Error toggling upvote:", err);
    }
  };

  const handleAddComment = async (feedbackId) => {
    if (!newComment.trim()) return;

    try {
      await axiosInstance.post("comments/", {
        feedback: feedbackId,
        text: newComment
      });
      setNewComment("");
      setActiveCommentId(null);
      fetchAllFeedbacks();
    } catch (err) {
      console.error("Error adding comment:", err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-6">
          Submit New Feedback
        </h2>

        <form onSubmit={handleAddFeedback} className="space-y-4">
          <div>
            <input
              type="text"
              placeholder="Feedback title..."
              value={newFeedback.title}
              onChange={(e) => setNewFeedback({ ...newFeedback, title: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <textarea
              placeholder="Detailed description..."
              value={newFeedback.description}
              onChange={(e) => setNewFeedback({ ...newFeedback, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent h-24"
            />
          </div>
          <button
            type="submit"
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Send size={18} />
            Submit Feedback
          </button>
        </form>
      </div>

      <div className="space-y-4">
        {feedbacks.map((feedback) => (
          <div key={feedback.id} className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {feedback.title}
            </h3>
            <p className="text-gray-600 mb-4">{feedback.description}</p>

            <div className="flex items-center gap-4 mb-4">
              <button
                onClick={() => handleToggleUpvote(feedback.id)}
                className={`flex items-center gap-1 px-3 py-1 rounded-lg transition-colors ${
                  feedback.upvoted_by?.includes(feedback.user?.id)
                    ? 'bg-blue-100 text-blue-700'
                    : 'hover:bg-gray-100'
                }`}
              >
                <ThumbsUp size={18} />
                <span>{feedback.upvote_count}</span>
              </button>

              <button
                onClick={() => setActiveCommentId(activeCommentId === feedback.id ? null : feedback.id)}
                className="flex items-center gap-1 text-gray-500 hover:text-gray-700"
              >
                <MessageSquare size={18} />
                <span>{feedback.comment_count || 0} comments</span>
              </button>
            </div>

            {/* Comments section */}
            {feedback.comments && (
              <div className="ml-4 border-l-2 border-gray-200 pl-4">
                {feedback.comments.map((comment) => (
                  <div key={comment.id} className="mb-2 text-gray-600">
                    <p className="font-medium text-gray-800">{comment.user.username}:</p>
                    <p>{comment.text}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Add comment form */}
            {activeCommentId === feedback.id && (
              <div className="mt-4 flex gap-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={() => handleAddComment(feedback.id)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Comment
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeedbackSystem;