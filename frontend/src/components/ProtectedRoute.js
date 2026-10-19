import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="center-loader">
        <div className="spinner"></div>
        <p>Loading application...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role) && !user.is_staff) {
    // If student tries to access instructor/admin, send to their dashboard
    if (user.role === "student") {
      return <Navigate to="/dashboard" replace />;
    }
    if (user.role === "instructor") {
      return <Navigate to="/instructor" replace />;
    }
    return <Navigate to="/admin" replace />;
  }

  return children;
};
