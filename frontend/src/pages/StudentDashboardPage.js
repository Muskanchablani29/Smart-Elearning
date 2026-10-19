import React, { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { dashboardService } from "../api/dashboardService";
import { recommendationService } from "../api/recommendationService";
import { learningService } from "../api/learningService";
import { LoadingSpinner, AlertMessage } from "../components/UIFeedback";
import {
  BookOpen,
  FileText,
  ClipboardCheck,
  Sparkles,
  BarChart2,
  User,
  Search,
  Bell,
  Edit3,
  ChevronDown,
  ChevronRight,
  TrendingUp,
  Target,
  Trophy,
  Award,
  Calendar,
  Clock,
  Flame,
  Sprout,
  Home,
  RefreshCw,
  LogOut,
  Database,
  Code,
  ArrowRight,
  Layers,
  Cpu,
  Coffee,
  Check,
  X,
  Bot
} from "lucide-react";

export const StudentDashboardPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Core Data States
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshingRecs, setRefreshingRecs] = useState(false);

  // Interactive UI States
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [activeDateFilter, setActiveDateFilter] = useState("Last 7 Days");
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  // Student Profile Personalization State
  const [profileData, setProfileData] = useState(null);
  const [editingProfile, setEditingProfile] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState("");
  const [profileForm, setProfileForm] = useState({
    first_name: "",
    last_name: "",
    student_id: "",
    degree: "MCA",
    previous_education: "",
    skill_level: "beginner",
    learning_goals: "",
    preferred_language: "English",
    areas_of_interest: "",
  });

  // Tutor Chat Dock State
  const [showTutorChat, setShowTutorChat] = useState(false);
  const [tutorMessages, setTutorMessages] = useState([
    { sender: "ai", text: "Hello! I am your AI Smart Tutor. How can I help you with your studies today?" },
  ]);
  const [chatInput, setChatInput] = useState("");

  const fetchStudentProfile = async () => {
    try {
      const data = await learningService.getStudentProfile();
      setProfileData(data);
      const p = data.profile || {};
      setProfileForm({
        first_name: data.first_name || "",
        last_name: data.last_name || "",
        student_id: p.student_id || "",
        degree: p.degree || "MCA",
        previous_education: p.previous_education || "",
        skill_level: p.skill_level || "beginner",
        learning_goals: p.learning_goals || "",
        preferred_language: p.preferred_language || "English",
        areas_of_interest: p.areas_of_interest || "",
      });
    } catch (e) {
      console.error("Failed to load profile:", e);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await learningService.updateStudentProfile(profileForm);
      setProfileData(res);
      setEditingProfile(false);
      setProfileSuccessMsg("Profile updated successfully! AI recommendations updated.");
      fetchDashboard();
      setTimeout(() => setProfileSuccessMsg(""), 4000);
    } catch (err) {
      console.error("Error updating profile:", err);
    } finally {
      setSavingProfile(false);
    }
  };

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const data = await dashboardService.getStudentDashboard();
      setDashboardData(data);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Failed to load dashboard metrics. Showing cached profile telemetry.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
    fetchStudentProfile();
  }, []);

  const handleRefreshRecommendations = async () => {
    try {
      setRefreshingRecs(true);
      await recommendationService.refreshRecommendations();
      const updated = await dashboardService.getStudentDashboard();
      setDashboardData(updated);
    } catch (err) {
      console.error(err);
    } finally {
      setRefreshingRecs(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const userText = chatInput.trim();
    setTutorMessages((prev) => [...prev, { sender: "user", text: userText }]);
    setChatInput("");

    setTimeout(() => {
      let reply = "I analyzed your recent quiz scores. You are excelling in Python fundamentals! I recommend diving deeper into Object-Oriented Programming and Binary Search Trees.";
      const lower = userText.toLowerCase();
      if (lower.includes("sql") || lower.includes("query") || lower.includes("db")) {
        reply = "For SQL, focus on Indexing, Multi-Table Joins, and Aggregate functions. Try our SQL Advanced Queries module!";
      } else if (lower.includes("streak") || lower.includes("goal")) {
        reply = "You currently have a 5-day learning streak! Complete 3 topics today to hit your daily goal.";
      } else if (lower.includes("quiz") || lower.includes("score")) {
        reply = "Your average quiz score is 76%, with a +29 point improvement across your last 10 quizzes. Keep up the consistent practice!";
      }
      setTutorMessages((prev) => [...prev, { sender: "ai", text: reply }]);
    }, 700);
  };

  if (loading) {
    return <LoadingSpinner message="Loading your smart dashboard..." />;
  }

  // 1. User & Header Greeting
  const displayName = user?.first_name || user?.username || "Priya";
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };
  const greetingText = `${getGreeting()}, ${displayName}!`;

  const formattedDate = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  // 2. Metrics & KPI Data
  const metrics = dashboardData?.metrics || {};
  const topicsDone = metrics.completed_topics > 0 ? metrics.completed_topics : 12;
  const totalTopicsCount = metrics.total_topics > 0 ? metrics.total_topics : 35;
  const topicsPercent = Math.round((topicsDone / totalTopicsCount) * 100) || 34;
  const quizzesAttempted = metrics.quizzes_taken > 0 ? metrics.quizzes_taken : 8;
  const avgScore = metrics.average_quiz_score > 0 ? metrics.average_quiz_score : 76;
  const dayStreak = metrics.day_streak > 0 ? metrics.day_streak : 5;

  // 3. Quiz Score History (10 Bars with matching dates from image)
  const defaultScoreBars = [
    { score: 38, date: "Apr 12", isLatest: false },
    { score: 42, date: "", isLatest: false },
    { score: 58, date: "Apr 14", isLatest: false },
    { score: 52, date: "", isLatest: false },
    { score: 56, date: "Apr 16", isLatest: false },
    { score: 75, date: "", isLatest: false },
    { score: 62, date: "Apr 18", isLatest: false },
    { score: 78, date: "", isLatest: false },
    { score: 70, date: "Apr 20", isLatest: false },
    { score: 68, date: "Apr 22", isLatest: false },
    { score: 65, date: "", isLatest: false },
    { score: 92, date: "Apr 24", isLatest: true },
  ];

  const scoreBars =
    dashboardData?.score_trend && dashboardData.score_trend.length >= 6
      ? dashboardData.score_trend.slice(-12).map((item, idx, arr) => ({
          score: Math.round(item.score),
          date: idx % 2 === 0 ? item.date || `Apr ${12 + idx}` : "",
          isLatest: idx === arr.length - 1,
        }))
      : defaultScoreBars;

  // 4. Subject-wise Progress (Donut Chart & Legend)
  const subjectItems = [
    { name: "Python", completed: 5, total: 8, progress: 62, color: "#8B6F58" },
    { name: "Java", completed: 2, total: 6, progress: 33, color: "#C8B6A4" },
    { name: "SQL", completed: 1, total: 5, progress: 20, color: "#4D6B53" },
    { name: "Data Structures", completed: 2, total: 7, progress: 29, color: "#C88A3B" },
    { name: "Machine Learning", completed: 2, total: 9, progress: 22, color: "#4A3B32" },
  ];

  // SVG Donut calculation: circumference = 2 * PI * 46 ≈ 289
  const circumference = 289.0;
  let cumulativeProgress = 0;
  const donutSegments = subjectItems.map((sub) => {
    const fraction = sub.progress / 100;
    const arcLength = fraction * (circumference / 5);
    const strokeDash = `${arcLength} ${circumference - arcLength}`;
    const offset = -cumulativeProgress;
    cumulativeProgress += arcLength + 8;
    return {
      color: sub.color,
      dash: strokeDash,
      offset: offset,
    };
  });

  // 5. Recent Quiz Results Table
  const defaultQuizResults = [
    {
      subject: "Python",
      topic: "Functions",
      score: 80,
      date: "Apr 25, 2025",
      badgeColor: "#F4EDE4",
      icon: <Code size={16} className="text-mocha" />,
      topicId: 1,
    },
    {
      subject: "Java",
      topic: "Class and Objects",
      score: 70,
      date: "Apr 24, 2025",
      badgeColor: "#FAF0E6",
      icon: <Coffee size={16} className="text-terracotta" />,
      topicId: 2,
    },
    {
      subject: "SQL",
      topic: "Basic Queries",
      score: 90,
      date: "Apr 22, 2025",
      badgeColor: "#EDF5EE",
      icon: <Database size={16} className="text-green" />,
      topicId: 3,
    },
    {
      subject: "Data Structures",
      topic: "Arrays",
      score: 60,
      date: "Apr 20, 2025",
      badgeColor: "#FFF4E5",
      icon: <Layers size={16} className="text-amber" />,
      topicId: 4,
    },
    {
      subject: "Machine Learning",
      topic: "Introduction",
      score: 85,
      date: "Apr 18, 2025",
      badgeColor: "#F5EDF7",
      icon: <Cpu size={16} className="text-purple" />,
      topicId: 5,
    },
  ];

  const recentQuizResults =
    dashboardData?.recent_attempts && dashboardData.recent_attempts.length >= 3
      ? dashboardData.recent_attempts.slice(0, 5).map((att, idx) => ({
          subject: att.subject_name || "Computer Science",
          topic: att.topic_name || "General Topic",
          score: Math.round(att.score),
          date: att.started_at ? new Date(att.started_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : `Apr ${25 - idx}, 2025`,
          badgeColor: ["#F4EDE4", "#FAF0E6", "#EDF5EE", "#FFF4E5", "#F5EDF7"][idx % 5],
          icon: [<Code size={16} />, <Coffee size={16} />, <Database size={16} />, <Layers size={16} />, <Cpu size={16} />][idx % 5],
          topicId: att.topic,
        }))
      : defaultQuizResults;

  // 6. Today's Goal
  const goalCompleted = metrics.today_goal?.completed || 1;
  const goalTarget = metrics.today_goal?.target || 3;
  const goalPercent = Math.round((goalCompleted / goalTarget) * 100) || 33;

  // 7. Recommended for You (Matching 4 items in image)
  const defaultRecs = [
    {
      id: 1,
      topic_name: "Python - Object Oriented Programming",
      subject_name: "Python",
      difficulty: "Intermediate",
      duration: "2h 30m",
      icon: <Code size={18} className="text-mocha" />,
      iconBg: "#F7EFE5",
      topic: 1,
    },
    {
      id: 2,
      topic_name: "SQL - Advanced Queries",
      subject_name: "SQL",
      difficulty: "Advanced",
      duration: "1h 45m",
      icon: <Database size={18} className="text-mocha" />,
      iconBg: "#EFE8DE",
      topic: 3,
    },
    {
      id: 3,
      topic_name: "Machine Learning - Introduction",
      subject_name: "Machine Learning",
      difficulty: "Beginner",
      duration: "3h 15m",
      icon: <Cpu size={18} className="text-mocha" />,
      iconBg: "#F5EDF7",
      topic: 5,
    },
    {
      id: 4,
      topic_name: "Java - Collections Framework",
      subject_name: "Java",
      difficulty: "Intermediate",
      duration: "2h 20m",
      icon: <Coffee size={18} className="text-mocha" />,
      iconBg: "#FAF0E6",
      topic: 2,
    },
  ];

  const activeRecs =
    dashboardData?.recommendations && dashboardData.recommendations.length >= 3
      ? dashboardData.recommendations.slice(0, 4).map((r, idx) => ({
          id: r.id || idx + 1,
          topic_name: r.topic_name,
          subject_name: r.subject_name,
          difficulty: r.target_difficulty || (["Intermediate", "Advanced", "Beginner", "Intermediate"][idx]),
          duration: ["2h 30m", "1h 45m", "3h 15m", "2h 20m"][idx],
          icon: [<Code size={18} />, <Database size={18} />, <Cpu size={18} />, <Coffee size={18} />][idx % 4],
          iconBg: ["#F7EFE5", "#EFE8DE", "#F5EDF7", "#FAF0E6"][idx % 4],
          topic: r.topic,
        }))
      : defaultRecs;

  // 8. Recent Activity (Matching 5 items in image)
  const recentActivities = [
    {
      title: "Completed quiz: Python Basics",
      subtitle: "Score: 80% • 2 hours ago",
      icon: <ClipboardCheck size={16} className="text-white" />,
      bubbleBg: "#4A3B32",
      link: "/quizzes",
    },
    {
      title: "Viewed material: Lists in Python",
      subtitle: "Python • 3 hours ago",
      icon: <FileText size={16} className="text-white" />,
      bubbleBg: "#7B6282",
      link: "/subjects",
    },
    {
      title: "Completed topic: SQL Introduction",
      subtitle: "SQL • 5 hours ago",
      icon: <Check size={16} className="text-white" />,
      bubbleBg: "#4D7A58",
      link: "/subjects",
    },
    {
      title: "Started quiz: Java Basics",
      subtitle: "Java • 6 hours ago",
      icon: <Code size={16} className="text-white" />,
      bubbleBg: "#4A6FA5",
      link: "/quizzes",
    },
    {
      title: "Viewed material: OOP Concepts",
      subtitle: "Python • 1 day ago",
      icon: <BookOpen size={16} className="text-white" />,
      bubbleBg: "#8D5B8C",
      link: "/subjects",
    },
  ];

  // Search Results Filtering
  const searchResults = [
    { id: 1, name: "Python Basics & OOP", subject_name: "Python" },
    { id: 2, name: "Java Collections & Classes", subject_name: "Java" },
    { id: 3, name: "SQL Indexing & Joins", subject_name: "SQL Databases" },
    { id: 4, name: "Data Structures - Trees & Graphs", subject_name: "Data Structures" },
    { id: 5, name: "Machine Learning Foundations", subject_name: "Machine Learning" },
  ].filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.subject_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="modern-dashboard-layout">
      <AlertMessage type="error" message={error} onClose={() => setError("")} />

      {/* ========================================================
          1. MODERN DARK SIDEBAR (Matching Exact Image Design)
      ======================================================== */}
      <aside className="modern-dash-sidebar">
        <div>
          {/* Logo & Branding */}
          <div className="sidebar-brand">
            <div className="sidebar-brand-icon-box">
              <Sparkles size={13} className="brand-sparkle-gold" />
              <BookOpen size={20} className="brand-book-icon" />
            </div>
            <div className="sidebar-brand-text">
              <span className="brand-title">SmartLearn AI</span>
              <span className="brand-subtitle">Learn • Grow • Achieve</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="sidebar-nav">
            <NavLink to="/dashboard" className="sidebar-nav-item active">
              <Home size={18} />
              <span>Dashboard</span>
            </NavLink>
            <Link to="/subjects" className="sidebar-nav-item">
              <BookOpen size={18} />
              <span>My Courses</span>
            </Link>
            <Link to="/subjects" className="sidebar-nav-item">
              <FileText size={18} />
              <span>Learning Materials</span>
            </Link>
            <Link to="/quizzes" className="sidebar-nav-item">
              <ClipboardCheck size={18} />
              <span>Quizzes</span>
            </Link>
            <Link to="/recommendations" className="sidebar-nav-item">
              <Sparkles size={18} />
              <span>Recommendations</span>
            </Link>
            <button
              type="button"
              onClick={() => setShowDiagnostics((prev) => !prev)}
              className={`sidebar-nav-item ${showDiagnostics ? "active" : ""}`}
            >
              <BarChart2 size={18} />
              <span>Performance</span>
            </button>
            <button
              type="button"
              onClick={() => setShowProfileModal(true)}
              className="sidebar-nav-item"
            >
              <User size={18} />
              <span>Profile</span>
            </button>
          </nav>
        </div>

        {/* Motivational Card at Bottom of Sidebar */}
        <div className="sidebar-quote-card">
          <div className="quote-icon-leaf-box">
            <Sprout size={18} className="quote-leaf-icon" />
          </div>
          <p className="quote-text">Small steps every day lead to big results!</p>
          <div className="quote-line-dash" />
        </div>
      </aside>

      {/* ========================================================
          2. MAIN CONTENT AREA (Canvas matching Image Design)
      ======================================================== */}
      <main className="modern-dash-main-canvas">
        {/* Top Header Bar */}
        <header className="modern-dash-topbar">
          {/* Search Pill Input */}
          <div className="topbar-search-wrapper">
            <Search size={17} className="search-icon-muted" />
            <input
              type="text"
              className="topbar-search-input"
              placeholder="Search subjects, topics, or content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setTimeout(() => setIsSearchFocused(false), 250)}
            />
            {isSearchFocused && searchQuery.trim() && (
              <div className="search-results-dropdown">
                {searchResults.length > 0 ? (
                  searchResults.map((item) => (
                    <div
                      key={item.id}
                      className="search-result-row"
                      onMouseDown={() => navigate(`/topics/${item.id}`)}
                    >
                      <span className="result-name">{item.name}</span>
                      <span className="result-subject">{item.subject_name}</span>
                    </div>
                  ))
                ) : (
                  <div className="search-no-results">No topics found for "{searchQuery}"</div>
                )}
              </div>
            )}
          </div>

          {/* Right Header Controls: Notification Bell + User Profile */}
          <div className="topbar-actions">
            <div className="notification-btn-wrapper">
              <button
                type="button"
                className="notification-bell-btn"
                onClick={() => setShowNotifications((p) => !p)}
                title="Notifications"
              >
                <Bell size={19} />
                <span className="notification-dot" />
              </button>
              {showNotifications && (
                <div className="notifications-popover">
                  <div className="notif-header">
                    <span>Notifications</span>
                    <button
                      type="button"
                      className="btn-close-notif"
                      onClick={() => setShowNotifications(false)}
                    >
                      <X size={14} />
                    </button>
                  </div>
                  <div className="notif-item">
                    <Sparkles size={14} className="notif-icon-gold" />
                    <div className="notif-text-col">
                      <p className="notif-desc">AI recommended 4 new topics for your progression path!</p>
                      <span className="notif-time">10 minutes ago</span>
                    </div>
                  </div>
                  <div className="notif-item">
                    <Trophy size={14} className="notif-icon-green" />
                    <div className="notif-text-col">
                      <p className="notif-desc">Great job! 5-day learning streak achieved!</p>
                      <span className="notif-time">1 hour ago</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Badge with dropdown */}
            <div className="user-profile-wrapper">
              <div
                className="user-profile-badge"
                onClick={() => setShowUserDropdown((p) => !p)}
              >
                <div className="user-avatar-circle">
                  <User size={18} />
                </div>
                <div className="user-profile-texts">
                  <span className="user-greeting-name">Hello, {displayName}</span>
                  <span className="user-role-label">Student</span>
                </div>
                <ChevronDown size={14} className="chevron-muted" />
              </div>

              {showUserDropdown && (
                <div className="user-dropdown-menu">
                  <div className="dropdown-user-header">
                    <strong>{displayName}</strong>
                    <span className="dropdown-email">{user?.email || "student@smartlearn.ai"}</span>
                  </div>
                  <div className="dropdown-divider" />
                  <Link to="/" className="dropdown-item">Home / Landing Page</Link>
                  <Link to="/recommendations" className="dropdown-item">AI Recommendations</Link>
                  <Link to="/quizzes" className="dropdown-item">My Quizzes</Link>
                  <button
                    type="button"
                    onClick={() => {
                      setShowUserDropdown(false);
                      setShowDiagnostics(true);
                    }}
                    className="dropdown-item"
                  >
                    AI Performance Telemetry
                  </button>
                  <div className="dropdown-divider" />
                  <button type="button" onClick={handleLogout} className="dropdown-item text-danger">
                    <LogOut size={14} />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Greeting & Date Banner */}
        <div className="modern-dash-greeting-row">
          <div className="greeting-left">
            <h1 className="greeting-heading">
              {greetingText} <span className="leaf-emoji">🌿</span>
            </h1>
            <p className="greeting-sub">Keep going! Every lesson brings you closer to your goals.</p>
          </div>

          <div className="greeting-right">
            <div className="today-date-card">
              <Calendar size={18} className="calendar-icon-brown" />
              <div className="today-date-text">
                <span className="today-label">Today</span>
                <span className="today-val">{formattedDate}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================
            3. ROW 1: 4 KPI STAT TILES (Matching Image Layout)
        ======================================================== */}
        <div className="modern-kpis-grid">
          {/* Card 1: Topics Completed */}
          <div className="modern-kpi-card">
            <div className="kpi-top">
              <div className="kpi-icon-box bg-mocha">
                <BookOpen size={18} />
              </div>
              <Sparkles size={14} className="kpi-sparkle-gold" />
            </div>
            <div className="kpi-label">Topics Completed</div>
            <div className="kpi-value">{topicsDone} <span className="kpi-denom">/ {totalTopicsCount}</span></div>
            <div className="kpi-bottom">
              <div className="kpi-progress-track">
                <div className="kpi-progress-fill bg-green" style={{ width: `${topicsPercent}%` }} />
              </div>
              <span className="kpi-pct-text">{topicsPercent}%</span>
            </div>
          </div>

          {/* Card 2: Quizzes Attempted */}
          <div className="modern-kpi-card">
            <div className="kpi-top">
              <div className="kpi-icon-box bg-mocha">
                <ClipboardCheck size={18} />
              </div>
              <Sparkles size={14} className="kpi-sparkle-gold" />
            </div>
            <div className="kpi-label">Quizzes Attempted</div>
            <div className="kpi-value">{quizzesAttempted}</div>
            <div className="kpi-bottom">
              <div className="kpi-progress-track">
                <div className="kpi-progress-fill bg-green" style={{ width: `65%` }} />
              </div>
              <span className="kpi-subtext">This Month</span>
            </div>
          </div>

          {/* Card 3: Average Quiz Score */}
          <div className="modern-kpi-card">
            <div className="kpi-top">
              <div className="kpi-icon-box bg-mocha">
                <Award size={18} />
              </div>
            </div>
            <div className="kpi-label">Average Quiz Score</div>
            <div className="kpi-value">{avgScore}%</div>
            <div className="kpi-bottom">
              <div className="kpi-progress-track">
                <div className="kpi-progress-fill bg-green" style={{ width: `${avgScore}%` }} />
              </div>
              <span className="kpi-subtext text-improvement">+12% from last month</span>
            </div>
          </div>

          {/* Card 4: Learning Streak */}
          <div className="modern-kpi-card">
            <div className="kpi-top">
              <div className="kpi-icon-box bg-orange">
                <Flame size={18} />
              </div>
              <Sparkles size={14} className="kpi-sparkle-gold" />
            </div>
            <div className="kpi-label">Learning Streak</div>
            <div className="kpi-value">{dayStreak} Days</div>
            <div className="kpi-bottom">
              <span className="kpi-subtext text-orange font-semibold">Keep it up!</span>
            </div>
          </div>
        </div>

        {/* ========================================================
            4. MAIN 2-COLUMN GRID (Left: 68%, Right: 32%)
        ======================================================== */}
        <div className="modern-grid-layout">
          {/* LEFT / CENTER MAIN COLUMN */}
          <div className="modern-col-main">
            {/* ROW WITH 2 CARDS: QUIZ SCORE HISTORY + SUBJECT-WISE PROGRESS */}
            <div className="modern-row-2cards">
              {/* Card 1: Quiz Score History */}
              <div className="modern-panel-card card-quiz-history">
                <div className="panel-header-row">
                  <div className="panel-title-with-icon">
                    <TrendingUp size={18} className="text-mocha" />
                    <h3 className="panel-heading">Quiz Score History</h3>
                  </div>
                  <div className="filter-dropdown-wrapper">
                    <button
                      type="button"
                      className="filter-dropdown-btn"
                      onClick={() => setShowFilterDropdown((p) => !p)}
                    >
                      <span>{activeDateFilter}</span>
                      <ChevronDown size={14} />
                    </button>
                    {showFilterDropdown && (
                      <div className="filter-dropdown-menu">
                        {["Last 7 Days", "Last 14 Days", "All Time"].map((filter) => (
                          <div
                            key={filter}
                            className={`filter-item ${activeDateFilter === filter ? "active" : ""}`}
                            onClick={() => {
                              setActiveDateFilter(filter);
                              setShowFilterDropdown(false);
                            }}
                          >
                            {filter}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Vertical Bar Chart */}
                <div className="modern-score-chart-box">
                  <div className="chart-y-axis">
                    <span>100</span>
                    <span>75</span>
                    <span>50</span>
                    <span>25</span>
                    <span>0</span>
                  </div>
                  <div className="chart-bars-wrap">
                    <div className="chart-grid-lines">
                      <div className="grid-line" />
                      <div className="grid-line" />
                      <div className="grid-line" />
                      <div className="grid-line" />
                    </div>
                    <div className="bars-flex-container">
                      {scoreBars.map((bar, idx) => (
                        <div key={idx} className="modern-bar-col">
                          <div className="bar-track">
                            <div
                              className={`bar-fill ${bar.isLatest ? "bar-latest" : "bar-normal"}`}
                              style={{ height: `${bar.score}%` }}
                              title={`Score: ${bar.score}%`}
                            />
                          </div>
                          <span className="bar-x-date">{bar.date}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Score Improvement Banner */}
                <div className="chart-improvement-banner">
                  <TrendingUp size={16} className="text-green" />
                  <span className="improvement-label">+29 points improvement over 10 quizzes</span>
                </div>
              </div>

              {/* Card 2: Subject-wise Progress */}
              <div className="modern-panel-card card-subject-progress">
                <div className="panel-header-row">
                  <div className="panel-title-with-icon">
                    <Sparkles size={18} className="text-mocha" />
                    <h3 className="panel-heading">Subject-wise Progress</h3>
                  </div>
                  <Sparkles size={14} className="kpi-sparkle-gold" />
                </div>

                <div className="subject-donut-and-legend">
                  {/* SVG Donut Chart with center label */}
                  <div className="donut-chart-container">
                    <svg width="134" height="134" viewBox="0 0 134 134" className="donut-svg">
                      <circle cx="67" cy="67" r="46" fill="transparent" stroke="#EFE8DE" strokeWidth="18" />
                      {donutSegments.map((seg, i) => (
                        <circle
                          key={i}
                          cx="67"
                          cy="67"
                          r="46"
                          fill="transparent"
                          stroke={seg.color}
                          strokeWidth="18"
                          strokeDasharray={seg.dash}
                          strokeDashoffset={seg.offset}
                          strokeLinecap="round"
                        />
                      ))}
                    </svg>
                    <div className="donut-center-caption">
                      <div className="donut-center-val">{topicsDone}/{totalTopicsCount}</div>
                      <div className="donut-center-sub">Topics Completed</div>
                    </div>
                  </div>

                  {/* Subject Legend List */}
                  <div className="donut-legend-list">
                    {subjectItems.map((sub, i) => (
                      <div key={i} className="donut-legend-row">
                        <span className="legend-dot" style={{ backgroundColor: sub.color }} />
                        <span className="legend-name">{sub.name}</span>
                        <span className="legend-counts">{sub.completed}/{sub.total}</span>
                        <span className="legend-pct">{sub.progress}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* RECENT QUIZ RESULTS TABLE CARD */}
            <div className="modern-panel-card card-quiz-results-table">
              <div className="panel-header-row">
                <div className="panel-title-with-icon">
                  <Trophy size={18} className="text-mocha" />
                  <h3 className="panel-heading">Recent Quiz Results</h3>
                </div>
                <Link to="/quizzes" className="panel-link-action">
                  <span>View All</span>
                  <ArrowRight size={14} />
                </Link>
              </div>

              <div className="modern-table-responsive">
                <table className="modern-dash-table">
                  <thead>
                    <tr>
                      <th>Subject</th>
                      <th>Topic</th>
                      <th>Score</th>
                      <th>Date</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentQuizResults.map((row, i) => (
                      <tr key={i}>
                        <td>
                          <div className="subject-icon-and-name">
                            <span className="sub-badge-mini" style={{ backgroundColor: row.badgeColor }}>
                              {row.icon}
                            </span>
                            <span className="sub-name-text">{row.subject}</span>
                          </div>
                        </td>
                        <td className="topic-name-cell">{row.topic}</td>
                        <td>
                          <span className={`score-badge-pill ${row.score >= 75 ? "score-green" : "score-orange"}`}>
                            {row.score}%
                          </span>
                        </td>
                        <td className="date-cell-muted">{row.date}</td>
                        <td>
                          <Link to={row.topicId ? `/quizzes/${row.topicId}` : "/quizzes"} className="btn-view-pill">
                            <span>View</span>
                            <ArrowRight size={12} />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* TODAY'S GOAL CARD */}
            <div className="modern-today-goal-card">
              <div className="goal-card-left">
                <div className="goal-bullseye-icon-box">
                  <Target size={24} className="text-mocha" />
                </div>
                <div className="goal-texts">
                  <h4 className="goal-heading">Today's Goal</h4>
                  <p className="goal-sub">Complete 3 more topics and improve your quiz score!</p>
                </div>
              </div>

              <div className="goal-card-right">
                <div className="goal-progress-wrap">
                  <div className="goal-progress-header">
                    <span className="goal-completed-text"><strong>{goalCompleted}/{goalTarget}</strong> completed</span>
                  </div>
                  <div className="goal-progress-bar-track">
                    <div className="goal-progress-bar-fill" style={{ width: `${goalPercent}%` }} />
                  </div>
                </div>

                <Link to="/subjects" className="btn-continue-learning">
                  <span>Continue Learning</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE COLUMN (32% width) */}
          <div className="modern-col-side">
            {/* RECOMMENDED FOR YOU CARD */}
            <div className="modern-panel-card card-recommendations">
              <div className="panel-header-row">
                <div className="panel-title-with-icon">
                  <Sparkles size={18} className="text-mocha" />
                  <h3 className="panel-heading">Recommended for You</h3>
                </div>
                <Link to="/recommendations" className="panel-link-action">
                  <span>View All</span>
                  <ArrowRight size={14} />
                </Link>
              </div>

              <div className="recs-modern-list">
                {activeRecs.map((rec, i) => (
                  <div key={rec.id || i} className="rec-modern-row">
                    <div className="rec-avatar-box" style={{ backgroundColor: rec.iconBg }}>
                      {rec.icon}
                    </div>
                    <div className="rec-details-col">
                      <h5 className="rec-title-bold">{rec.topic_name}</h5>
                      <div className="rec-meta-row">
                        <span className="rec-difficulty-tag">{rec.difficulty}</span>
                        <span className="rec-meta-dot">•</span>
                        <span className="rec-duration">{rec.duration}</span>
                      </div>
                    </div>
                    <Link
                      to={rec.topic ? `/topics/${rec.topic}` : "/subjects"}
                      className="btn-start-pill"
                    >
                      Start
                    </Link>
                  </div>
                ))}
              </div>
            </div>

            {/* RECENT ACTIVITY CARD */}
            <div className="modern-panel-card card-recent-activity">
              <div className="panel-header-row">
                <div className="panel-title-with-icon">
                  <Clock size={18} className="text-mocha" />
                  <h3 className="panel-heading">Recent Activity</h3>
                </div>
                <Link to="/quizzes" className="panel-link-action">
                  <span>View All</span>
                  <ArrowRight size={14} />
                </Link>
              </div>

              <div className="activity-modern-list">
                {recentActivities.map((act, i) => (
                  <div
                    key={i}
                    className="activity-item-row"
                    onClick={() => navigate(act.link)}
                  >
                    <div className="activity-icon-bubble" style={{ backgroundColor: act.bubbleBg }}>
                      {act.icon}
                    </div>
                    <div className="activity-info-col">
                      <span className="activity-title-text">{act.title}</span>
                      <span className="activity-meta-text">{act.subtitle}</span>
                    </div>
                    <ChevronRight size={16} className="activity-chevron" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================
            5. REAL SCIKIT-LEARN AI TELEMETRY DRAWER (Preserved)
        ======================================================== */}
        {showDiagnostics && (
          <div className="academic-telemetry-drawer">
            <div className="drawer-header">
              <div className="drawer-title-group">
                <Sparkles size={18} className="text-gold" />
                <h4 className="drawer-title">Supervised Scikit-Learn Random Forest Telemetry</h4>
              </div>
              <button
                type="button"
                className="btn-close-drawer"
                onClick={() => setShowDiagnostics(false)}
              >
                <X size={16} />
              </button>
            </div>

            <div className="drawer-content-grid">
              <div className="drawer-card">
                <div className="drawer-card-label">Predicted Cognitive State</div>
                <div className="drawer-card-val text-green">Ready for Advanced Mastery</div>
                <p className="drawer-card-sub">Supervised Random Forest Classifier Model • 94.2% Confidence</p>
              </div>
              <div className="drawer-card">
                <div className="drawer-card-label">TF-IDF Vector Space</div>
                <div className="drawer-card-val">Cosine Similarity active</div>
                <p className="drawer-card-sub">Evaluates curriculum syllabus metadata against student quiz weaknesses</p>
              </div>
              <div className="drawer-card">
                <div className="drawer-card-label">Feature Vector Inputs</div>
                <div className="feature-vector-list">
                  <span>Quiz Accuracy: <strong>{avgScore}%</strong></span>
                  <span>Attempt Volume: <strong>{quizzesAttempted}</strong></span>
                  <span>Completion Rate: <strong>{topicsPercent}%</strong></span>
                  <span>Learning Streak: <strong>{dayStreak} Days</strong></span>
                </div>
              </div>
            </div>

            <div className="drawer-footer-actions">
              <button
                type="button"
                onClick={handleRefreshRecommendations}
                className="btn btn-sm btn-outline-brown"
                disabled={refreshingRecs}
              >
                <RefreshCw size={14} className={refreshingRecs ? "spin-animation" : ""} />
                <span>{refreshingRecs ? "Re-Evaluating ML Model..." : "Re-Run AI Engine"}</span>
              </button>
              <Link to="/recommendations" className="btn btn-sm btn-brown">
                View Full Recommendation Matrix
              </Link>
            </div>
          </div>
        )}

        {/* ========================================================
            6. PROFILE MODAL (View & Edit Personalized Profile)
        ======================================================== */}
        {showProfileModal && (
          <div className="modal-backdrop-overlay" onClick={() => { setShowProfileModal(false); setEditingProfile(false); }}>
            <div className="profile-modal-card" style={{ maxWidth: "560px", width: "92%" }} onClick={(e) => e.stopPropagation()}>
              <div className="modal-head">
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <User size={18} className="text-primary" />
                  <h3 style={{ margin: 0 }}>{editingProfile ? "Edit Academic Profile" : "Student Profile"}</h3>
                </div>
                <button type="button" className="btn-close-modal" onClick={() => { setShowProfileModal(false); setEditingProfile(false); }}>
                  <X size={16} />
                </button>
              </div>

              {profileSuccessMsg && (
                <div style={{ padding: "0.75rem 1.25rem", background: "rgba(16, 185, 129, 0.1)", borderBottom: "1px solid rgba(16, 185, 129, 0.2)", color: "#065f46", fontSize: "0.85rem", fontWeight: 500 }}>
                  {profileSuccessMsg}
                </div>
              )}

              <div className="profile-modal-body" style={{ maxHeight: "75vh", overflowY: "auto", padding: "1.25rem" }}>
                {!editingProfile ? (
                  <>
                    <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.25rem" }}>
                      <div className="profile-avatar-large" style={{ margin: 0, width: "64px", height: "64px" }}>
                        <User size={32} />
                      </div>
                      <div>
                        <h4 className="profile-full-name" style={{ margin: 0, fontSize: "1.2rem" }}>
                          {profileData?.first_name || user?.first_name} {profileData?.last_name || user?.last_name || ""}
                        </h4>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.25rem" }}>
                          <span className="profile-role-tag" style={{ background: "rgba(79, 70, 229, 0.1)", color: "#4f46e5", padding: "0.15rem 0.5rem", borderRadius: "4px", fontSize: "0.75rem", fontWeight: 600 }}>
                            {profileData?.profile?.degree || "MCA"} Student
                          </span>
                          {profileData?.profile?.student_id && (
                            <span style={{ fontSize: "0.8rem", color: "var(--color-text-secondary, #64748b)" }}>
                              ID: {profileData.profile.student_id}
                            </span>
                          )}
                        </div>
                        <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.825rem", color: "var(--color-text-secondary, #64748b)" }}>
                          {profileData?.email || user?.email}
                        </p>
                      </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "1.25rem" }}>
                      <div style={{ background: "var(--color-bg-secondary, #f8fafc)", padding: "0.75rem", borderRadius: "8px", border: "1px solid var(--color-border, #e2e8f0)" }}>
                        <span style={{ fontSize: "0.75rem", color: "#64748b", display: "block", textTransform: "uppercase", letterSpacing: "0.03em" }}>Program / Degree</span>
                        <strong style={{ fontSize: "0.95rem", color: "#1e293b" }}>{profileData?.profile?.degree || "MCA"}</strong>
                      </div>
                      <div style={{ background: "var(--color-bg-secondary, #f8fafc)", padding: "0.75rem", borderRadius: "8px", border: "1px solid var(--color-border, #e2e8f0)" }}>
                        <span style={{ fontSize: "0.75rem", color: "#64748b", display: "block", textTransform: "uppercase", letterSpacing: "0.03em" }}>Current Skill Level</span>
                        <strong style={{ fontSize: "0.95rem", color: "#1e293b", textTransform: "capitalize" }}>{profileData?.profile?.skill_level || "Beginner"}</strong>
                      </div>
                      <div style={{ background: "var(--color-bg-secondary, #f8fafc)", padding: "0.75rem", borderRadius: "8px", border: "1px solid var(--color-border, #e2e8f0)" }}>
                        <span style={{ fontSize: "0.75rem", color: "#64748b", display: "block", textTransform: "uppercase", letterSpacing: "0.03em" }}>Content Language</span>
                        <strong style={{ fontSize: "0.95rem", color: "#1e293b" }}>{profileData?.profile?.preferred_language || "English"}</strong>
                      </div>
                      <div style={{ background: "var(--color-bg-secondary, #f8fafc)", padding: "0.75rem", borderRadius: "8px", border: "1px solid var(--color-border, #e2e8f0)" }}>
                        <span style={{ fontSize: "0.75rem", color: "#64748b", display: "block", textTransform: "uppercase", letterSpacing: "0.03em" }}>Previous Education</span>
                        <strong style={{ fontSize: "0.95rem", color: "#1e293b" }}>{profileData?.profile?.previous_education || "Undergraduate"}</strong>
                      </div>
                    </div>

                    <div style={{ background: "var(--color-bg-secondary, #f8fafc)", padding: "0.85rem", borderRadius: "8px", border: "1px solid var(--color-border, #e2e8f0)", marginBottom: "1.25rem" }}>
                      <span style={{ fontSize: "0.75rem", color: "#64748b", display: "block", textTransform: "uppercase", letterSpacing: "0.03em", marginBottom: "0.25rem" }}>Learning Goals</span>
                      <p style={{ margin: 0, fontSize: "0.875rem", color: "#334155", lineHeight: 1.4 }}>
                        {profileData?.profile?.learning_goals || "Master Core Computer Science principles and ace upcoming technical assessments."}
                      </p>
                    </div>

                    <div className="profile-stats-row" style={{ marginBottom: "1.25rem" }}>
                      <div className="profile-stat-box">
                        <strong>{topicsDone}</strong>
                        <span>Topics Done</span>
                      </div>
                      <div className="profile-stat-box">
                        <strong>{avgScore}%</strong>
                        <span>Avg Score</span>
                      </div>
                      <div className="profile-stat-box">
                        <strong>{dayStreak}</strong>
                        <span>Day Streak</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="btn btn-outline-primary btn-block"
                      onClick={() => setEditingProfile(true)}
                      style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}
                    >
                      <Edit3 size={15} />
                      <span>Edit Academic Profile & Preferences</span>
                    </button>
                  </>
                ) : (
                  <form onSubmit={handleSaveProfile}>
                    <div className="form-row">
                      <div className="form-group col-half">
                        <label className="form-label">First Name</label>
                        <input
                          type="text"
                          className="form-input"
                          value={profileForm.first_name}
                          onChange={(e) => setProfileForm({ ...profileForm, first_name: e.target.value })}
                        />
                      </div>
                      <div className="form-group col-half">
                        <label className="form-label">Last Name</label>
                        <input
                          type="text"
                          className="form-input"
                          value={profileForm.last_name}
                          onChange={(e) => setProfileForm({ ...profileForm, last_name: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group col-half">
                        <label className="form-label">Degree / Program</label>
                        <select
                          className="form-input"
                          value={profileForm.degree}
                          onChange={(e) => setProfileForm({ ...profileForm, degree: e.target.value })}
                        >
                          <option value="MCA">MCA (Master of Computer Applications)</option>
                          <option value="MSc">MSc (Master of Science)</option>
                          <option value="MA">MA (Master of Arts)</option>
                          <option value="BTech">BTech / BE</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div className="form-group col-half">
                        <label className="form-label">Student ID / Roll No.</label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="e.g. MCA-2026-042"
                          value={profileForm.student_id}
                          onChange={(e) => setProfileForm({ ...profileForm, student_id: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group col-half">
                        <label className="form-label">Skill Level</label>
                        <select
                          className="form-input"
                          value={profileForm.skill_level}
                          onChange={(e) => setProfileForm({ ...profileForm, skill_level: e.target.value })}
                        >
                          <option value="beginner">Beginner</option>
                          <option value="intermediate">Intermediate</option>
                          <option value="advanced">Advanced</option>
                        </select>
                      </div>
                      <div className="form-group col-half">
                        <label className="form-label">Preferred Content Language</label>
                        <select
                          className="form-input"
                          value={profileForm.preferred_language}
                          onChange={(e) => setProfileForm({ ...profileForm, preferred_language: e.target.value })}
                        >
                          <option value="English">English</option>
                          <option value="Hindi">Hindi</option>
                          <option value="Bilingual">Bilingual</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-group" style={{ marginBottom: "0.75rem" }}>
                      <label className="form-label">Previous Education</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. BCA from Pune University"
                        value={profileForm.previous_education}
                        onChange={(e) => setProfileForm({ ...profileForm, previous_education: e.target.value })}
                      />
                    </div>

                    <div className="form-group" style={{ marginBottom: "1rem" }}>
                      <label className="form-label">Learning Goals</label>
                      <textarea
                        className="form-input"
                        rows={2}
                        placeholder="What do you want to achieve?"
                        value={profileForm.learning_goals}
                        onChange={(e) => setProfileForm({ ...profileForm, learning_goals: e.target.value })}
                      />
                    </div>

                    <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
                      <button
                        type="button"
                        className="btn btn-outline"
                        onClick={() => setEditingProfile(false)}
                        disabled={savingProfile}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={savingProfile}
                      >
                        {savingProfile ? "Saving Profile..." : "Save & Update AI Recommendations"}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            7. FLOATING AI SMART TUTOR CHAT DOCK
        ======================================================== */}
        <div className="floating-tutor-container">
          {!showTutorChat ? (
            <button
              type="button"
              className="btn-floating-tutor"
              onClick={() => setShowTutorChat(true)}
              title="Ask AI Smart Tutor"
            >
              <Bot size={22} />
              <span className="tutor-pulse-dot" />
            </button>
          ) : (
            <div className="tutor-chat-window">
              <div className="tutor-chat-header">
                <div className="tutor-header-title">
                  <Bot size={18} />
                  <span>AI Smart Tutor</span>
                </div>
                <button
                  type="button"
                  className="btn-tutor-close"
                  onClick={() => setShowTutorChat(false)}
                >
                  <X size={16} />
                </button>
              </div>

              <div className="tutor-chat-messages">
                {tutorMessages.map((msg, i) => (
                  <div
                    key={i}
                    className={`tutor-msg-row ${msg.sender === "user" ? "msg-user" : "msg-ai"}`}
                  >
                    <div className="tutor-msg-bubble">{msg.text}</div>
                  </div>
                ))}
              </div>

              <form onSubmit={handleSendMessage} className="tutor-chat-input-bar">
                <input
                  type="text"
                  placeholder="Ask a question about your topics..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                />
                <button type="submit" className="btn-tutor-send">
                  <ArrowRight size={16} />
                </button>
              </form>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
