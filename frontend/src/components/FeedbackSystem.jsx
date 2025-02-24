import React, { useEffect, useState } from "react";
import axiosInstance from "../api/axiosConfig";
import { ThumbsUp, ThumbsDown, Send, MessageSquare } from "lucide-react"; // Import icons

const FeedbackSystem = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [newFeedback, setNewFeedback] = useState({
    title: "",
    description: "",
    board: 1, // Set your default board ID
  });
  const [userVotes, setUserVotes] = useState({}); // Track user votes

  useEffect(() => {
    fetchAllFeedbacks();
    // Load user votes from localStorage
    const savedVotes = JSON.parse(localStorage.getItem('userVotes') || '{}');
    setUserVotes(savedVotes);
  }, []);

  const fetchAllFeedbacks = () => {
    axiosInstance
      .get("feedbacks/")
      .then((res) => {
        setFeedbacks(res.data);
      })
      .catch((err) => {
        console.error("Error fetching feedbacks:", err);
      });
  };

  const handleAddFeedback = (e) => {
    e.preventDefault();
    if (newFeedback.title.trim() === "") return;

    axiosInstance
      .post("feedbacks/", newFeedback)
      .then((res) => {
        setFeedbacks((prev) => [...prev, res.data]);
        setNewFeedback({ title: "", description: "", board: 1 });
      })
      .catch((err) => {
        console.error("Error posting feedback:", err);
      });
  };

  const handleVote = (feedbackId, voteType) => {
    const voteKey = `${feedbackId}-${voteType}`;
    const hasVoted = userVotes[voteKey];

    if (hasVoted) return; // Prevent multiple votes

    const updatedVotes = { ...userVotes, [voteKey]: true };
    setUserVotes(updatedVotes);
    localStorage.setItem('userVotes', JSON.stringify(updatedVotes));

    const endpoint = `feedbacks/${feedbackId}/`;
    const updateData = {
      [voteType === 'up' ? 'upvotes' : 'downvotes']: 1
    };

    axiosInstance
      .patch(endpoint, updateData)
      .then(() => fetchAllFeedbacks())
      .catch((err) => {
        console.error(`Error ${voteType}voting:`, err);
        // Revert vote on error
        delete updatedVotes[voteKey];
        setUserVotes(updatedVotes);
        localStorage.setItem('userVotes', JSON.stringify(updatedVotes));
      });
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

            <div className="flex items-center gap-4">
              <button
                onClick={() => handleVote(feedback.id, 'up')}
                disabled={userVotes[`${feedback.id}-up`]}
                className={`flex items-center gap-1 px-3 py-1 rounded-lg transition-colors ${
                  userVotes[`${feedback.id}-up`]
                    ? 'bg-green-100 text-green-700'
                    : 'hover:bg-gray-100'
                }`}
              >
                <ThumbsUp size={18} />
                <span>{feedback.upvotes || 0}</span>
              </button>

              <button
                onClick={() => handleVote(feedback.id, 'down')}
                disabled={userVotes[`${feedback.id}-down`]}
                className={`flex items-center gap-1 px-3 py-1 rounded-lg transition-colors ${
                  userVotes[`${feedback.id}-down`]
                    ? 'bg-red-100 text-red-700'
                    : 'hover:bg-gray-100'
                }`}
              >
                <ThumbsDown size={18} />
                <span>{feedback.downvotes || 0}</span>
              </button>

              <div className="flex items-center gap-1 text-gray-500">
                <MessageSquare size={18} />
                <span>{feedback.comments?.length || 0} comments</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeedbackSystem;