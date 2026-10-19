import React, { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { learningService } from "../api/learningService";
import { youtubeService } from "../api/youtubeService";
import { YouTubeVideoCard } from "../components/YouTubeVideoCard";
import { YouTubeIcon } from "../components/YouTubeIcon";
import { LoadingSpinner, AlertMessage } from "../components/UIFeedback";
import {
  BookOpen,
  CheckCircle,
  Video,
  FileText,
  ExternalLink,
  HelpCircle,
  Clock,
  ArrowLeft,
} from "lucide-react";

export const TopicDetailPage = () => {
  const { id } = useParams();
  const [topic, setTopic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [markingProgress, setMarkingProgress] = useState(false);
  const [progressStatus, setProgressStatus] = useState("not_started");
  const [ytVideos, setYtVideos] = useState([]);

  const fetchTopic = useCallback(async () => {
    try {
      setLoading(true);
      const [data, ytData] = await Promise.all([
        learningService.getTopic(id),
        youtubeService.getYouTubeRecommendations({ topicId: id, maxResults: 4 }),
      ]);
      setTopic(data);
      setYtVideos(ytData?.videos || []);
      if (data.materials && data.materials.length > 0) {
        setSelectedMaterial(data.materials[0]);
      }
      if (data.student_progress) {
        setProgressStatus(data.student_progress.status);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load topic details.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchTopic();
  }, [fetchTopic]);

  const handleToggleComplete = async () => {
    try {
      setMarkingProgress(true);
      const newStatus =
        progressStatus === "completed" ? "in_progress" : "completed";
      const percent = newStatus === "completed" ? 100 : 50;
      await learningService.markProgress(topic.id, newStatus, percent);
      setProgressStatus(newStatus);
    } catch (err) {
      console.error(err);
      setError("Could not update progress.");
    } finally {
      setMarkingProgress(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading learning material..." />;
  }

  if (!topic) {
    return (
      <div className="page-container">
        <AlertMessage type="error" message="Topic not found." />
        <Link to="/subjects" className="btn btn-outline">
          Back to Subjects
        </Link>
      </div>
    );
  }

  const materials = topic.materials || [];
  const isCompleted = progressStatus === "completed";

  return (
    <div className="page-container">
      {/* Top Breadcrumb & Actions */}
      <div className="topic-header-nav">
        <Link to="/subjects" className="back-link">
          <ArrowLeft size={16} />
          <span>Back to Subjects</span>
        </Link>
        <span className="topic-subject-tag">{topic.subject_name}</span>
      </div>

      <AlertMessage type="error" message={error} onClose={() => setError("")} />

      {/* Main Topic Header Card */}
      <div className="topic-hero-card">
        <div className="topic-hero-content">
          <div className="topic-badges-row">
            <span className={`difficulty-pill diff-${topic.difficulty}`}>
              {topic.difficulty} Difficulty
            </span>
            <span
              className={`status-chip ${
                isCompleted ? "status-completed" : "status-progress"
              }`}
            >
              {isCompleted ? (
                <>
                  <CheckCircle size={14} /> Completed
                </>
              ) : (
                "In Progress"
              )}
            </span>
          </div>
          <h1 className="topic-hero-title">{topic.name}</h1>
          <p className="topic-hero-desc">{topic.description}</p>
        </div>

        <div className="topic-hero-actions">
          <button
            onClick={handleToggleComplete}
            disabled={markingProgress}
            className={`btn ${isCompleted ? "btn-secondary" : "btn-success"}`}
          >
            <CheckCircle size={18} />
            <span>
              {markingProgress
                ? "Updating..."
                : isCompleted
                ? "Mark as Incomplete"
                : "Mark as Completed"}
            </span>
          </button>

          <Link to={`/quizzes/${topic.id}`} className="btn btn-primary">
            <HelpCircle size={18} />
            <span>Take Topic Quiz</span>
          </Link>
        </div>
      </div>

      {/* Material Layout: Sidebar + Reader */}
      <div className="materials-layout">
        {/* Materials List / Tabs Sidebar */}
        <aside className="materials-sidebar">
          <h3 className="materials-sidebar-title">
            <BookOpen size={18} />
            <span>Learning Modules ({materials.length})</span>
          </h3>

          <div className="materials-list">
            {materials.map((mat) => (
              <button
                key={mat.id}
                type="button"
                className={`material-item-btn ${
                  selectedMaterial?.id === mat.id ? "active" : ""
                }`}
                onClick={() => setSelectedMaterial(mat)}
              >
                <div className="mat-icon">
                  {mat.material_type === "video" ? (
                    <Video size={18} />
                  ) : mat.material_type === "external" ? (
                    <ExternalLink size={18} />
                  ) : (
                    <FileText size={18} />
                  )}
                </div>
                <div className="mat-meta">
                  <span className="mat-title">{mat.title}</span>
                  <span className="mat-type-time">
                    {mat.material_type.toUpperCase()} &bull; {mat.estimated_minutes} min read
                  </span>
                </div>
              </button>
            ))}
          </div>
        </aside>

        {/* Content Viewer */}
        <main className="material-viewer-card">
          {selectedMaterial ? (
            <div className="material-viewer-inner">
              <div className="viewer-header">
                <div>
                  <div className="viewer-type-pill">
                    {selectedMaterial.material_type}
                  </div>
                  <h2 className="viewer-title">{selectedMaterial.title}</h2>
                </div>
                <div className="estimated-time">
                  <Clock size={16} />
                  <span>{selectedMaterial.estimated_minutes} min read</span>
                </div>
              </div>

              {selectedMaterial.resource_url && (
                <div className="resource-link-banner">
                  <span>External Resource: </span>
                  <a
                    href={selectedMaterial.resource_url}
                    target="_blank"
                    rel="noreferrer"
                    className="external-link-btn"
                  >
                    <span>Open Link</span>
                    <ExternalLink size={14} />
                  </a>
                </div>
              )}

              <div className="material-content-body">
                {selectedMaterial.content ? (
                  <pre className="formatted-content">
                    {selectedMaterial.content}
                  </pre>
                ) : (
                  <p className="text-muted">
                    Please refer to the external resource link above for the full content.
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="empty-state-card">
              <BookOpen size={40} className="text-muted" />
              <h3>No materials uploaded yet</h3>
              <p>Instructors will publish study notes and videos shortly.</p>
            </div>
          )}
        </main>
      </div>

      {/* Recommended YouTube Video Lectures */}
      {ytVideos.length > 0 && (
        <section className="topic-youtube-section mt-8">
          <div className="section-header">
            <div className="section-title-wrap">
              <div className="section-icon-badge bg-amber-soft">
                <YouTubeIcon size={24} />
              </div>
              <div>
                <h2 className="section-title">Recommended Video Lectures (YouTube AI Match)</h2>
                <p className="section-subtitle">
                  Curated visual tutorials to help you master {topic.name}.
                </p>
              </div>
            </div>
          </div>
          <div className="youtube-videos-grid">
            {ytVideos.map((video) => (
              <YouTubeVideoCard key={video.video_id} video={video} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
