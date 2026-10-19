import React, { useEffect, useState } from "react";
import { recommendationService } from "../api/recommendationService";
import { youtubeService } from "../api/youtubeService";
import { RecommendationCard } from "../components/RecommendationCard";
import { YouTubeVideoCard } from "../components/YouTubeVideoCard";
import { YouTubeIcon } from "../components/YouTubeIcon";
import { LoadingSpinner, AlertMessage } from "../components/UIFeedback";
import { Brain, RefreshCw, Sparkles, AlertTriangle, ArrowRight, Zap } from "lucide-react";
import { Link } from "react-router-dom";

export const RecommendationsPage = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [ytVideos, setYtVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const fetchRecs = async () => {
    try {
      setLoading(true);
      const [data, ytData] = await Promise.all([
        recommendationService.getRecommendations(),
        youtubeService.getYouTubeRecommendations({ maxResults: 4 }),
      ]);
      setRecommendations(data);
      setYtVideos(ytData?.videos || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load recommendations.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecs();
  }, []);

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      const [data, ytData] = await Promise.all([
        recommendationService.refreshRecommendations(),
        youtubeService.getYouTubeRecommendations({ maxResults: 4 }),
      ]);
      setRecommendations(data);
      setYtVideos(ytData?.videos || []);
    } catch (err) {
      console.error(err);
      setError("Failed to refresh recommendations.");
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Evaluating your learning patterns with AI..." />;
  }

  // Filter into categories
  const reviewRecs = recommendations.filter((r) => r.kind === "review");
  const nextRecs = recommendations.filter((r) => r.kind === "next_topic");
  const challengeRecs = recommendations.filter((r) => r.kind === "challenge");

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <div className="inline-badge mb-2">
            <Sparkles size={14} className="text-primary" />
            <span>Explainable AI Recommendation Engine</span>
          </div>
          <h1 className="page-title">Personalized Learning Roadmap</h1>
          <p className="page-subtitle">
            Our hybrid AI engine analyzes your quiz attempts, identifies knowledge gaps, and dynamically builds your customized study path.
          </p>
        </div>

        <button
          onClick={handleRefresh}
          className="btn btn-primary"
          disabled={refreshing}
        >
          <RefreshCw size={18} className={refreshing ? "spin-animation" : ""} />
          <span>{refreshing ? "Re-Evaluating Engine..." : "Refresh AI Suggestions"}</span>
        </button>
      </div>

      <AlertMessage type="error" message={error} onClose={() => setError("")} />

      {recommendations.length === 0 ? (
        <div className="empty-state-card">
          <Brain size={48} className="text-muted" />
          <h2>No Recommendations Available Yet</h2>
          <p>Complete learning topics or take quiz assessments to generate your personalized AI recommendations.</p>
          <Link to="/subjects" className="btn btn-primary mt-3">
            Explore Topics
          </Link>
        </div>
      ) : (
        <div className="recs-page-sections">
          {/* 1. Weak Topic Revisions */}
          {reviewRecs.length > 0 && (
            <div className="rec-group-section">
              <div className="rec-group-header header-review">
                <AlertTriangle size={20} className="text-amber" />
                <div>
                  <h2 className="rec-group-title">High-Priority Revisions (Weak Topics)</h2>
                  <p className="rec-group-desc">
                    These topics had quiz scores under 60%. Review study notes before moving forward.
                  </p>
                </div>
              </div>
              <div className="recommendations-grid">
                {reviewRecs.map((rec) => (
                  <RecommendationCard key={rec.id} recommendation={rec} />
                ))}
              </div>
            </div>
          )}

          {/* 2. Next Learning Path Steps */}
          {nextRecs.length > 0 && (
            <div className="rec-group-section">
              <div className="rec-group-header header-next">
                <ArrowRight size={20} className="text-blue" />
                <div>
                  <h2 className="rec-group-title">Next Steps in Learning Path</h2>
                  <p className="rec-group-desc">
                    Sequential topics matched to your mastered subjects and curriculum prerequisites.
                  </p>
                </div>
              </div>
              <div className="recommendations-grid">
                {nextRecs.map((rec) => (
                  <RecommendationCard key={rec.id} recommendation={rec} />
                ))}
              </div>
            </div>
          )}

          {/* 3. Advanced Challenges */}
          {challengeRecs.length > 0 && (
            <div className="rec-group-section">
              <div className="rec-group-header header-challenge">
                <Zap size={20} className="text-purple" />
                <div>
                  <h2 className="rec-group-title">Mastery Challenges (Advanced Concepts)</h2>
                  <p className="rec-group-desc">
                    You demonstrated high scores (85%+) in foundations! Take on these advanced topics.
                  </p>
                </div>
              </div>
              <div className="recommendations-grid">
                {challengeRecs.map((rec) => (
                  <RecommendationCard key={rec.id} recommendation={rec} />
                ))}
              </div>
            </div>
          )}

          {/* 4. AI-Recommended YouTube Video Tutorials */}
          {ytVideos.length > 0 && (
            <div className="rec-group-section">
              <div className="rec-group-header header-youtube">
                <YouTubeIcon size={24} />
                <div>
                  <h2 className="rec-group-title">Curated Video Tutorials (YouTube AI Match)</h2>
                  <p className="rec-group-desc">
                    High-impact video lectures recommended by AI to strengthen weak areas and reinforce core concepts.
                  </p>
                </div>
              </div>
              <div className="youtube-videos-grid">
                {ytVideos.map((video) => (
                  <YouTubeVideoCard key={video.video_id} video={video} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
