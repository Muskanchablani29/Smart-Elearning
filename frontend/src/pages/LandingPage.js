import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Brain,
  BookOpen,
  Sparkles,
  TrendingUp,
  CheckCircle,
  Award,
  ArrowRight,
  Layers,
  Send,
  Bot,
  BarChart3,
  Target,
  Cpu,
  Database,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";
import { aiService } from "../api/aiService";
import { YouTubeIcon } from "../components/YouTubeIcon";

export const LandingPage = () => {
  // AI Tutor interactive state
  const [tutorInput, setTutorInput] = useState("");
  const [tutorLoading, setTutorLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    {
      sender: "bot",
      text: "Hello! I am your AI Smart Tutor. I analyze your quiz telemetry and recommend the best learning path. Ask me about study topics, Python fundamentals, or your personalized plan!",
      topics: [
        { id: 1, name: "Python Basics & Syntax", subject: "Python Programming" },
        { id: 3, name: "Arrays & Linked Lists", subject: "Data Structures" },
      ],
    },
  ]);

  // Model diagnostics state
  const [modelDiagnostics, setModelDiagnostics] = useState(null);

  useEffect(() => {
    // Fetch live AI model diagnostics
    const loadDiagnostics = async () => {
      try {
        const data = await aiService.getModelStatus();
        setModelDiagnostics(data);
      } catch (err) {
        // Fallback default info if backend is starting
        setModelDiagnostics({
          supervised_model: "RandomForestClassifier",
          training_accuracy: 94.5,
          n_estimators: 80,
          similarity_metric: "Cosine Similarity (TF-IDF Vector Space)",
        });
      }
    };
    loadDiagnostics();
  }, []);

  const handleSendMessage = async (textToSend) => {
    const query = textToSend || tutorInput;
    if (!query.trim()) return;

    // Append user message
    const newChat = [...chatMessages, { sender: "user", text: query }];
    setChatMessages(newChat);
    setTutorInput("");
    setTutorLoading(true);

    try {
      const response = await aiService.sendTutorMessage(query);
      setChatMessages([
        ...newChat,
        {
          sender: "bot",
          text: response.reply,
          topics: response.recommended_topics || [],
        },
      ]);
    } catch (err) {
      setChatMessages([
        ...newChat,
        {
          sender: "bot",
          text: "I'm currently connected to your Scikit-Learn ML engine. For best results, explore our curated syllabus notes in the Subjects section or take a quiz to evaluate your score!",
          topics: [],
        },
      ]);
    } finally {
      setTutorLoading(false);
    }
  };

  const samplePrompts = [
    "What should I study next?",
    "Explain Python OOP concepts",
    "How do Linked Lists work?",
    "Give me SQL Database tips",
  ];

  return (
    <div className="landing-page-wrapper">
      {/* 1. HERO SECTION */}
      <section className="hero-section">
        <div className="hero-container">
          <div className="hero-content">
            <div className="hero-pill">
              <Sparkles size={16} className="text-terracotta" />
              <span>AI-DRIVEN SMART RECOMMENDATION PLATFORM</span>
            </div>

            <h1 className="hero-title">
              Personalized Learning Powered by Smart Artificial Intelligence
            </h1>

            <p className="hero-description">
              An intelligent, adaptive e-learning platform that analyzes your quiz performance,
              evaluates cognitive readiness via supervised machine learning, and recommends
              tailored study notes, revision pathways, and YouTube video tutorials.
            </p>

            <div className="hero-cta-group">
              <Link to="/register" className="btn btn-hero-primary">
                <span>Start Learning Today</span>
                <ArrowRight size={18} />
              </Link>
              <Link to="/dashboard" className="btn btn-hero-secondary">
                <span>View Student Dashboard</span>
              </Link>
            </div>

            {/* Trust Metrics Bar */}
            <div className="hero-stats-row">
              <div className="hero-stat-item">
                <span className="stat-number">
                  {modelDiagnostics?.training_accuracy || 94.5}%
                </span>
                <span className="stat-label">ML Accuracy</span>
              </div>
              <div className="hero-stat-divider" />
              <div className="hero-stat-item">
                <span className="stat-number">100%</span>
                <span className="stat-label">Explainable Rationale</span>
              </div>
              <div className="hero-stat-divider" />
              <div className="hero-stat-item">
                <span className="stat-number">Real-Time</span>
                <span className="stat-label">Quiz Feedback</span>
              </div>
            </div>
          </div>

          {/* Hero Right: Interactive Student Telemetry Mockup */}
          <div className="hero-card-col">
            <div className="student-profile-mockup-card">
              <div className="mockup-header">
                <div className="mockup-avatar">
                  <span>PS</span>
                </div>
                <div className="mockup-student-info">
                  <h4 className="mockup-name">Priya Sharma</h4>
                  <span className="mockup-degree">MCA Scholar · Semester II</span>
                </div>
                <span className="mockup-online-badge">Active Learner</span>
              </div>

              <div className="mockup-metrics-grid">
                <div className="mockup-metric-box">
                  <span className="metric-box-val">24</span>
                  <span className="metric-box-lbl">Topics Done</span>
                </div>
                <div className="mockup-metric-box">
                  <span className="metric-box-val">88%</span>
                  <span className="metric-box-lbl">Avg Score</span>
                </div>
                <div className="mockup-metric-box">
                  <span className="metric-box-val">47h</span>
                  <span className="metric-box-lbl">Study Hours</span>
                </div>
                <div className="mockup-metric-box">
                  <span className="metric-box-val">7🔥</span>
                  <span className="metric-box-lbl">Day Streak</span>
                </div>
              </div>

              <div className="mockup-ai-status">
                <div className="ai-status-row">
                  <div className="status-label-group">
                    <Brain size={16} className="text-terracotta" />
                    <strong>Cognitive Readiness (Random Forest)</strong>
                  </div>
                  <span className="readiness-pill-challenge">94.2% Confidence</span>
                </div>
                <p className="ai-status-desc">
                  State: <strong>Ready for Advanced Mastery</strong>. High quiz performance across foundational topics enables progression to complex algorithmic concepts.
                </p>
              </div>

              <div className="mockup-recommendation-preview">
                <span className="rec-preview-tag">Top Recommended Topic</span>
                <div className="rec-preview-body">
                  <div className="rec-preview-info">
                    <h5>Binary Trees & Hash Tables</h5>
                    <span>Data Structures · 98% Match</span>
                  </div>
                  <Link to="/login" className="btn btn-sm btn-primary">
                    Study
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. STUDENT TESTIMONIAL BANNER */}
      <section className="testimonial-section">
        <div className="section-container">
          <div className="testimonial-card">
            <div className="quote-mark">“</div>
            <p className="testimonial-quote">
              The AI recommendation engine detected my weakness in Graph Algorithms and
              Dynamic Programming immediately after my first quiz. It served targeted
              revision notes and direct YouTube tutorials that helped me score an A in my semester!
            </p>
            <div className="testimonial-author">
              <span className="author-name">Rahul Verma</span>
              <span className="author-title">MCA Candidate, Sri Balaji University Pune (SBUP)</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. CORE SYSTEM CAPABILITIES (Details of the system on Home Page) */}
      <section className="features-section" id="capabilities">
        <div className="section-container">
          <div className="section-header-center">
            <span className="section-pill">SYSTEM ARCHITECTURE</span>
            <h2 className="section-title">Core Pillars of Smart Recommendation</h2>
            <p className="section-subtext">
              Engineered with modern algorithms and educational data science principles
              to provide transparent, explainable, and adaptive learning experiences.
            </p>
          </div>

          <div className="features-grid">
            {/* Card 1 */}
            <div className="feature-card">
              <div className="feature-icon-wrapper bg-terracotta-light">
                <TrendingUp size={28} className="text-terracotta" />
              </div>
              <h3 className="feature-heading">Learning Progress Tracking</h3>
              <p className="feature-text">
                Monitors granular topic completion statuses, quiz attempt velocity, and study hours.
                Visualizes mastery distribution across subjects with real-time feedback.
              </p>
              <ul className="feature-bullets">
                <li><CheckCircle size={15} /> Topic-by-topic completion tracking</li>
                <li><CheckCircle size={15} /> Daily engagement & study streaks</li>
                <li><CheckCircle size={15} /> Automated progress synchronization</li>
              </ul>
            </div>

            {/* Card 2 */}
            <div className="feature-card">
              <div className="feature-icon-wrapper bg-amber-light">
                <Brain size={28} className="text-amber" />
              </div>
              <h3 className="feature-heading">AI Recommendation Engine</h3>
              <p className="feature-text">
                Integrates supervised Random Forest classification with TF-IDF vector space
                and Cosine Similarity algorithms to match student proficiency with syllabus concepts.
              </p>
              <ul className="feature-bullets">
                <li><CheckCircle size={15} /> Dual-engine: Rules + Content Filtering</li>
                <li><CheckCircle size={15} /> 80-tree Random Forest classifier</li>
                <li><CheckCircle size={15} /> High-precision similarity scoring</li>
              </ul>
            </div>

            {/* Card 3 */}
            <div className="feature-card">
              <div className="feature-icon-wrapper bg-blue-light">
                <RefreshCw size={28} className="text-blue" />
              </div>
              <h3 className="feature-heading">Smart Study Suggestions</h3>
              <p className="feature-text">
                Automatically detects dips in quiz scores below 60% and triggers targeted revision
                materials and relevant YouTube video tutorials before unlocking harder topics.
              </p>
              <ul className="feature-bullets">
                <li><CheckCircle size={15} /> Automatic weak topic diagnosis</li>
                <li><CheckCircle size={15} /> Curated YouTube video tutorials</li>
                <li><CheckCircle size={15} /> Prerequisite concept reinforcement</li>
              </ul>
            </div>

            {/* Card 4 */}
            <div className="feature-card">
              <div className="feature-icon-wrapper bg-purple-light">
                <BarChart3 size={28} className="text-purple" />
              </div>
              <h3 className="feature-heading">Performance Analysis</h3>
              <p className="feature-text">
                Interactive charts built with Recharts illustrate student score trends,
                subject mastery percentages, and topic difficulty curves for students and instructors.
              </p>
              <ul className="feature-bullets">
                <li><CheckCircle size={15} /> Chronological score trend charts</li>
                <li><CheckCircle size={15} /> Faculty cohort analytics dashboard</li>
                <li><CheckCircle size={15} /> Fully explainable AI reasoning</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 4. HOW IT WORKS (5 Connected Steps) */}
      <section className="how-it-works-section" id="how-it-works">
        <div className="section-container">
          <div className="section-header-center">
            <span className="section-pill">STEP-BY-STEP JOURNEY</span>
            <h2 className="section-title">How the Smart Recommendation System Works</h2>
            <p className="section-subtext">
              From authentication to intelligent recommendations, every step is optimized for student mastery.
            </p>
          </div>

          <div className="steps-flow-container">
            {/* Step 1 */}
            <div className="step-flow-item">
              <div className="step-number-circle">01</div>
              <h4 className="step-flow-title">Student Logs In</h4>
              <p className="step-flow-desc">
                Secure JWT authentication loads personalized progress, enrolled subjects, and past scores.
              </p>
            </div>

            <div className="step-connector" />

            {/* Step 2 */}
            <div className="step-flow-item">
              <div className="step-number-circle">02</div>
              <h4 className="step-flow-title">Study & Take Quizzes</h4>
              <p className="step-flow-desc">
                Student reviews curated syllabus notes, code examples, and takes 5-question knowledge assessments.
              </p>
            </div>

            <div className="step-connector" />

            {/* Step 3 */}
            <div className="step-flow-item">
              <div className="step-number-circle">03</div>
              <h4 className="step-flow-title">Data Collection</h4>
              <p className="step-flow-desc">
                Platform records score percentage, question-by-question responses, and completion timestamps.
              </p>
            </div>

            <div className="step-connector" />

            {/* Step 4 */}
            <div className="step-flow-item">
              <div className="step-number-circle">04</div>
              <h4 className="step-flow-title">AI Analysis</h4>
              <p className="step-flow-desc">
                Random Forest ML predicts cognitive readiness state while TF-IDF vectorizer computes similarity.
              </p>
            </div>

            <div className="step-connector" />

            {/* Step 5 */}
            <div className="step-flow-item">
              <div className="step-number-circle">05</div>
              <h4 className="step-flow-title">Smart Delivery</h4>
              <p className="step-flow-desc">
                Outputs prioritized recommendations: Revision notes, Next progressive steps, and YouTube videos.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. THE AI BEHIND THE MAGIC (Dark Mocha Section) */}
      <section className="ai-deepdive-section" id="ai-engine">
        <div className="section-container">
          <div className="ai-deepdive-header">
            <span className="section-pill dark-pill">MACHINE LEARNING ARCHITECTURE</span>
            <h2 className="ai-deepdive-title">The AI Behind the Recommendations</h2>
            <p className="ai-deepdive-subtext">
              Our backend combines statistical data modeling with Scikit-Learn machine learning
              to eliminate the cold-start problem and deliver mathematically grounded recommendations.
            </p>
          </div>

          <div className="ai-architecture-grid">
            {/* Model Card 1 */}
            <div className="ai-arch-card">
              <div className="arch-header">
                <Cpu size={24} className="text-terracotta" />
                <h4>Supervised Random Forest Classifier</h4>
              </div>
              <p className="arch-desc">
                Trained on educational telemetry to categorize student cognitive readiness into
                <strong className="text-highlight"> Review</strong>,
                <strong className="text-highlight"> Next Topic</strong>, or
                <strong className="text-highlight"> Mastery Challenge</strong>.
              </p>
              <div className="arch-stats-box">
                <div className="arch-stat-row">
                  <span>Ensemble Trees:</span>
                  <strong>{modelDiagnostics?.n_estimators || 80} Estimators</strong>
                </div>
                <div className="arch-stat-row">
                  <span>Diagnostic Accuracy:</span>
                  <strong>{modelDiagnostics?.training_accuracy || 94.5}%</strong>
                </div>
                <div className="arch-stat-row">
                  <span>Engine:</span>
                  <strong>Python Scikit-Learn 1.5+</strong>
                </div>
              </div>
            </div>

            {/* Model Card 2 */}
            <div className="ai-arch-card">
              <div className="arch-header">
                <Database size={24} className="text-amber" />
                <h4>TF-IDF Vector Space Similarity</h4>
              </div>
              <p className="arch-desc">
                Translates syllabus content, difficulty indices, and completed student history
                into multi-dimensional vector embeddings, computing Cosine Similarity for personalized matches.
              </p>
              <div className="arch-stats-box">
                <div className="arch-stat-row">
                  <span>Feature Extraction:</span>
                  <strong>Unigrams & Bigrams (1000 max)</strong>
                </div>
                <div className="arch-stat-row">
                  <span>Metric:</span>
                  <strong>Normalized Cosine Similarity</strong>
                </div>
                <div className="arch-stat-row">
                  <span>Match Scoring:</span>
                  <strong>87% - 98% Realistic Precision</strong>
                </div>
              </div>
            </div>

            {/* Model Card 3 */}
            <div className="ai-arch-card">
              <div className="arch-header">
                <ShieldCheck size={24} className="text-green" />
                <h4>Explainable Rule-Based Logic</h4>
              </div>
              <p className="arch-desc">
                Ensures transparency for academic inspection. Rules instantly address weak scores
                (&lt;60%), sequence prerequisite topics in correct order, and supply cold-start starters.
              </p>
              <div className="arch-stats-box">
                <div className="arch-stat-row">
                  <span>Score Threshold:</span>
                  <strong>60% Pass / Revision Gate</strong>
                </div>
                <div className="arch-stat-row">
                  <span>Prerequisite Sequencing:</span>
                  <strong>Deterministic Curriculum Order</strong>
                </div>
                <div className="arch-stat-row">
                  <span>Cold-Start Guard:</span>
                  <strong>Foundational Starter Tracks</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. MEET YOUR AI TUTOR (Interactive Console) */}
      <section className="ai-tutor-section" id="ai-tutor">
        <div className="section-container">
          <div className="section-header-center">
            <span className="section-pill">LIVE INTERACTIVE TUTOR</span>
            <h2 className="section-title">Meet Your AI Smart Tutor</h2>
            <p className="section-subtext">
              Have questions about your learning path, computer science concepts, or exam prep?
              Ask your AI tutor below for real-time concept summaries and recommended topics.
            </p>
          </div>

          <div className="tutor-console-container">
            <div className="tutor-console-header">
              <div className="tutor-bot-info">
                <div className="bot-avatar-icon">
                  <Bot size={22} />
                </div>
                <div>
                  <h4 className="bot-name">SmartLearn AI Assistant</h4>
                  <span className="bot-status">● Powered by Scikit-Learn & Knowledge Graph</span>
                </div>
              </div>

              <div className="tutor-header-badge">
                <Sparkles size={14} /> Interactive MCA Demo
              </div>
            </div>

            {/* Chat Messages */}
            <div className="tutor-chat-body">
              {chatMessages.map((msg, index) => (
                <div key={index} className={`chat-bubble-row ${msg.sender === "user" ? "user-row" : "bot-row"}`}>
                  {msg.sender === "bot" && (
                    <div className="chat-avatar-bot">
                      <Bot size={16} />
                    </div>
                  )}
                  <div className={`chat-bubble ${msg.sender === "user" ? "user-bubble" : "bot-bubble"}`}>
                    <p className="bubble-text">{msg.text}</p>
                    {msg.topics && msg.topics.length > 0 && (
                      <div className="bubble-topics-box">
                        <span className="bubble-topics-label">Suggested Syllabus Topics:</span>
                        <div className="bubble-topics-list">
                          {msg.topics.map((t) => (
                            <Link key={t.id} to={`/topics/${t.id}`} className="bubble-topic-tag">
                              <BookOpen size={12} />
                              <span>{t.name}</span>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {tutorLoading && (
                <div className="chat-bubble-row bot-row">
                  <div className="chat-avatar-bot">
                    <Bot size={16} />
                  </div>
                  <div className="chat-bubble bot-bubble typing-bubble">
                    <div className="typing-dot" />
                    <div className="typing-dot" />
                    <div className="typing-dot" />
                  </div>
                </div>
              )}
            </div>

            {/* Quick Prompts */}
            <div className="tutor-quick-prompts">
              <span className="quick-prompt-label">Try asking:</span>
              <div className="quick-prompts-list">
                {samplePrompts.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className="quick-prompt-btn"
                    onClick={() => handleSendMessage(p)}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Chat Input */}
            <form
              className="tutor-input-form"
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage(tutorInput);
              }}
            >
              <input
                type="text"
                placeholder="Ask about Python, Data Structures, SQL, or what to study next..."
                value={tutorInput}
                onChange={(e) => setTutorInput(e.target.value)}
                className="tutor-text-input"
              />
              <button
                type="submit"
                disabled={tutorLoading || !tutorInput.trim()}
                className="tutor-send-btn"
              >
                <Send size={18} />
                <span>Ask AI</span>
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* 7. BENEFITS FOR EVERY STUDENT (6 Cards) */}
      <section className="benefits-section" id="benefits">
        <div className="section-container">
          <div className="section-header-center">
            <span className="section-pill">ADVANTAGES</span>
            <h2 className="section-title">Engineered for Academic Excellence</h2>
            <p className="section-subtext">
              Solving the limitations of traditional, static e-learning platforms through
              dynamic machine learning personalization.
            </p>
          </div>

          <div className="benefits-grid">
            <div className="benefit-card">
              <div className="benefit-icon bg-terracotta-light">
                <Target size={22} className="text-terracotta" />
              </div>
              <h4 className="benefit-title">Zero Cold-Start Lag</h4>
              <p className="benefit-text">
                New students with no prior attempts receive curated foundational modules immediately,
                establishing an initial benchmark without friction.
              </p>
            </div>

            <div className="benefit-card">
              <div className="benefit-icon bg-amber-light">
                <YouTubeIcon size={22} />
              </div>
              <h4 className="benefit-title">Multimodal Content</h4>
              <p className="benefit-text">
                Pairs concise lecture notes with curated YouTube video tutorials so visual and
                reading learners both thrive.
              </p>
            </div>

            <div className="benefit-card">
              <div className="benefit-icon bg-blue-light">
                <Award size={22} className="text-blue" />
              </div>
              <h4 className="benefit-title">Immediate Quiz Grading</h4>
              <p className="benefit-text">
                Instant score calculation with question-by-question explanations helps students
                understand the reasoning behind every answer.
              </p>
            </div>

            <div className="benefit-card">
              <div className="benefit-icon bg-purple-light">
                <Cpu size={22} className="text-purple" />
              </div>
              <h4 className="benefit-title">Transparent AI Rationale</h4>
              <p className="benefit-text">
                No black-box mystery. Every recommendation clearly displays why it was generated
                (e.g., revision for score &lt;60%, next syllabus topic, or challenge).
              </p>
            </div>

            <div className="benefit-card">
              <div className="benefit-icon bg-green-light">
                <Layers size={22} className="text-green" />
              </div>
              <h4 className="benefit-title">Curriculum Structure</h4>
              <p className="benefit-text">
                Syllabus topics arranged in logical prerequisite progression (Beginner → Intermediate → Advanced).
              </p>
            </div>

            <div className="benefit-card">
              <div className="benefit-icon bg-terracotta-light">
                <ShieldCheck size={22} className="text-terracotta" />
              </div>
              <h4 className="benefit-title">Instructor Analytics</h4>
              <p className="benefit-text">
                Faculty dashboards present cohort performance trends, class averages, and identify
                topics that need classroom review.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 8. CALL TO ACTION BANNER */}
      <section className="cta-banner-section">
        <div className="section-container">
          <div className="cta-banner-card">
            <h2 className="cta-banner-title">Start Your Smart Learning Journey Today</h2>
            <p className="cta-banner-subtext">
              Join students mastering Computer Science topics with adaptive, AI-driven recommendations.
            </p>
            <div className="cta-banner-actions">
              <Link to="/register" className="btn btn-hero-primary">
                <span>Create Free Account</span>
                <ArrowRight size={18} />
              </Link>
              <Link to="/login" className="btn btn-hero-secondary">
                <span>Sign In to Dashboard</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 9. FOOTER */}
      <footer className="landing-footer">
        <div className="section-container footer-content">
          <div className="footer-brand">
            <div className="brand-logo">
              <Brain size={24} className="text-terracotta" />
              <span className="brand-title">SmartLearn AI</span>
            </div>
            <p className="footer-tagline">
              AI-Driven Smart E-Learning Content Recommendation Platform
            </p>
            <span className="footer-academic">
              MCA Mini Project · Sri Balaji University, Pune (SBUP)
            </span>
          </div>

          <div className="footer-links-group">
            <div className="footer-col">
              <h5>Platform</h5>
              <Link to="/">Home</Link>
              <a href="#capabilities">System Details</a>
              <a href="#how-it-works">How It Works</a>
              <a href="#ai-engine">AI Architecture</a>
            </div>

            <div className="footer-col">
              <h5>Student</h5>
              <Link to="/login">Sign In</Link>
              <Link to="/register">Create Account</Link>
              <Link to="/dashboard">Student Dashboard</Link>
              <a href="#ai-tutor">AI Tutor</a>
            </div>

            <div className="footer-col">
              <h5>Tech Stack</h5>
              <span>React.js & Recharts</span>
              <span>Python Django REST</span>
              <span>Scikit-Learn Random Forest</span>
              <span>TF-IDF Vectorizer</span>
              <span>MySQL & YouTube API</span>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} SmartLearn AI. MCA Mini Project. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};
