import React from "react";
import { Link } from "react-router-dom";
import { BookOpen, Sparkles, RefreshCw, Zap, ArrowRight } from "lucide-react";
import { YouTubeIcon } from "./YouTubeIcon";

export const RecommendationCard = ({ recommendation }) => {
  const { kind, reason, topic, topic_name, subject_name, target_difficulty, priority, material_title, youtube_videos = [] } = recommendation;

  const getKindConfig = () => {
    switch (kind) {
      case "review":
        return {
          label: "Weak Topic Revision",
          badgeClass: "badge-review",
          icon: <RefreshCw size={18} className="icon-pulse text-amber" />,
          actionText: "Review Topic & Notes",
        };
      case "challenge":
        return {
          label: "Mastery Challenge",
          badgeClass: "badge-challenge",
          icon: <Zap size={18} className="text-purple" />,
          actionText: "Take Challenge",
        };
      case "next_topic":
      default:
        return {
          label: "Next Recommended Step",
          badgeClass: "badge-next",
          icon: <Sparkles size={18} className="text-blue" />,
          actionText: "Explore Topic",
        };
    }
  };

  const config = getKindConfig();

  return (
    <div className={`recommendation-card border-${kind}`}>
      <div className="card-top">
        <div className="badge-row">
          <span className={`kind-badge ${config.badgeClass}`}>
            {config.icon}
            <span>{config.label}</span>
          </span>
          {recommendation.match_percentage && (
            <span className="match-score-pill">
              {recommendation.match_percentage}% Match
            </span>
          )}
          <span className="priority-tag">
            Priority {priority}/5
          </span>
        </div>
        <span className={`difficulty-pill diff-${target_difficulty}`}>
          {target_difficulty}
        </span>
      </div>


      <div className="card-body-content">
        <h4 className="rec-topic-title">{topic_name}</h4>
        <p className="rec-subject">{subject_name}</p>

        <div className="rec-reason-box">
          <strong className="reason-label">AI Logic:</strong>
          <p className="reason-text">{reason}</p>
        </div>

        {material_title && (
          <div className="rec-material-hint">
            <BookOpen size={15} />
            <span>Recommended Reading: <strong>{material_title}</strong></span>
          </div>
        )}

        {youtube_videos.length > 0 && (
          <div className="rec-youtube-hint">
            <YouTubeIcon size={16} />
            <span>
              Video Tutorial:{" "}
              <a
                href={youtube_videos[0].video_url}
                target="_blank"
                rel="noreferrer"
                className="yt-inline-link"
              >
                <strong>{youtube_videos[0].title}</strong>
              </a>
            </span>
          </div>
        )}
      </div>

      <div className="card-footer-action">
        <Link to={`/topics/${topic}`} className="btn btn-primary btn-sm">
          <span>{config.actionText}</span>
          <ArrowRight size={15} />
        </Link>
        <Link to={`/quizzes/${topic}`} className="btn btn-outline btn-sm">
          <span>Take Quiz</span>
        </Link>
      </div>
    </div>
  );
};
