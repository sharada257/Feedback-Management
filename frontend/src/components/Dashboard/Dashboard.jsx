import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getUserProfile } from "../../api/auth";
import axiosInstance from "../../api/axiosConfig";
import { 
  MessageSquare, 
  ThumbsUp, 
  Activity, 
  ListChecks, 
  TrendingUp, 
  Users, 
  Clock,
  Building,
  BarChart2,
  ChevronRight
} from "lucide-react";
import { 
  PieChart, 
  Pie, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from "recharts";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    active_feedbacks: 0,
    total_feedbacks: 0,
    trending_feedbacks: [],
    feedbacks_by_status: {
      Open: 0,
      'In Progress': 0,
      Completed: 0
    }
  });
  const [selectedBoardId, setSelectedBoardId] = useState(null);
  const [boards, setBoards] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28"];

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const [userRes, boardsRes] = await Promise.all([
        getUserProfile(),
        axiosInstance.get("/boards/")
      ]);
      console.log("📌 User Profile:", userRes);
      setUser(userRes);
      setBoards(boardsRes.data);

      if (boardsRes.data && boardsRes.data.length > 0) {
        const boardId = boardsRes.data[0].id;
        setSelectedBoardId(boardId);
        
        const statsRes = await axiosInstance.get(`/boards/${boardId}/get_stats/`);
        setStats(statsRes.data);
      }
    } 
    catch (error) {
      console.error("Error fetching dashboard data:", error);
    } 
    finally {
      setIsLoading(false);
    }
  };

  const handleStatusFilterChange = async (status) => {
    setStatusFilter(status);
    updateData(selectedBoardId, status);
  };

  const handleBoardChange = async (boardId) => {
    setSelectedBoardId(boardId);
    updateData(boardId, statusFilter);
  };

  const updateData = async (boardId, status) => {
    try {
      setIsLoading(true);
      
      const statsRes = await axiosInstance.get(`/boards/${boardId}/get_stats/`);
      setStats(statsRes.data);
    } catch (error) {
      console.error("Error updating data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Feedback Dashboard
            </h1>
            {user && (
              <p className="text-gray-600 mt-1">
                Welcome, <span className="font-medium text-gray-800">{user.user.username}</span>
              </p>
            )}
          </div>
          
          <div className="flex gap-3">
            <select 
              className="p-2 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={selectedBoardId || ""}
              onChange={(e) => handleBoardChange(e.target.value)}
            >
              {boards.map(board => (
                <option key={board.id} value={board.id}>{board.name}</option>
              ))}
            </select>
            
            <select 
              className="p-2 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={statusFilter}
              onChange={(e) => handleStatusFilterChange(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        </header>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { icon: Activity, title: "Active", value: stats.active_feedbacks, color: "blue" },
            { icon: ListChecks, title: "Total", value: stats.total_feedbacks, color: "green" },
            { icon: Clock, title: "In Progress", value: stats.feedbacks_by_status['In Progress'] || 0, color: "yellow" },
            { icon: Users, title: "Completed", value: stats.feedbacks_by_status['Completed'] || 0, color: "purple" }
          ].map((stat, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm p-5 flex flex-col justify-between border-l-4" 
                 style={{ borderColor: `var(--color-${stat.color}-500)` }}>
              <div className="flex items-center gap-3">
                <div className={`bg-${stat.color}-100 p-2 rounded-lg`}>
                  <stat.icon className={`text-${stat.color}-600`} size={18} />
                </div>
                <h3 className="text-base font-medium text-gray-700">{stat.title}</h3>
              </div>
              <p className="text-3xl font-bold text-gray-900 mt-3">{stat.value}</p>
            </div>
          ))}
        </div>
        
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Trending Feedback */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <TrendingUp className="text-blue-600" size={20} />
                  <h3 className="text-lg font-semibold text-gray-800">Top Voted Feedback</h3>
                </div>
                
              </div>
              
              {stats.trending_feedbacks && stats.trending_feedbacks.length > 0 ? (
                <div className="space-y-3">
                  {stats.trending_feedbacks.map((feedback, index) => (
                    <div 
                      key={feedback.id || index} 
                      className={`${index === 0 
                        ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500' 
                        : 'bg-gray-50'} rounded-lg p-4 hover:shadow-sm transition-shadow`}
                    >
                      <h4 className="font-semibold text-gray-800 mb-2 line-clamp-1">{feedback.title}</h4>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <ThumbsUp size={16} className={index === 0 ? "text-blue-500" : ""} />
                          <span className={index === 0 ? "font-bold text-blue-500" : ""}>{feedback.upvote_count}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageSquare size={16} />
                          <span>{feedback.comment_count}</span>
                        </div>
                        <div className={`${
                          feedback.status === 'Open' ? 'bg-blue-100 text-blue-800' : 
                          feedback.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        } px-2.5 py-0.5 rounded-full text-xs font-medium`}>
                          {feedback.status}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-6 text-center text-gray-500">
                  No trending feedback available
                </div>
              )}
            </div>
          </div>
          
          {/* Right Column - Charts */}
          <div className="space-y-6">
            {/* Status Distribution */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <BarChart2 className="text-blue-600" size={20} />
                <h3 className="text-lg font-semibold text-gray-800">Status Overview</h3>
              </div>
              
              {stats.feedbacks_by_status && Object.keys(stats.feedbacks_by_status).length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Open', value: stats.feedbacks_by_status['Open'] || 0 },
                        { name: 'In Progress', value: stats.feedbacks_by_status['In Progress'] || 0 },
                        { name: 'Completed', value: stats.feedbacks_by_status['Completed'] || 0 }
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {[
                        { name: 'Open', value: stats.feedbacks_by_status['Open'] || 0 },
                        { name: 'In Progress', value: stats.feedbacks_by_status['In Progress'] || 0 },
                        { name: 'Completed', value: stats.feedbacks_by_status['Completed'] || 0 }
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="bg-gray-50 rounded-lg p-6 text-center text-gray-500">
                  No data available
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;