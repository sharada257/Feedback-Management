import React, { useState } from "react";

const FeedbackEditForm = ({ feedback, onSave, onCancel }) => {
  const [editFeedbackData, setEditFeedbackData] = useState({
    title: feedback.title,
    description: feedback.description
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditFeedbackData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!editFeedbackData.title.trim()) return;
    onSave(editFeedbackData);
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="title"
          value={editFeedbackData.title}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-3"
          required
        />
        <textarea
          name="description"
          value={editFeedbackData.description}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent h-24 mb-3"
        />
        <div className="flex space-x-2">
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Save Changes
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default FeedbackEditForm;