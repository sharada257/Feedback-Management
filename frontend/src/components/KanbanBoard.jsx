import React, { useEffect, useState } from "react";
import axiosInstance from "../api/axiosConfig";
import { useDrag, useDrop, DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import ErrorState from "./common/ErrorState";
import LoadingState from "./common/LoadingState";
import { ChevronDown } from "lucide-react";

const ITEM_TYPE = "feedback";

const FeedbackCard = ({ feedback, moveFeedback }) => {
  const [{ isDragging }, drag] = useDrag({
    type: ITEM_TYPE,
    item: { id: feedback.id, status: feedback.status },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  });

  const getStatusColor = (status) => {
    const colors = {
      'Open': 'border-l-blue-500',
      'In Progress': 'border-l-yellow-500',
      'Completed': 'border-l-green-500'
    };
    return colors[status] || 'border-l-gray-500';
  };

  return (
    <div
      ref={drag}
      className={`
        bg-white p-4 mb-3 rounded-lg shadow-sm cursor-grab
        border-l-4 ${getStatusColor(feedback.status)}
        transform transition-all duration-200
        hover:shadow-md hover:scale-[1.02]
        ${isDragging ? 'opacity-50' : 'opacity-100'}
      `}
    >
      <h4 className="font-medium text-gray-900">{feedback.title}</h4>
      <div className="mt-2 flex items-center justify-between">
        <span className="text-sm text-gray-500">ID: {feedback.id}</span>
        <span className={`
          px-2 py-1 rounded-full text-xs font-medium
          ${feedback.status === 'Open' ? 'bg-blue-100 text-blue-800' :
            feedback.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
            'bg-green-100 text-green-800'}
        `}>
          {feedback.status}
        </span>
      </div>
    </div>
  );
};

const StatusColumn = ({ status, feedbacks, moveFeedback }) => {
  const [{ isOver }, drop] = useDrop({
    accept: ITEM_TYPE,
    drop: (item) => moveFeedback(item.id, status),
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  });

  const filteredFeedbacks = feedbacks.filter(f => f.status === status);

  return (
    <div
      ref={drop}
      className={`
        w-full md:w-1/3 bg-gray-50 rounded-xl p-4
        transition-all duration-200
        ${isOver ? 'bg-blue-50 scale-[1.02]' : ''}
      `}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{status}</h3>
        <span className="px-2 py-1 bg-white rounded-full text-sm text-gray-600 shadow-sm">
          {filteredFeedbacks.length}
        </span>
      </div>
      
      <div className="min-h-[200px]">
        {filteredFeedbacks.map((item) => (
          <FeedbackCard
            key={item.id}
            feedback={item}
            moveFeedback={moveFeedback}
          />
        ))}
        {filteredFeedbacks.length === 0 && (
          <div className="text-center py-8 text-gray-400 bg-white rounded-lg border-2 border-dashed">
            Drop items here
          </div>
        )}
      </div>
    </div>
  );
};

const BoardSelector = ({ boards, selectedBoard, onBoardChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative mb-6">
      <div 
        className="flex items-center justify-between bg-white rounded-lg shadow-sm p-3 cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="font-medium text-gray-800">
          {selectedBoard ? selectedBoard.name : "Select a board"}
        </div>
        <ChevronDown className={`text-gray-600 transition-transform ${isOpen ? 'rotate-180' : ''}`} size={20} />
      </div>
      
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-lg overflow-hidden">
          {boards.map((board) => (
            <div
              key={board.id}
              className="p-3 hover:bg-blue-50 cursor-pointer transition-colors"
              onClick={() => {
                onBoardChange(board);
                setIsOpen(false);
              }}
            >
              <div className="font-medium text-gray-800">{board.name}</div>
              <div className="text-sm text-gray-500">
                {board.is_public ? "Public" : "Private"}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const KanbanBoard = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [boards, setBoards] = useState([]);
  const [selectedBoard, setSelectedBoard] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axiosInstance
      .get("boards/")
      .then((res) => {
        setBoards(res.data);
        if (res.data.length > 0) {
          setSelectedBoard(res.data[0]);
        }
      })
      .catch((err) => {
        console.error("Failed to load boards:", err);
        setError("Failed to load boards");
        setIsLoading(false);
      });
  }, []);




  const fetchBoardFeedbacks =(async () => {
    if (selectedBoard) {
      try {
        setIsLoading(true);
        console.log(`Fetching all feedbacks and filtering for board ${selectedBoard.id}`);
        const response = await axiosInstance.get(`feedbacks/`);
        const filteredFeedbacks = response.data.filter(feedback => feedback.board === parseInt(selectedBoard.id, 10));
        console.log('Filtered feedbacks with comments:', filteredFeedbacks);
        setFeedbacks(filteredFeedbacks);
        setError(null);
      } catch (error) {
        console.error("Error fetching feedbacks:", error);
        setError("Failed to load feedbacks");
      } finally {
        setIsLoading(false);
      }
  }});


  useEffect(() => {
    if (selectedBoard) {
      fetchBoardFeedbacks();
    }
  }, [selectedBoard]);
  

  const handleBoardChange = (board) => {
    setSelectedBoard(board);
  };

  const moveFeedback = (id, newStatus) => {
    setFeedbacks((prevFeedbacks) =>
      prevFeedbacks.map((item) =>
        item.id === id ? { ...item, status: newStatus } : item
      )
    );

    axiosInstance.patch(`feedbacks/${id}/`, { status: newStatus });
  };

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState />;
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-6">
            Kanban Board
          </h2>
          
          {/* Board selector component */}
          <BoardSelector 
            boards={boards} 
            selectedBoard={selectedBoard} 
            onBoardChange={handleBoardChange} 
          />
          
          <div className="flex flex-col md:flex-row gap-6">
            {["Open", "In Progress", "Completed"].map((status) => (
              <StatusColumn
                key={status}
                status={status}
                feedbacks={feedbacks}
                moveFeedback={moveFeedback}
              />
            ))}
          </div>
        </div>
      </div>
    </DndProvider>
  );
};

export default KanbanBoard;