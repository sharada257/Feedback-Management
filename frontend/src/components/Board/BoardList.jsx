import React, { useState, useEffect } from "react";
import { Folder } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axiosConfig";
import CreateBoard from "./CreateBoard";
import LoadingState from "../common/LoadingState";
import { getUserProfile } from "../../api/auth";

const BoardList = () => {
    const [boards, setBoards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userRole, setUserRole] = useState(null); // State to store user role
    const navigate = useNavigate();
  
    useEffect(() => {
      const fetchBoards = async () => {
        try {
          const response = await axiosInstance.get("boards/");
          setBoards(response.data);
        } catch (error) {
          console.error("Error fetching boards:", error);
        } finally {
          setLoading(false);
        }
      };

      const fetchUserRole = async () => {
        try {
          const response = await getUserProfile();
          setUserRole(response.role); 
        } catch (error) {
          console.error("Error fetching user role:", error);
        }
      };

      fetchBoards();
      fetchUserRole();
    }, []);
  
    const handleBoardCreated = (newBoard) => {
      setBoards([...boards, newBoard]);
    };

    const handleBoardClick = (boardId) => {
      navigate(`/board/${boardId}`);
    };
  
    if (loading) {
      return <LoadingState />;
    }
  
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          {userRole === "admin" || userRole === "moderator" ? (
            <CreateBoard onBoardCreated={handleBoardCreated} />
          ) : null}
  
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {boards.map((board) => (
              <div
                key={board.id}
                className="bg-white rounded-xl shadow-lg p-6 cursor-pointer transition-all hover:shadow-xl"
                onClick={() => handleBoardClick(board.id)}
              >
                <div className="flex items-center gap-3 mb-4">
                  <Folder className="text-blue-600" size={24} />
                  <h3 className="text-xl font-semibold text-gray-800">{board.name}</h3>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span className={`px-2 py-1 rounded-full ${
                    board.is_public ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                  }`}>
                    {board.is_public ? "Public" : "Private"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
};

export default BoardList;
