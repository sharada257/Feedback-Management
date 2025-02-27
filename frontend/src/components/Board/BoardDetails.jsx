import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Edit, Trash2 } from "lucide-react";
import axiosInstance from "../../api/axiosConfig";
import FeedbackSystem from "../Feedback/FeedbackSystem";
import { getUserProfile } from "../../api/auth";
import LoadingState from "../common/LoadingState";

const BoardDetails = () => {
  const { boardId } = useParams();
  const navigate = useNavigate();
  const [board, setBoard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState({ name: "", is_public: true });

  useEffect(() => {
        const response = getUserProfile
        setCurrentUser(response);
  }, []);



  useEffect(() => {
    const fetchBoardDetails = async () => {
      if (!boardId) return;
      
      setLoading(true);
      try {
        const response = await axiosInstance.get(`boards/${boardId}/`);
        setBoard(response.data);
        setEditData({
          name: response.data.name,
          is_public: response.data.is_public
        });
        setError(null);
      } catch (error) {
        console.error("Error fetching board details:", error);
        setError("Failed to load board details");
      } finally {
        setLoading(false);
      }
    };

    fetchBoardDetails();
  }, [boardId, navigate]);

  const handleBack = () => {
    navigate('/boards');
  };

  const hasEditPermissions = () => {
    return currentUser?.role === 'admin' || currentUser?.role === 'moderator';
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleUpdateBoard = async () => {
    try {
      const response = await axiosInstance.put(`boards/${boardId}/`, editData);
      setBoard(response.data);
      setShowEditModal(false);
    } catch (error) {
      console.error("Error updating board:", error);
      alert("Failed to update board. Please try again.");
    }
  };

  const handleDeleteBoard = async () => {
    if (window.confirm("Are you sure you want to delete this board? This action cannot be undone.")) {
      try {
        await axiosInstance.delete(`boards/${boardId}/`);
        navigate('/boards');
      } catch (error) {
        console.error("Error deleting board:", error);
        alert("Failed to delete board. Please try again.");
      }
    }
  };

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <p className="text-red-500">{error}</p>
            <button 
              onClick={handleBack}
              className="mt-4 flex items-center gap-2 mx-auto text-blue-600 hover:text-blue-800"
            >
              <ArrowLeft size={20} />
              Back to Boards
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex items-center gap-4">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Boards
          </button>
          
          <h1 className="text-2xl font-bold text-gray-800">
            {board?.name || "Board Details"}
          </h1>
          
          {board?.is_public !== undefined && (
            <span className={`ml-4 px-3 py-1 rounded-full text-sm ${
              board.is_public ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
            }`}>
              {board.is_public ? "Public" : "Private"}
            </span>
          )}
          
          {hasEditPermissions() && (
            <div className="ml-auto flex space-x-2">
              <button
                onClick={() => setShowEditModal(true)}
                className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Edit size={16} />
                Edit
              </button>
              <button
                onClick={handleDeleteBoard}
                className="flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <Trash2 size={16} />
                Delete
              </button>
            </div>
          )}
        </div>

        {showEditModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">Edit Board</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Board Name</label>
                  <input
                    type="text"
                    name="name"
                    value={editData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_public"
                    name="is_public"
                    checked={editData.is_public}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="is_public" className="ml-2 block text-sm text-gray-700">
                    Public Board
                  </label>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateBoard}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}

        {board && <FeedbackSystem boardId={boardId} currentUser={currentUser} />}
      </div>
    </div>
  );
};

export default BoardDetails;