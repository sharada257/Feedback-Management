import React, { useEffect, useState, useMemo } from "react";
import { getUserProfile } from "../../api/auth";
import axiosInstance from "../../api/axiosConfig";
import { MessageSquare, ThumbsUp, Activity, ListChecks, TrendingUp, Users, Clock} from "lucide-react";
import { PieChart, Pie, Tooltip, ResponsiveContainer, Cell, Legend} from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28"];
const INITIAL_STATS = {
  active_feedbacks: 0,
  total_feedbacks: 0,
  trending_feedbacks: [],
  feedbacks_by_status: {
    Open: 0,
    'In Progress': 0,
    Completed: 0
  }
};

const StatCard = ({ icon: Icon, title, value, color }) => (
  <div 
    className="bg-white rounded-xl shadow-sm p-5 flex flex-col justify-between border-l-4" 
    style={{ borderColor: `var(--color-${color}-500)` }}
  >
    <div className="flex items-center gap-3">
      <div className={`bg-${color}-100 p-2 rounded-lg`}>
        <Icon className={`text-${color}-600`} size={18} />
      </div>
      <h3 className="text-base font-medium text-gray-700">{title}</h3>
    </div>
    <p className="text-3xl font-bold text-gray-900 mt-3">{value}</p>
  </div>
);

const FeedbackItem = ({ feedback, index }) => (
  <div 
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
);

const StatusChart = ({ feedbacksByStatus }) => {
  const chartData = useMemo(() => [
    { name: 'Open', value: feedbacksByStatus['Open'] || 0 },
    { name: 'In Progress', value: feedbacksByStatus['In Progress'] || 0 },
    { name: 'Completed', value: feedbacksByStatus['Completed'] || 0 }
  ], [feedbacksByStatus]);

  const total = useMemo(() => 
    chartData.reduce((acc, curr) => acc + curr.value, 0), 
    [chartData]
  );

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    
    return percent > 0 ? (
      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central"fontSize={12}fontWeight="bold">
      {`${(percent * 100).toFixed(0)}%`}
      </text>
    ) : null;
  };

  const hasData = chartData.some(item => item.value > 0);

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 h-full">
      <div className="flex items-center gap-2 mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Status Overview</h3>
      </div>
      
      {hasData ? (
        <div className="flex flex-col items-center h-full">
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius={90}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value) => [`${value} (${(value/total*100).toFixed(1)}%)`, 'Count']}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
          
          <div className="grid grid-cols-3 gap-4 w-full mt-4">
            {chartData.map((entry, index) => (
              <div key={`stat-${index}`} className="text-center">
                <div 
                  className="w-4 h-4 mx-auto mb-1 rounded-full" 
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <p className="text-sm font-medium">{entry.name}</p>
                <p className="text-lg font-bold">{entry.value}</p>
                <p className="text-xs text-gray-500">
                  {total > 0 ? `${(entry.value/total*100).toFixed(1)}%` : '0%'}
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg text-center text-gray-500">
          No data available
        </div>
      )}
    </div>
  );
};

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState(INITIAL_STATS);
  const [selectedBoardId, setSelectedBoardId] = useState(null);
  const [boards, setBoards] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const [userRes, boardsRes] = await Promise.all([
        getUserProfile(),
        axiosInstance.get("/boards/")
      ]);
      
      setUser(userRes);
      setBoards(boardsRes.data);

      if (boardsRes.data?.length > 0) {
        const boardId = boardsRes.data[0].id;
        setSelectedBoardId(boardId);
        await updateData(boardId, statusFilter);
      }
    } 
    catch (error) {
      console.error("Error fetching dashboard data:", error);
    } 
    finally {
      setIsLoading(false);
    }
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

  const handleStatusFilterChange = (e) => {
    const status = e.target.value;
    setStatusFilter(status);
    updateData(selectedBoardId, status);
  };

  const handleBoardChange = (e) => {
    const boardId = e.target.value;
    setSelectedBoardId(boardId);
    updateData(boardId, statusFilter);
  };

  const statCardData = useMemo(() => [
    { icon: Activity, title: "Active", value: stats.active_feedbacks, color: "blue" },
    { icon: ListChecks, title: "Total", value: stats.total_feedbacks, color: "green" },
    { icon: Clock, title: "In Progress", value: stats.feedbacks_by_status['In Progress'] || 0, color: "yellow" },
    { icon: Users, title: "Completed", value: stats.feedbacks_by_status['Completed'] || 0, color: "purple" }
  ], [stats]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

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
              onChange={handleBoardChange}
            >
              {boards.map(board => (
                <option key={board.id} value={board.id}>{board.name}</option>
              ))}
            </select>
            
            <select 
              className="p-2 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={statusFilter}
              onChange={handleStatusFilterChange}
            >
              <option value="all">All Statuses</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        </header>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {statCardData.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <TrendingUp className="text-blue-600" size={20} />
                  <h3 className="text-lg font-semibold text-gray-800">Top Voted Feedback</h3>
                </div>
              </div>
              
              {stats.trending_feedbacks?.length > 0 ? (
                <div className="space-y-4">
                  {stats.trending_feedbacks.map((feedback, index) => (
                    <FeedbackItem key={feedback.id || index} feedback={feedback} index={index} />
                  ))}
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-6 text-center text-gray-500">
                  No trending feedback available
                </div>
              )}
            </div>
          </div>
          
          <div className="lg:col-span-1">
            <StatusChart feedbacksByStatus={stats.feedbacks_by_status} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;