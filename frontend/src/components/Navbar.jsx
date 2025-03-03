import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { logoutUser } from '../api/auth';
const Navbar = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setUserRole] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const authToken = localStorage.getItem('token'); 
    const role = localStorage.getItem('role'); 
    if (authToken) {
      setIsAuthenticated(true);
      setUserRole(role);
    } else {
      navigate('/login'); 
    }
  }, [navigate]); 

  if (!isAuthenticated) return null;

  return (
    <nav className="bg-gradient-to-r from-indigo-600 to-blue-500 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <h1 className="text-2xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-100">
              Feedback Management
            </h1>
          </div>

          <div className="flex items-center gap-1 sm:gap-4">
          {(role === 'admin' || role === 'moderator') && (
            <Link to="/" className="px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-white/10 hover:scale-105">
              Dashboard
            </Link>
          )}

          {(role === 'admin'  || role === 'moderator' ) && (
            <Link to="/users" className="px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-white/10 hover:scale-105">
              Users
            </Link>
          )}

            {(role === 'admin' || role === 'moderator') && (
              <Link to="/feedbacks" className="px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-white/10 hover:scale-105">
                Feedbacks
              </Link>
            )}

              {(role === 'admin' || role === 'moderator') && (
              <Link to="/kanban" className="px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-white/10 hover:scale-105">
                Kanban Board
              </Link>
            )}

            <Link to="/boards" className="px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-white/10 hover:scale-105">
              Boards
            </Link>

            <Link to="/profile" className="px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-white/10 hover:scale-105">
              Profile
            </Link>

            <button
              onClick={logoutUser}
              className="ml-4 px-4 py-2 rounded-lg text-sm font-medium bg-red-500 transition-all duration-200 hover:bg-red-600 hover:scale-105 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-blue-600"
            >Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
