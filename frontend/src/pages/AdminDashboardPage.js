import React, { useEffect, useState } from "react";
import { dashboardService } from "../api/dashboardService";
import { LoadingSpinner, AlertMessage } from "../components/UIFeedback";
import { Shield, Users, BookOpen, Layers, HelpCircle } from "lucide-react";
import { Link } from "react-router-dom";

export const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsData, usersData] = await Promise.all([
        dashboardService.getAdminStats(),
        dashboardService.getAdminUsers(),
      ]);
      setStats(statsData);
      setUsers(usersData);
    } catch (err) {
      console.error(err);
      setError("Failed to load admin controls.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await dashboardService.updateUserRole(userId, newRole);
      setSuccessMsg(`User role updated to ${newRole}.`);
      setUsers(
        users.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
    } catch (err) {
      console.error(err);
      setError("Failed to update user role.");
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading administration controls..." />;
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <div className="inline-badge mb-2">
            <Shield size={14} className="text-primary" />
            <span>Administrator Control Center</span>
          </div>
          <h1 className="page-title">Platform Administration</h1>
          <p className="page-subtitle">
            System health, user role assignments, and content inventory management.
          </p>
        </div>
        <Link to="/subjects" className="btn btn-outline">
          <Layers size={18} />
          <span>Curriculum Management</span>
        </Link>
      </div>

      <AlertMessage type="error" message={error} onClose={() => setError("")} />
      <AlertMessage type="success" message={successMsg} onClose={() => setSuccessMsg("")} />

      {/* System Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon-wrapper bg-blue-soft">
            <Users size={24} className="text-blue" />
          </div>
          <div className="stat-info">
            <span className="stat-label">Total Accounts</span>
            <h3 className="stat-value">{stats?.total_users || 0}</h3>
            <span className="stat-hint">
              {stats?.students || 0} Students &bull; {stats?.instructors || 0} Instructors
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper bg-purple-soft">
            <Layers size={24} className="text-purple" />
          </div>
          <div className="stat-info">
            <span className="stat-label">Curriculum Depth</span>
            <h3 className="stat-value">{stats?.subjects || 0} Subjects</h3>
            <span className="stat-hint">{stats?.topics || 0} Total Topics</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper bg-green-soft">
            <BookOpen size={24} className="text-green" />
          </div>
          <div className="stat-info">
            <span className="stat-label">Learning Modules</span>
            <h3 className="stat-value">{stats?.materials || 0}</h3>
            <span className="stat-hint">Published study materials</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper bg-amber-soft">
            <HelpCircle size={24} className="text-amber" />
          </div>
          <div className="stat-info">
            <span className="stat-label">Assessment Submissions</span>
            <h3 className="stat-value">{stats?.attempts || 0}</h3>
            <span className="stat-hint">Total quizzes evaluated</span>
          </div>
        </div>
      </div>

      {/* User Management Section */}
      <section className="dashboard-section">
        <div className="section-header">
          <h2 className="section-title">User Accounts & Role Permissions</h2>
        </div>

        <div className="activity-table-card">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Username</th>
                <th>Full Name</th>
                <th>Email</th>
                <th>Assigned Role</th>
                <th>Joined Date</th>
                <th>Change Role</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="fw-medium">{u.username}</td>
                  <td>
                    {u.first_name || u.last_name
                      ? `${u.first_name} ${u.last_name}`
                      : "—"}
                  </td>
                  <td className="text-muted">{u.email}</td>
                  <td>
                    <span className={`user-role-badge role-${u.role}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="text-muted">
                    {new Date(u.date_joined).toLocaleDateString()}
                  </td>
                  <td>
                    <select
                      className="form-select-sm"
                      value={u.role}
                      onChange={(e) => handleRoleChange(u.id, e.target.value)}
                    >
                      <option value="student">Student</option>
                      <option value="instructor">Instructor</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
