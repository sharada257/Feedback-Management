import React, { useEffect, useState } from "react";
import axiosInstance from "../api/axiosConfig";

const FeedbackTable = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [filteredFeedbacks, setFilteredFeedbacks] = useState([]);
  const [boards, setBoards] = useState([]);
  const [selectedBoard, setSelectedBoard] = useState(""); 
  const [selectedStatus, setSelectedStatus] = useState("");
  const [dateFilterType, setDateFilterType] = useState("specific"); 
  const [selectedDate, setSelectedDate] = useState("");
  const [dateRange, setDateRange] = useState({
    startDate: "",
    endDate: ""
  });
  const [presetRange, setPresetRange] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([
      axiosInstance.get("feedbacks/"),
      axiosInstance.get("boards/"),
    ])
      .then(([feedbackRes, boardRes]) => {
        setFeedbacks(feedbackRes.data);
        setFilteredFeedbacks(feedbackRes.data);
        setBoards(boardRes.data); 
        setIsLoading(false);
      })
      .catch(() => {
        setError("Failed to load data");
        setIsLoading(false);
      });
  }, []);

  const calculatePresetDateRange = (preset) => {
    const today = new Date();
    let startDate = new Date(today);
    let endDate = new Date(today);

    switch (preset) {
      case "10days":
        startDate.setDate(today.getDate() - 10);
        break;
      case "30days":
        startDate.setDate(today.getDate() - 30);
        break;
      case "90days":
        startDate.setDate(today.getDate() - 90);
        break;
      case "thisMonth":
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        break;
      case "lastMonth":
        startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        endDate = new Date(today.getFullYear(), today.getMonth(), 0);
        break;
      case "thisYear":
        startDate = new Date(today.getFullYear(), 0, 1);
        endDate = new Date(today.getFullYear(), 11, 31);
        break;
      case "lastYear":
        startDate = new Date(today.getFullYear() - 1, 0, 1);
        endDate = new Date(today.getFullYear() - 1, 11, 31);
        break;
      default:
        return { startDate: "", endDate: "" };
    }

    return {
      startDate: startDate.toISOString().split("T")[0],
      endDate: endDate.toISOString().split("T")[0]
    };
  };
  useEffect(() => {
    if (presetRange) {
      const { startDate, endDate } = calculatePresetDateRange(presetRange);
      setDateRange({ startDate, endDate });
    }
  }, [presetRange]);

  useEffect(() => {
    let filtered = feedbacks;
    if (selectedBoard) {
      filtered = filtered.filter((f) => {
        return f.board === Number(selectedBoard);
      });
    }

    if (selectedStatus) {
      filtered = filtered.filter((f) => f.status === selectedStatus);
    }
    if (dateFilterType === "specific" && selectedDate) {
      filtered = filtered.filter((f) => {
        const feedbackDate = new Date(f.created_at).toISOString().split("T")[0];
        return feedbackDate === selectedDate;
      });
    } else if (dateFilterType === "range" || (dateFilterType === "preset" && presetRange)) {
      const { startDate, endDate } = dateRange;
      
      if (startDate && endDate) {
        filtered = filtered.filter((f) => {
          const feedbackDate = new Date(f.created_at).toISOString().split("T")[0];
          return feedbackDate >= startDate && feedbackDate <= endDate;
        });
      } else if (startDate) {
        filtered = filtered.filter((f) => {
          const feedbackDate = new Date(f.created_at).toISOString().split("T")[0];
          return feedbackDate >= startDate;
        });
      } else if (endDate) {
        filtered = filtered.filter((f) => {
          const feedbackDate = new Date(f.created_at).toISOString().split("T")[0];
          return feedbackDate <= endDate;
        });
      }
    }

    setFilteredFeedbacks(filtered);
  }, [selectedBoard, selectedStatus, dateFilterType, selectedDate, dateRange, presetRange, feedbacks]);

  const handleDateFilterTypeChange = (type) => {
    setDateFilterType(type);
    if (type === "specific") {
      setDateRange({ startDate: "", endDate: "" });
      setPresetRange("");
    } else if (type === "range") {
      setSelectedDate("");
      setPresetRange("");
    } else if (type === "preset") {
      setSelectedDate("");
      setDateRange({ startDate: "", endDate: "" });
    }
  };

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-lg">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-2xl font-bold text-blue-600 mb-4">Feedback Table</h2>
          
          <div className="flex flex-wrap gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Board</label>
              <select
                className="border p-2 rounded w-40"
                value={selectedBoard}
                onChange={(e) => setSelectedBoard(e.target.value)}
              >
                <option value="">All Boards</option>
                {boards.map((board) => (
                  <option key={board.id} value={board.id}>
                    {board.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                className="border p-2 rounded w-40"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="">All Status</option>
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>

          <div className="mb-4">
            <div className="flex gap-4 mb-2">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="dateFilterType"
                  checked={dateFilterType === "specific"}
                  onChange={() => handleDateFilterTypeChange("specific")}
                  className="form-radio h-4 w-4 text-blue-600"
                />
                <span className="ml-2">Specific Date</span>
              </label>
              
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="dateFilterType"
                  checked={dateFilterType === "range"}
                  onChange={() => handleDateFilterTypeChange("range")}
                  className="form-radio h-4 w-4 text-blue-600"
                />
                <span className="ml-2">Date Range</span>
              </label>
              
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="dateFilterType"
                  checked={dateFilterType === "preset"}
                  onChange={() => handleDateFilterTypeChange("preset")}
                  className="form-radio h-4 w-4 text-blue-600"
                />
                <span className="ml-2">Preset Range</span>
              </label>
            </div>

            <div className="flex flex-wrap gap-4">
              {dateFilterType === "specific" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    className="border p-2 rounded"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                  />
                </div>
              )}

              {dateFilterType === "range" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                    <input
                      type="date"
                      className="border p-2 rounded"
                      value={dateRange.startDate}
                      onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                    <input
                      type="date"
                      className="border p-2 rounded"
                      value={dateRange.endDate}
                      onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                    />
                  </div>
                </>
              )}
              {dateFilterType === "preset" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Select Range</label>
                  <select
                    className="border p-2 rounded w-48"
                    value={presetRange}
                    onChange={(e) => setPresetRange(e.target.value)}
                  >
                    <option value="">Select a range</option>
                    <option value="10days">Last 10 days</option>
                    <option value="30days">Last 30 days</option>
                    <option value="90days">Last 90 days</option>
                    <option value="thisMonth">This month</option>
                    <option value="lastMonth">Last month</option>
                    <option value="thisYear">This year</option>
                    <option value="lastYear">Last year</option>
                  </select>
                  {presetRange && dateRange.startDate && dateRange.endDate && (
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(dateRange.startDate).toLocaleDateString()} - {new Date(dateRange.endDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="p-6">Loading...</div>
        ) : error ? (
          <div className="p-6 text-red-600">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="px-6 py-4 text-left">Title</th>
                  <th className="px-6 py-4 text-left">Board</th>
                  <th className="px-6 py-4 text-left">Status</th>
                  <th className="px-6 py-4 text-left">Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredFeedbacks.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">{item.title}</td>
                    <td className="px-6 py-4">
                      {boards.find((b) => b.id === item.board)?.name || "Unknown"}
                    </td>
                    <td className="px-6 py-4">{item.status}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{item.created_at ? new Date(item.created_at).toLocaleDateString() : "No Date"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredFeedbacks.length === 0 && (
              <div className="text-center py-4">No feedbacks found</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
export default FeedbackTable;