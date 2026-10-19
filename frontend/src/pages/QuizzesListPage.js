import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { quizService } from "../api/quizService";
import { learningService } from "../api/learningService";
import { LoadingSpinner, AlertMessage } from "../components/UIFeedback";
import { Clock, ArrowRight } from "lucide-react";

export const QuizzesListPage = () => {
  const [history, setHistory] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [historyData, subjectsData] = await Promise.all([
          quizService.getQuizHistory(),
          learningService.getSubjects(),
        ]);
        setHistory(historyData);
        setSubjects(subjectsData);
      } catch (err) {
        console.error(err);
        setError("Failed to load quiz data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Loading quizzes and attempt history..." />;
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Topic Assessments & Quizzes</h1>
          <p className="page-subtitle">
            Test your understanding across all course topics and review your past scores.
          </p>
        </div>
      </div>

      <AlertMessage type="error" message={error} onClose={() => setError("")} />

      {/* Available Topic Quizzes */}
      <section className="mb-8">
        <h2 className="section-title mb-4">Available Topic Quizzes</h2>
        <div className="subjects-list">
          {subjects.map((sub) => (
            <div key={sub.id} className="subject-block-card">
              <h3 className="subject-title mb-3">{sub.name}</h3>
              <div className="quiz-cards-grid">
                {(sub.topics || []).map((topic) => (
                  <div key={topic.id} className="quiz-card-item">
                    <div className="quiz-item-header">
                      <span className={`difficulty-pill diff-${topic.difficulty}`}>
                        {topic.difficulty}
                      </span>
                      <span className="quiz-badge-count">3 Questions</span>
                    </div>
                    <h4 className="quiz-topic-name">{topic.name}</h4>
                    <Link
                      to={`/quizzes/${topic.id}`}
                      className="btn btn-primary btn-sm btn-block mt-3"
                    >
                      <span>Take Quiz</span>
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Quiz History */}
      <section>
        <h2 className="section-title mb-4">Your Past Quiz Attempts</h2>
        {history.length > 0 ? (
          <div className="activity-table-card">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Topic</th>
                  <th>Subject</th>
                  <th>Difficulty</th>
                  <th>Score</th>
                  <th>Correct Answers</th>
                  <th>Date Attempted</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {history.map((att) => (
                  <tr key={att.id}>
                    <td className="fw-medium">{att.topic_name}</td>
                    <td className="text-muted">{att.subject_name}</td>
                    <td>
                      <span className={`difficulty-pill diff-${att.difficulty}`}>
                        {att.difficulty}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`score-badge ${
                          att.score >= 70
                            ? "score-high"
                            : att.score >= 50
                            ? "score-mid"
                            : "score-low"
                        }`}
                      >
                        {att.score}%
                      </span>
                    </td>
                    <td>
                      {att.correct_answers} / {att.total_questions}
                    </td>
                    <td className="text-muted">
                      {new Date(att.started_at).toLocaleDateString()}{" "}
                      {new Date(att.started_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td>
                      <Link
                        to={`/quizzes/${att.topic}`}
                        className="btn btn-outline btn-xs"
                      >
                        Retake
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state-card">
            <Clock size={36} className="text-muted" />
            <p>You haven't completed any quizzes yet. Select a topic above to begin!</p>
          </div>
        )}
      </section>
    </div>
  );
};
