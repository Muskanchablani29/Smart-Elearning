import React from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  BookOpen,
  LayoutDashboard,
  Brain,
  CheckSquare,
  LogOut,
  User,
  Shield,
  Layers,
  GraduationCap
} from "lucide-react";

export const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (location.pathname === "/dashboard") {
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="navbar-container">
      <div className="navbar-inner">
        {/* Brand */}
        <Link to="/" className="brand-logo">
          <Brain className="brand-icon" size={28} />
          <div className="brand-text">
            <span className="brand-title">SmartLearn AI</span>
            <span className="brand-subtitle">Adaptive E-Learning</span>
          </div>
        </Link>

        {/* Nav Links */}
        <nav className="nav-menu">
          {isAuthenticated ? (
            <>
              <NavLink
                to="/"
                className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
              >
                <span>Home</span>
              </NavLink>

              {user.role === "student" && (
                <>
                  <NavLink
                    to="/dashboard"
                    className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
                  >
                    <LayoutDashboard size={18} />
                    <span>Dashboard</span>
                  </NavLink>
                  <NavLink
                    to="/subjects"
                    className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
                  >
                    <Layers size={18} />
                    <span>Subjects</span>
                  </NavLink>
                  <NavLink
                    to="/recommendations"
                    className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
                  >
                    <Brain size={18} />
                    <span>AI Recommendations</span>
                  </NavLink>
                  <NavLink
                    to="/quizzes"
                    className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
                  >
                    <CheckSquare size={18} />
                    <span>My Quizzes</span>
                  </NavLink>
                </>
              )}

              {user.role === "instructor" && (
                <>
                  <NavLink
                    to="/instructor"
                    className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
                  >
                    <LayoutDashboard size={18} />
                    <span>Instructor Analytics</span>
                  </NavLink>
                  <NavLink
                    to="/subjects"
                    className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
                  >
                    <BookOpen size={18} />
                    <span>Manage Content</span>
                  </NavLink>
                </>
              )}

              {user.role === "admin" && (
                <>
                  <NavLink
                    to="/admin"
                    className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
                  >
                    <Shield size={18} />
                    <span>Admin Panel</span>
                  </NavLink>
                  <NavLink
                    to="/subjects"
                    className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
                  >
                    <Layers size={18} />
                    <span>Curriculum</span>
                  </NavLink>
                </>
              )}
            </>
          ) : (
            <>
              <NavLink
                to="/"
                className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
              >
                <span>Home</span>
              </NavLink>
              <a href="/#how-it-works" className="nav-link">
                <span>How It Works</span>
              </a>
              <NavLink
                to="/dashboard"
                className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
              >
                <span>Dashboard</span>
              </NavLink>
              <NavLink
                to="/login"
                className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
              >
                <span>Sign In</span>
              </NavLink>
              <NavLink
                to="/register"
                className="btn btn-primary btn-sm ml-2"
              >
                <span>Get Started</span>
              </NavLink>
            </>
          )}
        </nav>

        {/* User profile & logout */}
        {isAuthenticated && (
          <div className="nav-user-controls">
            <div className="user-info-badge">
              <div className="user-avatar">
                {user.role === "instructor" ? (
                  <GraduationCap size={16} />
                ) : user.role === "admin" ? (
                  <Shield size={16} />
                ) : (
                  <User size={16} />
                )}
              </div>
              <div className="user-details">
                <span className="user-name">{user.first_name || user.username}</span>
                <span className={`user-role-badge role-${user.role}`}>
                  {user.role}
                </span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="btn btn-icon btn-logout"
              title="Sign Out"
            >
              <LogOut size={18} />
              <span className="logout-text">Logout</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
