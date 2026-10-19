import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { User, Mail, Lock, UserPlus, GraduationCap, BookOpen } from "lucide-react";
import { AlertMessage } from "../components/UIFeedback";

export const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    first_name: "",
    last_name: "",
    password: "",
    password_confirm: "",
    role: "student",
    student_id: "",
    degree: "MCA",
    previous_education: "",
    academic_background: "",
    skill_level: "beginner",
    learning_goals: "",
    preferred_language: "English",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRoleSelect = (selectedRole) => {
    setFormData({
      ...formData,
      role: selectedRole,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.password_confirm) {
      setError("Passwords do not match.");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);

    try {
      const data = await register(formData);
      const userRole = data.user.role;
      if (userRole === "instructor") {
        navigate("/instructor");
      } else if (userRole === "admin") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      console.error(err);
      if (err.response?.data) {
        const errorData = err.response.data;
        const msg = Object.entries(errorData)
          .map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(" ") : val}`)
          .join(" | ");
        setError(msg || "Registration failed. Please check your details.");
      } else {
        setError("Network or server error during registration.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card register-card">
        <div className="auth-header">
          <div className="auth-icon-circle">
            <UserPlus size={26} className="text-primary" />
          </div>
          <h2 className="auth-title">Create an Account</h2>
          <p className="auth-subtitle">
            Join the Smart Learning Platform powered by AI Recommendations
          </p>
        </div>

        <AlertMessage type="error" message={error} onClose={() => setError("")} />

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-row">
            <div className="form-group col-half">
              <label className="form-label" htmlFor="first_name">First Name</label>
              <input
                id="first_name"
                name="first_name"
                type="text"
                className="form-input"
                placeholder="Alex"
                value={formData.first_name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group col-half">
              <label className="form-label" htmlFor="last_name">Last Name</label>
              <input
                id="last_name"
                name="last_name"
                type="text"
                className="form-input"
                placeholder="Rivera"
                value={formData.last_name}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="username">Username</label>
            <div className="input-with-icon">
              <User size={18} className="input-icon" />
              <input
                id="username"
                name="username"
                type="text"
                className="form-input"
                placeholder="Choose username"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="email">Email Address</label>
            <div className="input-with-icon">
              <Mail size={18} className="input-icon" />
              <input
                id="email"
                name="email"
                type="email"
                className="form-input"
                placeholder="student@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Role selector */}
          <div className="form-group">
            <label className="form-label">Select Your Role</label>
            <div className="role-selector-grid">
              <button
                type="button"
                className={`role-option-card ${formData.role === "student" ? "selected" : ""}`}
                onClick={() => handleRoleSelect("student")}
              >
                <BookOpen size={20} className="role-icon" />
                <span className="role-title">Student</span>
                <span className="role-desc">Learn, take quizzes, and receive AI recommendations</span>
              </button>

              <button
                type="button"
                className={`role-option-card ${formData.role === "instructor" ? "selected" : ""}`}
                onClick={() => handleRoleSelect("instructor")}
              >
                <GraduationCap size={20} className="role-icon" />
                <span className="role-title">Instructor</span>
                <span className="role-desc">Publish materials, create quizzes, and view cohort analytics</span>
              </button>
            </div>
          </div>

          {/* Student Profile & Academic Background (When Student Role Selected) */}
          {formData.role === "student" && (
            <div style={{
              background: "var(--color-bg-secondary, #f8fafc)",
              border: "1px solid var(--color-border, #e2e8f0)",
              borderRadius: "10px",
              padding: "1rem",
              marginBottom: "1.25rem"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.85rem" }}>
                <GraduationCap size={18} style={{ color: "var(--color-primary, #4f46e5)" }} />
                <span style={{ fontWeight: 600, fontSize: "0.95rem", color: "var(--color-text, #1e293b)" }}>
                  Academic Profile & Learning Goals
                </span>
              </div>

              <div className="form-row">
                <div className="form-group col-half">
                  <label className="form-label" htmlFor="degree">Course / Degree Program *</label>
                  <select
                    id="degree"
                    name="degree"
                    className="form-input"
                    value={formData.degree}
                    onChange={handleChange}
                    required
                  >
                    <option value="MCA">MCA (Master of Computer Applications)</option>
                    <option value="MSc">MSc (Master of Science)</option>
                    <option value="MA">MA (Master of Arts)</option>
                    <option value="BTech">BTech / BE</option>
                    <option value="Other">Other Program</option>
                  </select>
                </div>

                <div className="form-group col-half">
                  <label className="form-label" htmlFor="student_id">Student ID / Roll No.</label>
                  <input
                    id="student_id"
                    name="student_id"
                    type="text"
                    className="form-input"
                    placeholder="e.g. MCA-2026-042 (Optional)"
                    value={formData.student_id}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group col-half">
                  <label className="form-label" htmlFor="skill_level">Current Skill Level</label>
                  <select
                    id="skill_level"
                    name="skill_level"
                    className="form-input"
                    value={formData.skill_level}
                    onChange={handleChange}
                  >
                    <option value="beginner">Beginner (Foundations & Syntax)</option>
                    <option value="intermediate">Intermediate (Problem Solving)</option>
                    <option value="advanced">Advanced (Deep Architecture & ML)</option>
                  </select>
                </div>

                <div className="form-group col-half">
                  <label className="form-label" htmlFor="preferred_language">Preferred Content Language</label>
                  <select
                    id="preferred_language"
                    name="preferred_language"
                    className="form-input"
                    value={formData.preferred_language}
                    onChange={handleChange}
                  >
                    <option value="English">English</option>
                    <option value="Hindi">Hindi / Hinglish</option>
                    <option value="Bilingual">Bilingual (English + Regional)</option>
                  </select>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: "0.75rem" }}>
                <label className="form-label" htmlFor="previous_education">Previous Education & Background</label>
                <input
                  id="previous_education"
                  name="previous_education"
                  type="text"
                  className="form-input"
                  placeholder="e.g. BCA from XYZ University / BSc Computer Science"
                  value={formData.previous_education}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="learning_goals">Primary Learning Goals</label>
                <input
                  id="learning_goals"
                  name="learning_goals"
                  type="text"
                  className="form-input"
                  placeholder="e.g. Master Machine Learning, Ace Semester Exams, Build Web Apps"
                  value={formData.learning_goals}
                  onChange={handleChange}
                />
              </div>
            </div>
          )}

          <div className="form-row">
            <div className="form-group col-half">
              <label className="form-label" htmlFor="password">Password</label>
              <div className="input-with-icon">
                <Lock size={18} className="input-icon" />
                <input
                  id="password"
                  name="password"
                  type="password"
                  className="form-input"
                  placeholder="Min 6 characters"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="form-group col-half">
              <label className="form-label" htmlFor="password_confirm">Confirm Password</label>
              <div className="input-with-icon">
                <Lock size={18} className="input-icon" />
                <input
                  id="password_confirm"
                  name="password_confirm"
                  type="password"
                  className="form-input"
                  placeholder="Repeat password"
                  value={formData.password_confirm}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={loading}
          >
            {loading ? (
              <span className="btn-loading">
                <span className="spinner-small"></span> Creating Account...
              </span>
            ) : (
              <span>Register & Get Started</span>
            )}
          </button>
        </form>

        <div className="auth-footer">
          <span>Already registered? </span>
          <Link to="/login" className="auth-link">
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  );
};
