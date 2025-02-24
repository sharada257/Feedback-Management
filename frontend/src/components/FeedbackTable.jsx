import React, { useEffect, useState } from "react";
import axiosInstance from "../api/axiosConfig";

const FeedbackTable = () => {
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
      .catch(() => {
        setError("Failed to load feedback data");
        setIsLoading(false);
      });
  }, []);

  const getStatusColor = (status) => {
    const statusColors = {
      'Open': 'bg-blue-100 text-blue-800',
      'In Progress': 'bg-yellow-100 text-yellow-800',
      'Completed': 'bg-green-100 text-green-800',
      'default': 'bg-gray-100 text-gray-800'
    };
    return statusColors[status] || statusColors.default;
  };

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-lg">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Feedback Table
          </h2>
        </div>

        {isLoading ? (
          <div className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-10 bg-gray-100 rounded w-full"></div>
              <div className="h-10 bg-gray-50 rounded w-full"></div>
              <div className="h-10 bg-gray-50 rounded w-full"></div>
            </div>
          </div>
        ) : error ? (
          <div className="p-6">
            <div className="bg-red-50 text-red-600 p-4 rounded-lg">
              {error}
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Title
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {feedbacks.map((item) => (
                  <tr 
                    key={item.id} 
                    className="hover:bg-gray-50 transition-colors duration-150"
                  >
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {item.title}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium
                        ${getStatusColor(item.status)}`}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {feedbacks.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No feedback items found
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FeedbackTable;