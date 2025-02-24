import React, { useEffect, useState } from "react";
import axiosInstance from "../api/axiosConfig";
import { useDrag, useDrop, DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

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

const KanbanBoard = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axiosInstance
      .get("feedbacks/")
      .then((res) => {
        setFeedbacks(res.data);
        setIsLoading(false);
      })
      .catch((err) => {
        setError("Failed to load feedback items");
        setIsLoading(false);
      });
  }, []);

  const moveFeedback = (id, newStatus) => {
    setFeedbacks((prevFeedbacks) =>
      prevFeedbacks.map((item) =>
        item.id === id ? { ...item, status: newStatus } : item
      )
    );

    axiosInstance.patch(`feedbacks/${id}/`, { status: newStatus });
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse flex space-x-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex-1 space-y-4">
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 text-red-600 p-4 rounded-lg text-center">
          {error}
        </div>
      </div>
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-6">
            Kanban Board
          </h2>
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