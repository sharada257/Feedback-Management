import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getUserProfile } from "../api/auth";
import axiosInstance from "../api/axiosConfig";
import { MessageSquare, ThumbsUp, Activity, ListChecks, TrendingUp, Users, Clock } from "lucide-react";

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

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [userRes, boardsRes] = await Promise.all([
          getUserProfile(),
          axiosInstance.get("/boards/")
        ]);

        setUser(userRes);

        // If boards exist, get stats for the first board
        if (boardsRes.data && boardsRes.data.length > 0) {
          const statsRes = await axiosInstance.get(`/boards/${boardsRes.data[0].id}/get_stats/`);
          setStats(statsRes.data);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);


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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto animate-pulse space-y-8">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
            ))}
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
            Dashboard
          </h2>
          
          {user && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-8">
              <p className="text-lg text-gray-800">
                Welcome, <span className="font-semibold text-blue-600">{user.username}</span>!
                Your role is <span className="font-semibold text-indigo-600">{user.role}</span>.
              </p>
            </div>
          )}

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
              value={stats.feedbacks_by_status['In Progress']}
              color="yellow"
            />
            <StatCard
              icon={Users}
              title="Completed"
              value={stats.feedbacks_by_status['Completed']}
              color="purple"
            />
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
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

          {/* Trending Feedback */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-center gap-3 mb-6">
              <TrendingUp className="text-blue-600" size={24} />
              <h3 className="text-xl font-semibold text-gray-800">Trending Feedback</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {stats.trending_feedbacks.map((feedback) => (
                <div key={feedback.id} className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 mb-2">{feedback.title}</h4>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <ThumbsUp size={16} />
                      <span>{feedback.upvote_count}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageSquare size={16} />
                      <span>{feedback.comment_count}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;