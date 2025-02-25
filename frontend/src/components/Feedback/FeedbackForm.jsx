import React, { useState } from "react";
import { Plus } from "lucide-react";
import axiosInstance from "../../api/axiosConfig";

const FeedbackForm = ({ boardId, currentUser, onFeedbackAdded }) => {
  const [newFeedback, setNewFeedback] = useState({
    title: "",
    description: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewFeedback(prev => ({ ...prev, [name]: value }));
  };

  const handleAddFeedback = async (e) => {
    e.preventDefault();
    if (newFeedback.title.trim() === "") return;

    try {
      const feedbackToSubmit = {
        ...newFeedback,
        board: parseInt(boardId, 10)  // Make sure board ID is sent as a number
      };
      
      const response = await axiosInstance.post("feedbacks/", feedbackToSubmit);
      onFeedbackAdded(response.data);
      setNewFeedback({ title: "", description: "" });
    } catch (error) {
      console.error("Error posting feedback:", error);
      alert("Failed to add feedback. Please try again.");
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-6">
        Submit New Feedback
      </h2>

      <form onSubmit={handleAddFeedback} className="space-y-4">
        <div>
          <input
            type="text"
            name="title"
            placeholder="Feedback title..."
            value={newFeedback.title}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>
        <div>
          <textarea
            name="description"
            placeholder="Detailed description..."
            value={newFeedback.description}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent h-24"
          />
        </div>
        <button
          type="submit"
          disabled={!newFeedback.title.trim() || !currentUser}
          className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus size={18} />
          Submit Feedback
        </button>
      </form>
    </div>
  );
};

export default FeedbackForm;