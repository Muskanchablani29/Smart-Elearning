import React, { useEffect, useState } from "react";
import { dashboardService } from "../api/dashboardService";
import { learningService } from "../api/learningService";
import { quizService } from "../api/quizService";
import { LoadingSpinner, AlertMessage } from "../components/UIFeedback";
import {
  Users,
  BookOpen,
  HelpCircle,
  Award,
  PlusCircle,
  TrendingDown,
  CheckCircle,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

export const InstructorDashboardPage = () => {
  const [data, setData] = useState(null);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Modals / forms state
  const [showMaterialForm, setShowMaterialForm] = useState(false);
  const [showQuestionForm, setShowQuestionForm] = useState(false);

  // New Material state
  const [materialForm, setMaterialForm] = useState({
    topic: "",
    title: "",
    material_type: "notes",
    content: "",
    resource_url: "",
    estimated_minutes: 15,
    is_published: true,
  });

  // New Question state
  const [questionForm, setQuestionForm] = useState({
    topic: "",
    difficulty: "beginner",
    question_text: "",
    option_a: "",
    option_b: "",
    option_c: "",
    option_d: "",
    correct_option: "A",
    explanation: "",
  });

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const [dashData, topicsData] = await Promise.all([
        dashboardService.getInstructorDashboard(),
        learningService.getTopics(),
      ]);
      setData(dashData);
      setTopics(topicsData);
      if (topicsData.length > 0) {
        setMaterialForm((prev) => ({ ...prev, topic: topicsData[0].id }));
        setQuestionForm((prev) => ({ ...prev, topic: topicsData[0].id }));
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load instructor analytics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleCreateMaterial = async (e) => {
    e.preventDefault();
    try {
      await learningService.createMaterial(materialForm);
      setSuccessMsg("Learning material published successfully!");
      setShowMaterialForm(false);
      setMaterialForm({
        topic: topics[0]?.id || "",
        title: "",
        material_type: "notes",
        content: "",
        resource_url: "",
        estimated_minutes: 15,
        is_published: true,
      });
      fetchDashboard();
    } catch (err) {
      console.error(err);
      setError("Could not save material.");
    }
  };

  const handleCreateQuestion = async (e) => {
    e.preventDefault();
    try {
      await quizService.createQuestion(questionForm);
      setSuccessMsg("Quiz question added successfully!");
      setShowQuestionForm(false);
      setQuestionForm({
        topic: topics[0]?.id || "",
        difficulty: "beginner",
        question_text: "",
        option_a: "",
        option_b: "",
        option_c: "",
        option_d: "",
        correct_option: "A",
        explanation: "",
      });
      fetchDashboard();
    } catch (err) {
      console.error(err);
      setError("Could not save question.");
    }
  };

  if (loading) {
    return <LoadingSpinner message="Aggregating cohort performance metrics..." />;
  }

  const metrics = data?.metrics || {
    students_count: 0,
    total_materials: 0,
    total_questions: 0,
    total_attempts: 0,
    average_quiz_score: 0,
  };

  return (
    <div className="page-container">
      {/* Top Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Instructor Analytics & Content Management</h1>
          <p className="page-subtitle">
            Cohort performance overview, weak topic identification, and learning material management.
          </p>
        </div>

        <div className="header-action-buttons">
          <button
            onClick={() => {
              setShowMaterialForm(!showMaterialForm);
              setShowQuestionForm(false);
            }}
            className="btn btn-primary"
          >
            <PlusCircle size={18} />
            <span>Publish Material</span>
          </button>
          <button
            onClick={() => {
              setShowQuestionForm(!showQuestionForm);
              setShowMaterialForm(false);
            }}
            className="btn btn-secondary"
          >
            <PlusCircle size={18} />
            <span>Add Quiz Question</span>
          </button>
        </div>
      </div>

      <AlertMessage type="error" message={error} onClose={() => setError("")} />
      <AlertMessage type="success" message={successMsg} onClose={() => setSuccessMsg("")} />

      {/* Metric Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon-wrapper bg-blue-soft">
            <Users size={24} className="text-blue" />
          </div>
          <div className="stat-info">
            <span className="stat-label">Total Enrolled Students</span>
            <h3 className="stat-value">{metrics.students_count}</h3>
            <span className="stat-hint">Active learners</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper bg-purple-soft">
            <Award size={24} className="text-purple" />
          </div>
          <div className="stat-info">
            <span className="stat-label">Cohort Average Score</span>
            <h3 className="stat-value">{metrics.average_quiz_score}%</h3>
            <span className="stat-hint">Across all submissions</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper bg-green-soft">
            <BookOpen size={24} className="text-green" />
          </div>
          <div className="stat-info">
            <span className="stat-label">Materials Published</span>
            <h3 className="stat-value">{metrics.total_materials}</h3>
            <span className="stat-hint">Notes, articles, videos</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper bg-amber-soft">
            <HelpCircle size={24} className="text-amber" />
          </div>
          <div className="stat-info">
            <span className="stat-label">Total Quiz Questions</span>
            <h3 className="stat-value">{metrics.total_questions}</h3>
            <span className="stat-hint">{metrics.total_attempts} student attempts</span>
          </div>
        </div>
      </div>

      {/* FORM: Create Material Modal / Card */}
      {showMaterialForm && (
        <div className="form-card-panel mb-8">
          <div className="form-card-header">
            <h3>Publish New Learning Material</h3>
            <button
              onClick={() => setShowMaterialForm(false)}
              className="btn btn-outline btn-xs"
            >
              Cancel
            </button>
          </div>
          <form onSubmit={handleCreateMaterial} className="p-4">
            <div className="form-row">
              <div className="form-group col-half">
                <label className="form-label">Select Topic</label>
                <select
                  className="form-input"
                  value={materialForm.topic}
                  onChange={(e) =>
                    setMaterialForm({ ...materialForm, topic: e.target.value })
                  }
                  required
                >
                  {topics.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.subject_name} &bull; {t.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group col-half">
                <label className="form-label">Material Type</label>
                <select
                  className="form-input"
                  value={materialForm.material_type}
                  onChange={(e) =>
                    setMaterialForm({
                      ...materialForm,
                      material_type: e.target.value,
                    })
                  }
                >
                  <option value="notes">Study Notes</option>
                  <option value="video">Video</option>
                  <option value="article">Article</option>
                  <option value="external">External Resource</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Material Title</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. In-Depth Guide to Decision Trees"
                value={materialForm.title}
                onChange={(e) =>
                  setMaterialForm({ ...materialForm, title: e.target.value })
                }
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group col-half">
                <label className="form-label">Resource URL (Optional)</label>
                <input
                  type="url"
                  className="form-input"
                  placeholder="https://youtube.com/..."
                  value={materialForm.resource_url}
                  onChange={(e) =>
                    setMaterialForm({
                      ...materialForm,
                      resource_url: e.target.value,
                    })
                  }
                />
              </div>
              <div className="form-group col-half">
                <label className="form-label">Estimated Reading Time (Minutes)</label>
                <input
                  type="number"
                  className="form-input"
                  value={materialForm.estimated_minutes}
                  onChange={(e) =>
                    setMaterialForm({
                      ...materialForm,
                      estimated_minutes: parseInt(e.target.value) || 10,
                    })
                  }
                  min="1"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Content Notes (Markdown / Text)</label>
              <textarea
                className="form-input textarea-large"
                rows="6"
                placeholder="Write detailed study notes, code snippets, or key takeaways..."
                value={materialForm.content}
                onChange={(e) =>
                  setMaterialForm({ ...materialForm, content: e.target.value })
                }
              />
            </div>

            <button type="submit" className="btn btn-primary">
              Publish Material
            </button>
          </form>
        </div>
      )}

      {/* FORM: Create Quiz Question Modal / Card */}
      {showQuestionForm && (
        <div className="form-card-panel mb-8">
          <div className="form-card-header">
            <h3>Add New Quiz Question</h3>
            <button
              onClick={() => setShowQuestionForm(false)}
              className="btn btn-outline btn-xs"
            >
              Cancel
            </button>
          </div>
          <form onSubmit={handleCreateQuestion} className="p-4">
            <div className="form-row">
              <div className="form-group col-half">
                <label className="form-label">Select Topic</label>
                <select
                  className="form-input"
                  value={questionForm.topic}
                  onChange={(e) =>
                    setQuestionForm({ ...questionForm, topic: e.target.value })
                  }
                  required
                >
                  {topics.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.subject_name} &bull; {t.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group col-half">
                <label className="form-label">Difficulty</label>
                <select
                  className="form-input"
                  value={questionForm.difficulty}
                  onChange={(e) =>
                    setQuestionForm({
                      ...questionForm,
                      difficulty: e.target.value,
                    })
                  }
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Question Text</label>
              <textarea
                className="form-input"
                rows="2"
                placeholder="What is the output or concept..."
                value={questionForm.question_text}
                onChange={(e) =>
                  setQuestionForm({
                    ...questionForm,
                    question_text: e.target.value,
                  })
                }
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group col-half">
                <label className="form-label">Option A</label>
                <input
                  type="text"
                  className="form-input"
                  value={questionForm.option_a}
                  onChange={(e) =>
                    setQuestionForm({ ...questionForm, option_a: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group col-half">
                <label className="form-label">Option B</label>
                <input
                  type="text"
                  className="form-input"
                  value={questionForm.option_b}
                  onChange={(e) =>
                    setQuestionForm({ ...questionForm, option_b: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group col-half">
                <label className="form-label">Option C</label>
                <input
                  type="text"
                  className="form-input"
                  value={questionForm.option_c}
                  onChange={(e) =>
                    setQuestionForm({ ...questionForm, option_c: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group col-half">
                <label className="form-label">Option D</label>
                <input
                  type="text"
                  className="form-input"
                  value={questionForm.option_d}
                  onChange={(e) =>
                    setQuestionForm({ ...questionForm, option_d: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group col-half">
                <label className="form-label">Correct Option</label>
                <select
                  className="form-input"
                  value={questionForm.correct_option}
                  onChange={(e) =>
                    setQuestionForm({
                      ...questionForm,
                      correct_option: e.target.value,
                    })
                  }
                >
                  <option value="A">Option A</option>
                  <option value="B">Option B</option>
                  <option value="C">Option C</option>
                  <option value="D">Option D</option>
                </select>
              </div>
              <div className="form-group col-half">
                <label className="form-label">Explanation</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Why is this answer correct?"
                  value={questionForm.explanation}
                  onChange={(e) =>
                    setQuestionForm({
                      ...questionForm,
                      explanation: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary">
              Save Quiz Question
            </button>
          </form>
        </div>
      )}

      {/* Weak Topics in Cohort Banner */}
      <section className="mb-8">
        <div className="section-header">
          <div className="section-title-wrap">
            <div className="section-icon-badge bg-amber-soft">
              <TrendingDown size={20} className="text-amber" />
            </div>
            <div>
              <h2 className="section-title">Cohort Knowledge Gaps (Weak Topics)</h2>
              <p className="section-subtitle">
                Topics with average scores below 65%. Recommended for targeted revision or additional tutorial sessions.
              </p>
            </div>
          </div>
        </div>

        {data?.weak_topics?.length > 0 ? (
          <div className="activity-table-card">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Topic</th>
                  <th>Subject</th>
                  <th>Difficulty</th>
                  <th>Total Attempts</th>
                  <th>Average Score</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {data.weak_topics.map((t) => (
                  <tr key={t.id}>
                    <td className="fw-medium text-danger">{t.name}</td>
                    <td>{t.subject}</td>
                    <td>
                      <span className={`difficulty-pill diff-${t.difficulty}`}>
                        {t.difficulty}
                      </span>
                    </td>
                    <td>{t.attempts_count}</td>
                    <td>
                      <span className="score-badge score-low">
                        {t.average_score}%
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => {
                          setMaterialForm((prev) => ({ ...prev, topic: t.id }));
                          setShowMaterialForm(true);
                        }}
                        className="btn btn-outline btn-xs"
                      >
                        Add Revision Material
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state-card">
            <CheckCircle size={36} className="text-green" />
            <p>No major weak topics identified in the cohort! Students are performing adequately.</p>
          </div>
        )}
      </section>

      {/* Charts Section */}
      <div className="charts-grid mb-8">
        <div className="chart-card">
          <div className="chart-header">
            <h3 className="chart-title">Cohort Quiz Score Distribution</h3>
            <span className="chart-subtitle">Distribution of all quiz submissions</span>
          </div>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={data?.score_distribution || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="range" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(val) => [val, "Submissions"]}
                  contentStyle={{ borderRadius: "8px", border: "1px solid #CBD5E1" }}
                />
                <Bar dataKey="count" fill="#6366F1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Topic Breakdown Table */}
        <div className="chart-card">
          <div className="chart-header">
            <h3 className="chart-title">Topic Completion & Assessment Rates</h3>
            <span className="chart-subtitle">Student mastery by topic</span>
          </div>
          <div className="scrollable-table-wrap">
            <table className="custom-table table-compact">
              <thead>
                <tr>
                  <th>Topic</th>
                  <th>Avg Score</th>
                  <th>Completion</th>
                </tr>
              </thead>
              <tbody>
                {data?.topic_stats?.map((t) => (
                  <tr key={t.id}>
                    <td className="fw-medium">{t.name}</td>
                    <td>{t.average_score > 0 ? `${t.average_score}%` : "No attempts"}</td>
                    <td>{t.completion_rate}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
