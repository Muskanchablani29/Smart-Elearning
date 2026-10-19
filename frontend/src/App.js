import React from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { Navbar } from "./components/Navbar";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { LandingPage } from "./pages/LandingPage";
import { StudentDashboardPage } from "./pages/StudentDashboardPage";
import { SubjectsPage } from "./pages/SubjectsPage";
import { TopicDetailPage } from "./pages/TopicDetailPage";
import { QuizPage } from "./pages/QuizPage";
import { QuizzesListPage } from "./pages/QuizzesListPage";
import { RecommendationsPage } from "./pages/RecommendationsPage";
import { InstructorDashboardPage } from "./pages/InstructorDashboardPage";
import { AdminDashboardPage } from "./pages/AdminDashboardPage";
import "./App.css";

const NotFoundPage = () => (
  <div className="page-container text-center py-12">
    <div className="empty-state-card">
      <h2>404 - Page Not Found</h2>
      <p>The page you are looking for does not exist or has been moved.</p>
      <Link to="/" className="btn btn-primary mt-3">
        Return Home
      </Link>
    </div>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="app-layout">
          <Navbar />
          <main className="main-content">
            <Routes>
              {/* Home / Landing Page containing system details */}
              <Route path="/" element={<LandingPage />} />


              {/* Public Auth Routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Student Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute allowedRoles={["student"]}>
                    <StudentDashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/subjects"
                element={
                  <ProtectedRoute>
                    <SubjectsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/topics/:id"
                element={
                  <ProtectedRoute>
                    <TopicDetailPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/quizzes"
                element={
                  <ProtectedRoute allowedRoles={["student"]}>
                    <QuizzesListPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/quizzes/:topicId"
                element={
                  <ProtectedRoute allowedRoles={["student"]}>
                    <QuizPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/recommendations"
                element={
                  <ProtectedRoute allowedRoles={["student"]}>
                    <RecommendationsPage />
                  </ProtectedRoute>
                }
              />

              {/* Instructor Routes */}
              <Route
                path="/instructor"
                element={
                  <ProtectedRoute allowedRoles={["instructor", "admin"]}>
                    <InstructorDashboardPage />
                  </ProtectedRoute>
                }
              />

              {/* Admin Routes */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AdminDashboardPage />
                  </ProtectedRoute>
                }
              />

              {/* Catch-all */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
