import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Lock, User, LogIn, Sparkles, CheckCircle2 } from "lucide-react";
import { AlertMessage } from "../components/UIFeedback";

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError("Please enter both username and password.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const data = await login(username, password);
      const userRole = data.user.role;
      const redirectPath =
        location.state?.from?.pathname ||
        (userRole === "instructor"
          ? "/instructor"
          : userRole === "admin"
          ? "/admin"
          : "/dashboard");
      navigate(redirectPath, { replace: true });
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.detail ||
          "Invalid username or password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (user, pass) => {
    setUsername(user);
    setPassword(pass);
    setError("");
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-icon-circle">
            <LogIn size={26} className="text-primary" />
          </div>
          <h2 className="auth-title">Welcome Back</h2>
          <p className="auth-subtitle">
            Sign in to access personalized AI-driven learning
          </p>
        </div>

        <AlertMessage type="error" message={error} onClose={() => setError("")} />

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label" htmlFor="username">
              Username
            </label>
            <div className="input-with-icon">
              <User size={18} className="input-icon" />
              <input
                id="username"
                type="text"
                className="form-input"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">
              Password
            </label>
            <div className="input-with-icon">
              <Lock size={18} className="input-icon" />
              <input
                id="password"
                type="password"
                className="form-input"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={loading}
          >
            {loading ? (
              <span className="btn-loading">
                <span className="spinner-small"></span> Authenticating...
              </span>
            ) : (
              <span>Sign In</span>
            )}
          </button>
        </form>

        {/* Demo Fast-fill Buttons */}
        <div className="demo-accounts-box">
          <div className="demo-header">
            <Sparkles size={16} />
            <span>Quick Login with Seed Demo Accounts:</span>
          </div>
          <div className="demo-pills">
            <button
              type="button"
              className="demo-pill student"
              onClick={() => handleQuickFill("student1", "Password123!")}
            >
              <CheckCircle2 size={13} />
              <span>Student (student1)</span>
            </button>
            <button
              type="button"
              className="demo-pill instructor"
              onClick={() => handleQuickFill("instructor1", "Password123!")}
            >
              <CheckCircle2 size={13} />
              <span>Instructor (instructor1)</span>
            </button>
            <button
              type="button"
              className="demo-pill admin"
              onClick={() => handleQuickFill("admin", "Password123!")}
            >
              <CheckCircle2 size={13} />
              <span>Admin (admin)</span>
            </button>
          </div>
        </div>

        <div className="auth-footer">
          <span>Don't have an account? </span>
          <Link to="/register" className="auth-link">
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
};
