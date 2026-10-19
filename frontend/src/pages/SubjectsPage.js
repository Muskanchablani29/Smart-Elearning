import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { learningService } from "../api/learningService";
import { LoadingSpinner, AlertMessage } from "../components/UIFeedback";
import { BookOpen, Layers, CheckCircle, Search, HelpCircle, ArrowRight, GraduationCap } from "lucide-react";

export const SubjectsPage = () => {
  const [subjects, setSubjects] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedCourseFilter, setSelectedCourseFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("all");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [subjectsData, coursesData] = await Promise.all([
          learningService.getSubjects(),
          learningService.getCourses().catch(() => []),
        ]);
        setSubjects(subjectsData);
        setCourses(coursesData);
      } catch (err) {
        console.error(err);
        setError("Failed to load curriculum. Please check if backend is running.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Loading curriculum & topics..." />;
  }

  // Filter subjects by course, search query, and topic difficulty
  const filteredSubjects = subjects
    .filter((subject) => {
      if (selectedCourseFilter === "all") return true;
      return (subject.courses || []).some(
        (c) => c.code.toLowerCase() === selectedCourseFilter.toLowerCase()
      );
    })
    .map((subject) => {
      const filteredTopics = (subject.topics || []).filter((topic) => {
        const matchesSearch =
          topic.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          topic.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          subject.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesDiff =
          difficultyFilter === "all" || topic.difficulty === difficultyFilter;
        return matchesSearch && matchesDiff;
      });

      return {
        ...subject,
        filteredTopics,
      };
    })
    .filter((subject) => subject.filteredTopics.length > 0 || searchQuery === "");

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Curriculum & Course Management</h1>
          <p className="page-subtitle">
            Explore degree-specific subjects (MCA, MSc, MA), study curated learning materials, and practice adaptive quizzes.
          </p>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="filter-toolbar">
          <div className="search-box">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Search topics or concepts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <select
            className="filter-select"
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value)}
          >
            <option value="all">All Difficulties</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>
      </div>

      {/* Degree / Program Filter Pills */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        marginBottom: "1.5rem",
        flexWrap: "wrap",
        background: "var(--color-bg-secondary, #f8fafc)",
        padding: "0.75rem 1rem",
        borderRadius: "10px",
        border: "1px solid var(--color-border, #e2e8f0)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginRight: "0.5rem", color: "var(--color-text-secondary, #64748b)", fontSize: "0.85rem", fontWeight: 600 }}>
          <GraduationCap size={16} />
          <span>Filter by Degree Program:</span>
        </div>

        <button
          type="button"
          onClick={() => setSelectedCourseFilter("all")}
          style={{
            padding: "0.35rem 0.85rem",
            borderRadius: "6px",
            fontSize: "0.825rem",
            fontWeight: 600,
            cursor: "pointer",
            border: selectedCourseFilter === "all" ? "1px solid var(--color-primary, #4f46e5)" : "1px solid var(--color-border, #cbd5e1)",
            background: selectedCourseFilter === "all" ? "var(--color-primary, #4f46e5)" : "var(--color-surface, #ffffff)",
            color: selectedCourseFilter === "all" ? "#ffffff" : "var(--color-text, #334155)",
            transition: "all 0.15s ease",
          }}
        >
          All Programs ({subjects.length})
        </button>

        {courses.map((course) => {
          const isSelected = selectedCourseFilter.toLowerCase() === course.code.toLowerCase();
          return (
            <button
              key={course.id}
              type="button"
              onClick={() => setSelectedCourseFilter(course.code)}
              style={{
                padding: "0.35rem 0.85rem",
                borderRadius: "6px",
                fontSize: "0.825rem",
                fontWeight: 600,
                cursor: "pointer",
                border: isSelected ? "1px solid var(--color-primary, #4f46e5)" : "1px solid var(--color-border, #cbd5e1)",
                background: isSelected ? "var(--color-primary, #4f46e5)" : "var(--color-surface, #ffffff)",
                color: isSelected ? "#ffffff" : "var(--color-text, #334155)",
                transition: "all 0.15s ease",
              }}
            >
              {course.code} ({course.subjects_count || (course.subjects ? course.subjects.length : 0)})
            </button>
          );
        })}
      </div>

      <AlertMessage type="error" message={error} onClose={() => setError("")} />

      {filteredSubjects.length === 0 ? (
        <div className="empty-state-card">
          <Layers size={40} className="text-muted" />
          <h3>No Subjects or Topics Found</h3>
          <p>Try switching degree programs or modifying your search query.</p>
        </div>
      ) : (
        <div className="subjects-list">
          {filteredSubjects.map((subject) => (
            <div key={subject.id} className="subject-block-card">
              <div className="subject-header">
                <div className="subject-info">
                  <div className="subject-icon-tag">
                    <BookOpen size={22} className="text-primary" />
                  </div>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap", marginBottom: "0.25rem" }}>
                      <h2 className="subject-title" style={{ margin: 0 }}>{subject.name}</h2>
                      {subject.courses && subject.courses.length > 0 && (
                        <div style={{ display: "flex", gap: "0.35rem" }}>
                          {subject.courses.map((c) => (
                            <span
                              key={c.id}
                              style={{
                                background: "rgba(79, 70, 229, 0.08)",
                                color: "#4f46e5",
                                border: "1px solid rgba(79, 70, 229, 0.2)",
                                padding: "0.1rem 0.45rem",
                                borderRadius: "4px",
                                fontSize: "0.725rem",
                                fontWeight: 700,
                              }}
                            >
                              {c.code}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <p className="subject-description">{subject.description}</p>
                  </div>
                </div>
                <span className="topic-counter-badge">
                  {subject.filteredTopics.length} Topics
                </span>
              </div>

              <div className="topics-grid">
                {subject.filteredTopics.map((topic) => {
                  const progress = topic.student_progress || {
                    status: "not_started",
                    percent_complete: 0,
                  };
                  const isCompleted = progress.status === "completed";
                  const isInProgress = progress.status === "in_progress";

                  return (
                    <div
                      key={topic.id}
                      className={`topic-card ${isCompleted ? "topic-completed" : ""}`}
                    >
                      <div className="topic-card-top">
                        <span className={`difficulty-pill diff-${topic.difficulty}`}>
                          {topic.difficulty}
                        </span>

                        <span
                          className={`progress-badge ${
                            isCompleted
                              ? "prog-completed"
                              : isInProgress
                              ? "prog-in-progress"
                              : "prog-not-started"
                          }`}
                        >
                          {isCompleted ? (
                            <>
                              <CheckCircle size={13} /> Completed
                            </>
                          ) : isInProgress ? (
                            `${Math.round(progress.percent_complete)}% Done`
                          ) : (
                            "Not Started"
                          )}
                        </span>
                      </div>

                      <h3 className="topic-name">{topic.name}</h3>
                      <p className="topic-desc">{topic.description}</p>

                      <div className="topic-meta">
                        <span className="meta-item">
                          <BookOpen size={14} />
                          {topic.materials_count || (topic.materials ? topic.materials.length : 0)} Materials
                        </span>
                        <span className="meta-item">
                          <HelpCircle size={14} />
                          {topic.questions_count || 3} Questions
                        </span>
                      </div>

                      <div className="topic-actions">
                        <Link
                          to={`/topics/${topic.id}`}
                          className="btn btn-primary btn-sm flex-1"
                        >
                          <span>Study Content</span>
                          <ArrowRight size={14} />
                        </Link>
                        <Link
                          to={`/quizzes/${topic.id}`}
                          className="btn btn-outline btn-sm"
                        >
                          <span>Quiz</span>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
