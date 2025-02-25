import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./components/Dashboard/Dashboard";
import FeedbackTable from "./components/FeedbackTable";
import BoardDetails from "./components/Board/BoardDetails";
import KanbanBoard from "./components/KanbanBoard";
import Profile from "./components/Profile"
import ProtectedRoute from "./components/ProtectedRoute"
import Navbar from "./components/Navbar"
import FeedbackSystem from "./components/Feedback/FeedbackSystem";
import BoardList from "./components/Board/BoardList";

function App() {
  const location = useLocation(); // Get current route path
  const hideNavbarPaths = ["/login", "/register"]; // Pages where Navbar shouldn't appear
  const showNavbar = !hideNavbarPaths.includes(location.pathname); // Show Navbar only when not on these pages

  return (
    <div>
      {showNavbar && <Navbar />}

      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

  
        <Route path="/" element={<ProtectedRoute allowedRoles={["admin", "moderator", "contributor"]}><Dashboard /></ProtectedRoute>} />
        <Route path="/feedbacks" element={<FeedbackTable/>} />
        <Route path="/feedback-system" element={<FeedbackSystem/>} />

        <Route path="/boards" element={<BoardList />} />
        <Route path="/board/:boardId" element={<BoardDetails/>} />

        <Route path="/kanban" element={<ProtectedRoute allowedRoles={["admin", "moderator"]}><KanbanBoard/></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute allowedRoles={["admin", "moderator", "contributor"]}><Profile /></ProtectedRoute>} />
      </Routes>
    </div>
  );
}

export default App;
