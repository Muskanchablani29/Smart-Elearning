import React, { useState } from "react";
import { Play, ExternalLink, X, Check } from "lucide-react";
import { YouTubeIcon } from "./YouTubeIcon";
import { learningService } from "../api/learningService";

export const YouTubeVideoCard = ({ video, topicId = null }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [completed, setCompleted] = useState(video.is_completed || false);
  const [toggling, setToggling] = useState(false);

  const handleToggleComplete = async (e) => {
    e.stopPropagation();
    try {
      setToggling(true);
      const res = await learningService.toggleResourceCompleted(
        video.topic_id || topicId || 1,
        video.video_id,
        video.title,
        "youtube_video"
      );
      setCompleted(res.completed);
    } catch (err) {
      console.error(err);
      setCompleted(!completed);
    } finally {
      setToggling(false);
    }
  };

  return (
    <>
      <div className="youtube-video-card">
        <div
          className="yt-thumbnail-wrapper"
          onClick={() => setIsPlaying(true)}
          role="button"
          tabIndex={0}
          title="Click to play video"
        >
          <img
            src={video.thumbnail_url}
            alt={video.title}
            className="yt-thumbnail-img"
            loading="lazy"
          />
          <div className="yt-play-overlay">
            <div className="yt-play-btn">
              <Play size={20} fill="#ffffff" color="#ffffff" />
            </div>
          </div>
          <span className="yt-badge">
            <YouTubeIcon size={14} />
            <span>YouTube</span>
          </span>
        </div>

        <div className="yt-content">
          {(video.topic_name || video.difficulty) && (
            <div style={{ display: "flex", gap: "0.35rem", marginBottom: "0.4rem", flexWrap: "wrap" }}>
              {video.topic_name && (
                <span style={{ fontSize: "0.72rem", background: "rgba(79, 70, 229, 0.08)", color: "#4f46e5", padding: "0.1rem 0.4rem", borderRadius: "4px", fontWeight: 600 }}>
                  {video.topic_name}
                </span>
              )}
              {video.difficulty && (
                <span style={{ fontSize: "0.72rem", background: "var(--color-bg-secondary, #f1f5f9)", color: "var(--color-text-secondary, #64748b)", padding: "0.1rem 0.4rem", borderRadius: "4px", textTransform: "capitalize", fontWeight: 600 }}>
                  {video.difficulty}
                </span>
              )}
            </div>
          )}

          <h4 className="yt-video-title" title={video.title}>
            {video.title}
          </h4>
          <span className="yt-channel-name">{video.channel_title}</span>
          <p className="yt-description">{video.description}</p>

          <div className="yt-actions" style={{ display: "flex", alignItems: "center", gap: "0.4rem", flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={() => setIsPlaying(true)}
              className="btn btn-primary btn-xs"
            >
              <Play size={14} fill="#ffffff" />
              <span>Watch Video</span>
            </button>
            <a
              href={video.video_url}
              target="_blank"
              rel="noreferrer"
              className="btn btn-outline btn-xs"
              title="Open directly on YouTube"
            >
              <span>YouTube</span>
              <ExternalLink size={12} />
            </a>
            <button
              type="button"
              onClick={handleToggleComplete}
              disabled={toggling}
              className={`btn btn-xs ${completed ? "btn-success" : "btn-outline"}`}
              style={{
                borderColor: completed ? "#10b981" : undefined,
                color: completed ? "#065f46" : undefined,
                background: completed ? "rgba(16, 185, 129, 0.15)" : undefined,
                display: "inline-flex",
                alignItems: "center",
                gap: "0.3rem",
              }}
              title={completed ? "Completed! Click to mark incomplete" : "Click to mark as completed"}
            >
              <Check size={12} />
              <span>{completed ? "Completed" : "Mark as Completed"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Video Embed Player Modal */}
      {isPlaying && (
        <div className="modal-overlay" onClick={() => setIsPlaying(false)}>
          <div
            className="modal-content video-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div className="modal-title-wrap">
                <YouTubeIcon size={20} />
                <h3 className="modal-title">{video.title}</h3>
              </div>
              <button
                className="modal-close-btn"
                onClick={() => setIsPlaying(false)}
                title="Close Player"
              >
                <X size={20} />
              </button>
            </div>

            <div className="video-player-container">
              <iframe
                src={`${video.embed_url}?autoplay=1`}
                title={video.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="yt-iframe"
              />
            </div>

            <div className="modal-footer">
              <span className="yt-channel-credit">
                Instructor Channel: <strong>{video.channel_title}</strong>
              </span>
              <a
                href={video.video_url}
                target="_blank"
                rel="noreferrer"
                className="btn btn-outline btn-xs"
              >
                <span>Watch on YouTube.com</span>
                <ExternalLink size={12} />
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
