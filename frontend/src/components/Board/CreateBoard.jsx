import React, { useState } from "react";
import { Plus } from "lucide-react";
import axiosInstance from "../../api/axiosConfig";

const CreateBoard = ({ onBoardCreated }) => {
  const [newBoard, setNewBoard] = useState({
    name: "",
    is_public: true
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axiosInstance.post("boards/", newBoard);
      setNewBoard({ name: "", is_public: true });
      if (onBoardCreated) {
        onBoardCreated(response.data);
      }
    } catch (error) {
      console.error("Error creating board:", error);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
      <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-6">
        Create New Board
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="text"
            placeholder="Board name..."
            value={newBoard.name}
            onChange={(e) => setNewBoard({ ...newBoard, name: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="isPublic"
            checked={newBoard.is_public}
            onChange={(e) => setNewBoard({ ...newBoard, is_public: e.target.checked })}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="isPublic" className="text-gray-700">Make board public</label>
        </div>
        <button
          type="submit"
          className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={18} />
          Create Board
        </button>
      </form>
    </div>
  );
};
export default CreateBoard;
