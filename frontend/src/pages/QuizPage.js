import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { quizService } from "../api/quizService";
import { learningService } from "../api/learningService";
import { LoadingSpinner, AlertMessage } from "../components/UIFeedback";
import {
  CheckCircle2,
  XCircle,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  Sparkles,
} from "lucide-react";

export const QuizPage = () => {
  const { topicId } = useParams();

  const [topic, setTopic] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [generatingAI, setGeneratingAI] = useState(false);
  const [difficulty, setDifficulty] = useState("beginner");
  const [error, setError] = useState("");
  const [aiSuccessMsg, setAiSuccessMsg] = useState("");
  const [result, setResult] = useState(null);

  const loadQuiz = async (diff = null) => {
    try {
      setLoading(true);
      const targetDiff = diff || difficulty;
      const [topicData, quizData] = await Promise.all([
        learningService.getTopic(topicId),
        quizService.getQuizQuestions(topicId, targetDiff),
      ]);
      setTopic(topicData);
      if (!diff && topicData?.difficulty) {
        setDifficulty(topicData.difficulty);
      }
      setQuestions(quizData.questions || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load quiz. Please make sure questions exist for this topic.");
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    loadQuiz();
  }, [topicId]);

  const handleDifficultyChange = (newDiff) => {
    setDifficulty(newDiff);
    setSelectedAnswers({});
    setResult(null);
    loadQuiz(newDiff);
  };

  const handleGenerateAIQuiz = async () => {
    try {
      setGeneratingAI(true);
      setError("");
      setAiSuccessMsg("");
      const res = await quizService.generateAIQuiz(topicId, difficulty, 3);
      if (res.questions && res.questions.length > 0) {
        setQuestions(res.questions);
        setSelectedAnswers({});
        setResult(null);
        setAiSuccessMsg(res.message || `Successfully generated ${res.questions.length} AI questions!`);
        setTimeout(() => setAiSuccessMsg(""), 5000);
      }
    } catch (err) {
      console.error("AI quiz generation error:", err);
      setError("AI Generation unavailable. Fallback to existing syllabus questions.");
    } finally {
      setGeneratingAI(false);
    }
  };

  const handleSelectOption = (questionId, optionKey) => {
    if (result) return; // Prevent changing after submission
    setSelectedAnswers({
      ...selectedAnswers,
      [questionId]: optionKey,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (Object.keys(selectedAnswers).length < questions.length) {
      if (
        !window.confirm(
          `You have answered ${Object.keys(selectedAnswers).length} out of ${
            questions.length
          } questions. Submit anyway?`
        )
      ) {
        return;
      }
    }

    try {
      setSubmitting(true);
      setError("");
      const submissionResult = await quizService.submitQuiz(
        topicId,
        selectedAnswers,
        difficulty
      );
      setResult(submissionResult);
    } catch (err) {
      console.error(err);
      setError("Failed to submit quiz attempt. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetake = () => {
    setSelectedAnswers({});
    setResult(null);
  };

  if (loading) {
    return <LoadingSpinner message="Loading quiz questions..." />;
  }

  if (questions.length === 0 && !loading) {
    return (
      <div className="page-container">
        <div className="empty-state-card" style={{ maxWidth: "600px", margin: "3rem auto", textAlign: "center", padding: "2.5rem 2rem", background: "var(--color-surface, #fff)", borderRadius: "12px", border: "1px solid var(--color-border, #e2e8f0)" }}>
          <div style={{ width: "54px", height: "54px", borderRadius: "50%", background: "rgba(79, 70, 229, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.25rem auto" }}>
            <Sparkles size={28} style={{ color: "var(--color-primary, #4f46e5)" }} />
          </div>
          <h3 style={{ fontSize: "1.35rem", marginBottom: "0.5rem", color: "var(--color-text, #1e293b)" }}>
            No Questions Yet for {topic?.name || "this topic"}
          </h3>
          <p style={{ color: "#64748b", marginBottom: "1.5rem", fontSize: "0.925rem", lineHeight: 1.5 }}>
            Our AI Quiz Engine can dynamically generate questions grounded in this topic's syllabus at your chosen difficulty level.
          </p>

          <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center", marginBottom: "1.5rem" }}>
            {["beginner", "intermediate", "advanced"].map((d) => (
              <button
                key={d}
                type="button"
                className={`btn btn-sm ${difficulty === d ? "btn-primary" : "btn-outline"}`}
                onClick={() => handleDifficultyChange(d)}
                style={{ textTransform: "capitalize" }}
              >
                {d}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={handleGenerateAIQuiz}
              className="btn btn-primary"
              disabled={generatingAI}
              style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
            >
              <Sparkles size={16} />
              <span>{generatingAI ? "Generating AI Questions..." : "Generate AI Quiz Questions"}</span>
            </button>
            <Link to={`/topics/${topicId}`} className="btn btn-outline">
              Back to Learning Material
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Quiz Header Navigation */}
      <div className="topic-header-nav">
        <Link to={`/topics/${topicId}`} className="back-link">
          <ArrowLeft size={16} />
          <span>Back to Learning Material</span>
        </Link>
        <span className="topic-subject-tag">{topic?.subject_name}</span>
      </div>

      <AlertMessage type="error" message={error} onClose={() => setError("")} />

      {aiSuccessMsg && (
        <div style={{
          padding: "0.75rem 1.25rem",
          background: "rgba(16, 185, 129, 0.1)",
          border: "1px solid rgba(16, 185, 129, 0.25)",
          borderRadius: "8px",
          color: "#065f46",
          fontSize: "0.9rem",
          fontWeight: 600,
          marginBottom: "1rem",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
        }}>
          <Sparkles size={16} />
          <span>{aiSuccessMsg}</span>
        </div>
      )}

      {/* RESULT VIEW (Post Submission) */}
      {result ? (
        <div className="quiz-result-wrapper">
          <div className="quiz-score-banner">
            <div className="score-badge-circle">
              <span className="score-number">{Math.round(result.score)}%</span>
              <span className="score-sub">Score</span>
            </div>

            <div className="score-banner-text">
              <div className="banner-status-tag">
                {result.score >= 70 ? (
                  <span className="pass-pill">
                    <CheckCircle2 size={16} /> Mastery Achieved (Passed)
                  </span>
                ) : (
                  <span className="fail-pill">
                    <RefreshCw size={16} /> Review Recommended
                  </span>
                )}
              </div>
              <h2 className="result-headline">
                {result.score >= 85
                  ? "Outstanding Performance!"
                  : result.score >= 70
                  ? "Well Done! Topic Completed."
                  : "Keep Practicing! Revision Added to Recommendations."}
              </h2>
              <p className="result-details">
                You answered <strong>{result.correct_answers}</strong> out of{" "}
                <strong>{result.total_questions}</strong> questions correctly.
                Your learning progress and AI recommendations have been updated.
              </p>
            </div>

            <div className="score-banner-actions">
              <button onClick={handleRetake} className="btn btn-secondary">
                <RefreshCw size={16} />
                <span>Retake Quiz</span>
              </button>
              <Link to="/recommendations" className="btn btn-primary">
                <Sparkles size={16} />
                <span>View Recommendations</span>
              </Link>
            </div>
          </div>

          {/* Detailed Question Review */}
          <div className="review-section">
            <h3 className="review-title">Detailed Question Review & Explanations</h3>
            <div className="review-list">
              {result.responses?.map((res, index) => {
                const isCorrect = res.is_correct;
                return (
                  <div
                    key={res.id || index}
                    className={`review-card ${
                      isCorrect ? "review-correct" : "review-incorrect"
                    }`}
                  >
                    <div className="review-card-top">
                      <span className="q-number">Question {index + 1}</span>
                      <span
                        className={`answer-status-pill ${
                          isCorrect ? "status-correct" : "status-wrong"
                        }`}
                      >
                        {isCorrect ? (
                          <>
                            <CheckCircle2 size={14} /> Correct
                          </>
                        ) : (
                          <>
                            <XCircle size={14} /> Incorrect
                          </>
                        )}
                      </span>
                    </div>

                    <p className="q-text">{res.question_text}</p>

                    {/* Options list showing what was picked and correct */}
                    <div className="review-options">
                      {["A", "B", "C", "D"].map((opt) => {
                        const optKey = `option_${opt.toLowerCase()}`;
                        const optText = res[optKey];
                        const isStudentChoice = res.selected_option === opt;
                        const isCorrectChoice = res.correct_option === opt;

                        let optionClass = "review-opt";
                        if (isCorrectChoice) optionClass += " opt-correct";
                        if (isStudentChoice && !isCorrect)
                          optionClass += " opt-selected-wrong";

                        return (
                          <div key={opt} className={optionClass}>
                            <span className="opt-letter">{opt}</span>
                            <span className="opt-text">{optText}</span>
                            {isCorrectChoice && (
                              <span className="correct-tag">Correct Answer</span>
                            )}
                            {isStudentChoice && !isCorrect && (
                              <span className="wrong-tag">Your Choice</span>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {res.explanation && (
                      <div className="explanation-box">
                        <strong>Explanation:</strong>
                        <p>{res.explanation}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* QUIZ TAKING VIEW */
        <div className="quiz-flow-container">
          <div className="quiz-header-card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                <span className={`difficulty-pill diff-${difficulty}`}>
                  {difficulty} Level
                </span>
                {questions.some((q) => q.is_ai_generated) && (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", background: "rgba(79, 70, 229, 0.1)", color: "#4f46e5", padding: "0.15rem 0.5rem", borderRadius: "4px", fontSize: "0.75rem", fontWeight: 600 }}>
                    <Sparkles size={12} /> AI Powered
                  </span>
                )}
              </div>
              <h1 className="quiz-title" style={{ margin: "0 0 0.25rem 0" }}>Quiz: {topic?.name}</h1>
              <p className="quiz-sub" style={{ margin: 0 }}>
                Answer all {questions.length} multiple choice questions to assess your understanding.
              </p>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
              {/* Difficulty selector pills */}
              <div style={{ display: "flex", gap: "0.25rem", background: "var(--color-bg-secondary, #f1f5f9)", padding: "0.25rem", borderRadius: "6px" }}>
                {["beginner", "intermediate", "advanced"].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => handleDifficultyChange(d)}
                    style={{
                      padding: "0.25rem 0.6rem",
                      borderRadius: "4px",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      cursor: "pointer",
                      border: "none",
                      background: difficulty === d ? "var(--color-primary, #4f46e5)" : "transparent",
                      color: difficulty === d ? "#ffffff" : "var(--color-text-secondary, #64748b)",
                      textTransform: "capitalize",
                    }}
                  >
                    {d}
                  </button>
                ))}
              </div>

              {/* Dynamic AI quiz generator button */}
              <button
                type="button"
                onClick={handleGenerateAIQuiz}
                className="btn btn-sm btn-outline-primary"
                disabled={generatingAI}
                style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}
              >
                <Sparkles size={14} />
                <span>{generatingAI ? "Generating..." : "Generate AI Quiz"}</span>
              </button>

              <div className="quiz-progress-indicator">
                <span>Answered: </span>
                <strong>
                  {Object.keys(selectedAnswers).length} / {questions.length}
                </strong>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="quiz-form">
            <div className="questions-container">
              {questions.map((q, idx) => (
                <div key={q.id} className="question-card">
                  <div className="q-header" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span className="q-badge">Question {idx + 1}</span>
                    <span className="q-diff-badge">{q.difficulty}</span>
                    {q.is_ai_generated && (
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", background: "rgba(79, 70, 229, 0.1)", color: "#4f46e5", padding: "0.1rem 0.4rem", borderRadius: "4px", fontSize: "0.7rem", fontWeight: 600 }}>
                        <Sparkles size={11} /> AI Generated
                      </span>
                    )}
                  </div>

                  <p className="question-text">{q.question_text}</p>

                  <div className="options-grid">
                    {["A", "B", "C", "D"].map((opt) => {
                      const optKey = `option_${opt.toLowerCase()}`;
                      const optValue = q[optKey];
                      const isSelected = selectedAnswers[q.id] === opt;

                      return (
                        <button
                          key={opt}
                          type="button"
                          className={`option-btn ${isSelected ? "selected" : ""}`}
                          onClick={() => handleSelectOption(q.id, opt)}
                        >
                          <span className="option-bullet">{opt}</span>
                          <span className="option-content">{optValue}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="quiz-footer-bar">
              <button
                type="submit"
                className="btn btn-primary btn-lg"
                disabled={submitting}
              >
                {submitting ? (
                  <span className="btn-loading">
                    <span className="spinner-small"></span> Evaluating Answers...
                  </span>
                ) : (
                  <>
                    <span>Submit Quiz</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
