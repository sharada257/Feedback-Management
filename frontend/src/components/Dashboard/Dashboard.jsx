import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getUserProfile } from "../../api/auth";
import axiosInstance from "../../api/axiosConfig";
import { MessageSquare, ThumbsUp, Activity, ListChecks, TrendingUp, Users, Clock,Filter,Tag,Calendar,BarChart2} from "lucide-react";
import { LineChart, Line, BarChart, Bar,PieChart, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";

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
  const [feedbackData, setFeedbackData] = useState([]);
  const [tagDistribution, setTagDistribution] = useState([]);
  const [timeRange, setTimeRange] = useState("weekly");
  const [statusFilter, setStatusFilter] = useState("all");
  const [tagFilter, setTagFilter] = useState("all");
  const [trendData, setTrendData] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);
  const [selectedBoardId, setSelectedBoardId] = useState(null);
  const [boards, setBoards] = useState([]);

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"];

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const [userRes, boardsRes] = await Promise.all([
        getUserProfile(),
        axiosInstance.get("/boards/")
      ]);

      setUser(userRes);
      setBoards(boardsRes.data);

      if (boardsRes.data && boardsRes.data.length > 0) {
        const boardId = boardsRes.data[0].id;
        setSelectedBoardId(boardId);
        
        // Get board stats first to ensure trending feedbacks are available
        const statsRes = await axiosInstance.get(`/boards/${boardId}/get_stats/`);
        setStats(statsRes.data);
        
        // Then fetch other data
        const [feedbackRes, tagsRes, trendsRes] = await Promise.all([
          axiosInstance.get(`/feedbacks/?board=${boardId}`),
          axiosInstance.get(`/boards/${boardId}/tag_distribution/`), //not implemented yet
          axiosInstance.get(`/boards/${boardId}/feedback_trends/?time_range=${timeRange}`) //not implemented yet
        ]);
        
        setFeedbackData(feedbackRes.data);
        setTagDistribution(tagsRes.data.tags || []);
        setAvailableTags(tagsRes.data.available_tags || []);
        setTrendData(trendsRes.data.trends || []);
      }
    } 
    catch (error) {
      console.error("Error fetching dashboard data:", error);
    } 
    finally {
      setIsLoading(false);
    }
  };

  // Handle filter changes with properly working implementations
  const handleTimeRangeChange = async (range) => {
    try {
      setIsLoading(true);
      setTimeRange(range);
      if (selectedBoardId) {
        const trendsRes = await axiosInstance.get(
          `/boards/${selectedBoardId}/feedback_trends/?time_range=${range}`
        );
        setTrendData(trendsRes.data.trends || []);
      }
    } catch (error) {
      console.error("Error fetching trends:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusFilterChange = async (status) => {
    try {
      setIsLoading(true);
      setStatusFilter(status);
      if (selectedBoardId) {
        const url = status === "all" 
          ? `/feedbacks/?board=${selectedBoardId}` 
          : `/feedbacks/?board=${selectedBoardId}&status=${status}`;
        
        const feedbackRes = await axiosInstance.get(url);
        setFeedbackData(feedbackRes.data);
      }
    } catch (error) {
      console.error("Error filtering by status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTagFilterChange = async (tag) => {
    try {
      setIsLoading(true);
      setTagFilter(tag);
      if (selectedBoardId) {
        const url = tag === "all"
          ? `/feedbacks/?board=${selectedBoardId}`
          : `/feedbacks/?board=${selectedBoardId}&tag=${tag}`;
        
        const feedbackRes = await axiosInstance.get(url);
        setFeedbackData(feedbackRes.data);
      }
    } catch (error) {
      console.error("Error filtering by tag:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBoardChange = async (boardId) => {
    try {
      setIsLoading(true);
      setSelectedBoardId(boardId);
      
      // Get board stats first
      const statsRes = await axiosInstance.get(`/boards/${boardId}/get_stats/`);
      setStats(statsRes.data);
      
      const feedbackUrl = statusFilter === "all" 
        ? `/feedbacks/?board=${boardId}`
        : `/feedbacks/?board=${boardId}&status=${statusFilter}`;
        
      const [feedbackRes, tagsRes, trendsRes] = await Promise.all([
        axiosInstance.get(feedbackUrl),
        axiosInstance.get(`/boards/${boardId}/tag_distribution/`),
        axiosInstance.get(`/boards/${boardId}/feedback_trends/?time_range=${timeRange}`)
      ]);
      
      setFeedbackData(feedbackRes.data);
      setTagDistribution(tagsRes.data.tags || []);
      setAvailableTags(tagsRes.data.available_tags || []);
      setTrendData(trendsRes.data.trends || []);
    } catch (error) {
      console.error("Error fetching board data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Components
  const StatCard = ({ icon: Icon, title, value, color = "blue" }) => (
    <div className="bg-white rounded-xl shadow-md p-6 border-l-4" style={{ borderColor: `var(--color-${color}-500)` }}>
      <div className="flex items-center gap-3 mb-2">
        <Icon className={`text-${color}-600`} size={24} />
        <h3 className="text-lg font-semibold text-gray-700">{title}</h3>
      </div>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
    </div>
  );

  const QuickAction = ({ to, icon: Icon, title, description }) => (
    <Link to={to} className="block p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow">
      <div className="flex items-center gap-3 mb-2">
        <Icon className="text-blue-600" size={24} />
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
      </div>
      <p className="text-gray-600">{description}</p>
    </Link>
  );

  // Render the filter section with event handlers
  const FilterSection = () => (
    <div className="bg-white rounded-xl shadow-md p-6 mb-8">
      <div className="flex items-center gap-3 mb-4">
        <Filter className="text-blue-600" size={24} />
        <h3 className="text-xl font-semibold text-gray-800">Filters</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Board Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Board</label>
          <select 
            className="w-full p-2 border border-gray-300 rounded-md"
            value={selectedBoardId || ""}
            onChange={(e) => handleBoardChange(e.target.value)}
          >
            {boards.map(board => (
              <option key={board.id} value={board.id}>{board.name}</option>
            ))}
          </select>
        </div>
        
        {/* Time Range Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Time Range</label>
          <select 
            className="w-full p-2 border border-gray-300 rounded-md"
            value={timeRange}
            onChange={(e) => handleTimeRangeChange(e.target.value)}
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>
        
        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
          <select 
            className="w-full p-2 border border-gray-300 rounded-md"
            value={statusFilter}
            onChange={(e) => handleStatusFilterChange(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
        
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Tag</label>
          <select 
            className="w-full p-2 border border-gray-300 rounded-md"
            value={tagFilter}
            onChange={(e) => handleTagFilterChange(e.target.value)}
          >
            <option value="all">All Tags</option>
            {availableTags.map(tag => (
              <option key={tag} value={tag}>{tag}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );

  // Enhanced loading state with more feedback
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-6">
              Feedback Analytics Dashboard
            </h2>
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600"></div>
            </div>
            <p className="text-center text-gray-600">Loading dashboard data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-6">
            Feedback Analytics Dashboard
          </h2>
          
          {user && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-8">
              <p className="text-lg text-gray-800">
                Welcome, <span className="font-semibold text-blue-600">{user.username}</span>!
                Your role is <span className="font-semibold text-indigo-600">{user.role}</span>.
              </p>
            </div>
          )}

          {/* Filters */}
          <FilterSection />

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              icon={Activity}
              title="Active Feedbacks"
              value={stats.active_feedbacks}
              color="blue"
            />
            <StatCard
              icon={ListChecks}
              title="Total Feedbacks"
              value={stats.total_feedbacks}
              color="green"
            />
            <StatCard
              icon={Clock}
              title="In Progress"
              value={stats.feedbacks_by_status['In Progress'] || 0}
              color="yellow"
            />
            <StatCard
              icon={Users}
              title="Completed"
              value={stats.feedbacks_by_status['Completed'] || 0}
              color="purple"
            />
          </div>

          {/* Trending Feedback - Now moved above the charts for more visibility */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <TrendingUp className="text-blue-600" size={24} />
              <h3 className="text-xl font-semibold text-gray-800">Top Voted Feedback</h3>
            </div>
            
            {stats.trending_feedbacks && stats.trending_feedbacks.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {stats.trending_feedbacks.map((feedback, index) => (
                  <div 
                    key={feedback.id || index} 
                    className={`${index === 0 
                      ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500' 
                      : 'bg-gray-50'} rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow`}
                  >
                    <h4 className="font-semibold text-gray-800 mb-2">{feedback.title}</h4>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <ThumbsUp size={16} className={index === 0 ? "text-blue-500" : ""} />
                        <span className={index === 0 ? "font-bold text-blue-500" : ""}>{feedback.upvote_count}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageSquare size={16} />
                        <span>{feedback.comment_count}</span>
                      </div>
                      <div className={`${index === 0 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-gray-100 text-gray-800'} px-2 py-1 rounded text-xs`}
                      >
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

          {/* Feedback Submission Trends Over Time */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <Calendar className="text-blue-600" size={24} />
              <h3 className="text-xl font-semibold text-gray-800">
                Feedback Submission Trends ({timeRange})
              </h3>
            </div>
            
            {trendData && trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="count" 
                    stroke="#8884d8" 
                    name="Feedbacks"
                    activeDot={{ r: 8 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="bg-gray-50 rounded-lg p-6 text-center text-gray-500">
                No trend data available for this time range
              </div>
            )}
          </div>

          {/* Distribution Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Status Distribution */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center gap-3 mb-6">
                <BarChart2 className="text-blue-600" size={24} />
                <h3 className="text-xl font-semibold text-gray-800">Feedback by Status</h3>
              </div>
              
              {stats.feedbacks_by_status && Object.keys(stats.feedbacks_by_status).length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
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
                  No status distribution data available
                </div>
              )}
            </div>
            
            {/* Tag Distribution */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center gap-3 mb-6">
                <Tag className="text-blue-600" size={24} />
                <h3 className="text-xl font-semibold text-gray-800">Feedback by Tag</h3>
              </div>
              
              {tagDistribution && tagDistribution.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={tagDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#8884d8">
                      {tagDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="bg-gray-50 rounded-lg p-6 text-center text-gray-500">
                  No tag distribution data available
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <QuickAction
              to="/feedback-system"
              icon={MessageSquare}
              title="Submit Feedback"
              description="Create new feedback or suggestion"
            />
            <QuickAction
              to="/feedbacks"
              icon={ListChecks}
              title="View All Feedbacks"
              description="See all feedback submissions"
            />
            <QuickAction
              to="/kanban"
              icon={Activity}
              title="Kanban Board"
              description="Manage feedback workflow"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;