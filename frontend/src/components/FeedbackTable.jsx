import React, { useEffect, useState } from "react";
import axiosInstance from "../api/axiosConfig";

const FeedbackTable = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [filteredFeedbacks, setFilteredFeedbacks] = useState([]);
  const [boards, setBoards] = useState([]);
  const [selectedBoard, setSelectedBoard] = useState(""); // Store board ID
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([
      axiosInstance.get("feedbacks/"),
      axiosInstance.get("boards/"),
    ])
      .then(([feedbackRes, boardRes]) => {
        console.log("📌 Feedback API Response:", feedbackRes.data);
        console.log("📌 Board API Response:", boardRes.data);

        setFeedbacks(feedbackRes.data);
        setFilteredFeedbacks(feedbackRes.data);
        setBoards(boardRes.data); // Boards now have ID & Name
        setIsLoading(false);
      })
      .catch(() => {
        setError("Failed to load data");
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    let filtered = feedbacks;

    console.log("🔎 Selected Board ID:", selectedBoard);

    if (selectedBoard) {
      filtered = filtered.filter((f) => {
        console.log(`⚡ Comparing: ${f.board} === ${Number(selectedBoard)}`);
        return f.board === Number(selectedBoard);
      });
      
    }

    if (selectedStatus) {
      filtered = filtered.filter((f) => f.status === selectedStatus);
    }

    if (selectedDate) {
      filtered = filtered.filter((f) => {
        const feedbackDate = new Date(f.created_at).toISOString().split("T")[0]; // Convert to YYYY-MM-DD format
        return feedbackDate === selectedDate;
      });
    }

    console.log("✅ Filtered Feedbacks:", filtered);
    setFilteredFeedbacks(filtered);
  }, [selectedBoard, selectedStatus, selectedDate, feedbacks]);

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-lg">
        <div className="px-6 py-4 border-b border-gray-100 flex gap-4">
          <h2 className="text-2xl font-bold text-blue-600">Feedback Table</h2>

          {/* Board Dropdown - Displays Name, Stores ID */}
          <select
            className="border p-2 rounded"
            value={selectedBoard}
            onChange={(e) => setSelectedBoard(e.target.value)}
          >
            <option value="">All Boards</option>
            {boards.map((board) => (
              <option key={board.id} value={board.id}>
                {board.name} {/* Display Name, Store ID */}
              </option>
            ))}
          </select>

          <select
            className="border p-2 rounded"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>

          <input
            type="date"
            className="border p-2 rounded"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
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
