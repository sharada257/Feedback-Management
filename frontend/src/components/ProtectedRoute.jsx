import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = (props) => {
  const { children, allowedRoles } = props;
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("role");
console.log("User Role:", userRole); 
  if (!token) {
    return <Navigate to="/login" />;
  }

  if (!allowedRoles.includes(userRole)) {
    return <Navigate to="/" />;
  }

  return children;
};

export default ProtectedRoute;
