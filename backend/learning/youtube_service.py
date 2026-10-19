import logging
import os
import requests
from typing import List, Dict

logger = logging.getLogger(__name__)

# Curated High-Quality Educational Videos (Active fallback if API key not set or quota exceeded)
CURATED_EDUCATIONAL_VIDEOS = {
    "intro-machine-learning": [
        {
            "video_id": "ukzFI9rgwfU",
            "title": "Machine Learning for Beginners - Full Course",
            "channel_title": "freeCodeCamp.org",
            "thumbnail_url": "https://img.youtube.com/vi/ukzFI9rgwfU/mqdefault.jpg",
            "video_url": "https://www.youtube.com/watch?v=ukzFI9rgwfU",
            "embed_url": "https://www.youtube.com/embed/ukzFI9rgwfU",
            "description": "Learn the fundamental concepts of Machine Learning, supervised vs unsupervised models, and training workflows.",
            "source": "curated_fallback",
        },
        {
            "video_id": "Gv9_4yMHFhI",
            "title": "StatQuest: Machine Learning Fundamentals",
            "channel_title": "StatQuest with Josh Starmer",
            "thumbnail_url": "https://img.youtube.com/vi/Gv9_4yMHFhI/mqdefault.jpg",
            "video_url": "https://www.youtube.com/watch?v=Gv9_4yMHFhI",
            "embed_url": "https://www.youtube.com/embed/Gv9_4yMHFhI",
            "description": "Visual breakdown of training sets, testing sets, and cross validation clearly explained.",
            "source": "curated_fallback",
        },
    ],
    "linear-regression-gradient-descent": [
        {
            "video_id": "sDv4f4s2SB8",
            "title": "StatQuest: Gradient Descent, Step-by-Step",
            "channel_title": "StatQuest with Josh Starmer",
            "thumbnail_url": "https://img.youtube.com/vi/sDv4f4s2SB8/mqdefault.jpg",
            "video_url": "https://www.youtube.com/watch?v=sDv4f4s2SB8",
            "embed_url": "https://www.youtube.com/embed/sDv4f4s2SB8",
            "description": "Step-by-step visual intuition on how gradient descent calculates derivatives and updates weights to minimize loss.",
            "source": "curated_fallback",
        },
        {
            "video_id": "nk2CQITm_eo",
            "title": "Linear Regression and Least Squares Clearly Explained",
            "channel_title": "StatQuest with Josh Starmer",
            "thumbnail_url": "https://img.youtube.com/vi/nk2CQITm_eo/mqdefault.jpg",
            "video_url": "https://www.youtube.com/watch?v=nk2CQITm_eo",
            "embed_url": "https://www.youtube.com/embed/nk2CQITm_eo",
            "description": "How ordinary least squares calculates the line of best fit and handles residuals.",
            "source": "curated_fallback",
        },
    ],
    "neural-networks-deep-learning": [
        {
            "video_id": "aircAruvnKk",
            "title": "But what is a neural network? | Deep learning, chapter 1",
            "channel_title": "3Blue1Brown",
            "thumbnail_url": "https://img.youtube.com/vi/aircAruvnKk/mqdefault.jpg",
            "video_url": "https://www.youtube.com/watch?v=aircAruvnKk",
            "embed_url": "https://www.youtube.com/embed/aircAruvnKk",
            "description": "Mathematical intuition behind multi-layer perceptrons, neuron activations, and weight matrices.",
            "source": "curated_fallback",
        },
        {
            "video_id": "IHZwWFHWa-w",
            "title": "Gradient descent, how neural networks learn | Chapter 2",
            "channel_title": "3Blue1Brown",
            "thumbnail_url": "https://img.youtube.com/vi/IHZwWFHWa-w/mqdefault.jpg",
            "video_url": "https://www.youtube.com/watch?v=IHZwWFHWa-w",
            "embed_url": "https://www.youtube.com/embed/IHZwWFHWa-w",
            "description": "How backpropagation and cost functions enable deep neural networks to optimize high-dimensional surfaces.",
            "source": "curated_fallback",
        },
    ],
    "python-collections-syntax": [
        {
            "video_id": "daefaLgNkw0",
            "title": "Python Lists, Tuples, and Sets Tutorial",
            "channel_title": "Corey Schafer",
            "thumbnail_url": "https://img.youtube.com/vi/daefaLgNkw0/mqdefault.jpg",
            "video_url": "https://www.youtube.com/watch?v=daefaLgNkw0",
            "embed_url": "https://www.youtube.com/embed/daefaLgNkw0",
            "description": "Detailed walkthrough of Python data structures, indexing, slicing, and memory performance.",
            "source": "curated_fallback",
        },
        {
            "video_id": "3cZ_SbgqA54",
            "title": "Python Comprehensions - How they work and why you should use them",
            "channel_title": "Corey Schafer",
            "thumbnail_url": "https://img.youtube.com/vi/3cZ_SbgqA54/mqdefault.jpg",
            "video_url": "https://www.youtube.com/watch?v=3cZ_SbgqA54",
            "embed_url": "https://www.youtube.com/embed/3cZ_SbgqA54",
            "description": "List, dictionary, and generator comprehensions for idiomatic and high-performance Python code.",
            "source": "curated_fallback",
        },
    ],
    "python-oop": [
        {
            "video_id": "ZDa-Z5JzLYM",
            "title": "Python OOP Tutorial 1: Classes and Instances",
            "channel_title": "Corey Schafer",
            "thumbnail_url": "https://img.youtube.com/vi/ZDa-Z5JzLYM/mqdefault.jpg",
            "video_url": "https://www.youtube.com/watch?v=ZDa-Z5JzLYM",
            "embed_url": "https://www.youtube.com/embed/ZDa-Z5JzLYM",
            "description": "Object-Oriented Programming fundamentals: classes, instances, attributes, and constructors.",
            "source": "curated_fallback",
        },
    ],
    "trees-graphs-algorithms": [
        {
            "video_id": "tWVWeAqZ0WU",
            "title": "Graph Algorithms for Technical Interviews",
            "channel_title": "freeCodeCamp.org",
            "thumbnail_url": "https://img.youtube.com/vi/tWVWeAqZ0WU/mqdefault.jpg",
            "video_url": "https://www.youtube.com/watch?v=tWVWeAqZ0WU",
            "embed_url": "https://www.youtube.com/embed/tWVWeAqZ0WU",
            "description": "BFS, DFS, connected components, shortest path, and island counting problems clearly explained.",
            "source": "curated_fallback",
        },
    ],
    "javascript-es6-async": [
        {
            "video_id": "PoRJizFvM7s",
            "title": "Async JS Crash Course - Callbacks, Promises, Async Await",
            "channel_title": "Traversy Media",
            "thumbnail_url": "https://img.youtube.com/vi/PoRJizFvM7s/mqdefault.jpg",
            "video_url": "https://www.youtube.com/watch?v=PoRJizFvM7s",
            "embed_url": "https://www.youtube.com/embed/PoRJizFvM7s",
            "description": "Asynchronous JavaScript, Promises, and modern async/await patterns with fetch API.",
            "source": "curated_fallback",
        },
    ],
    "react-hooks-lifecycle": [
        {
            "video_id": "O6P86uwfdR0",
            "title": "React Hooks Course - All React Hooks Explained",
            "channel_title": "PedroTech",
            "thumbnail_url": "https://img.youtube.com/vi/O6P86uwfdR0/mqdefault.jpg",
            "video_url": "https://www.youtube.com/watch?v=O6P86uwfdR0",
            "embed_url": "https://www.youtube.com/embed/O6P86uwfdR0",
            "description": "useState, useEffect, useContext, useRef, and useMemo explained with practical code examples.",
            "source": "curated_fallback",
        },
    ],
}


def search_youtube_videos(
    query: str,
    max_results: int = 4,
    course: str = "",
    difficulty: str = "",
    language: str = "English",
    topic_name: str = "",
) -> List[Dict]:
    """
    Queries YouTube Data API v3 using server-side YOUTUBE_API_KEY.
    Ranks results based on topic relevance, course relevance, difficulty, and language.
    Falls back gracefully to curated educational catalog if API key is absent,
    network fails, or quota is exceeded.
    """
    api_key = os.getenv("YOUTUBE_API_KEY", "").strip()

    # Build rich educational query
    query_parts = [query]
    if course and course not in query:
        query_parts.append(course)
    if difficulty and difficulty != "beginner":
        query_parts.append(difficulty)
    if language and language.lower() not in ["english", "en"]:
        query_parts.append(f"in {language}")
    query_parts.append("tutorial lecture education")
    search_query = " ".join(query_parts)

    lang_code = "en"
    if language:
        l_lower = language.lower()
        if "hindi" in l_lower:
            lang_code = "hi"
        elif "spanish" in l_lower:
            lang_code = "es"
        elif "french" in l_lower:
            lang_code = "fr"

    if api_key:
        try:
            url = "https://www.googleapis.com/youtube/v3/search"
            params = {
                "part": "snippet",
                "q": search_query,
                "type": "video",
                "videoEmbeddable": "true",
                "maxResults": min(10, max_results * 2),  # Fetch extra to rank
                "relevanceLanguage": lang_code,
                "key": api_key,
            }
            response = requests.get(url, params=params, timeout=6)
            if response.status_code == 200:
                data = response.json()
                items = data.get("items", [])
                candidates = []
                for item in items:
                    v_id = item.get("id", {}).get("videoId")
                    if not v_id:
                        continue
                    snippet = item.get("snippet", {})
                    thumbs = snippet.get("thumbnails", {})
                    thumb_url = (
                        thumbs.get("high", {}).get("url")
                        or thumbs.get("medium", {}).get("url")
                        or thumbs.get("default", {}).get("url")
                        or f"https://img.youtube.com/vi/{v_id}/mqdefault.jpg"
                    )
                    v_title = snippet.get("title", "")
                    v_desc = snippet.get("description", "")
                    ch_title = snippet.get("channelTitle", "")

                    # Compute relevance ranking
                    score = _compute_relevance_score(
                        title=v_title,
                        description=v_desc,
                        topic_name=topic_name or query,
                        course=course,
                        difficulty=difficulty,
                        language=language,
                    )

                    candidates.append({
                        "video_id": v_id,
                        "title": v_title,
                        "channel_title": ch_title,
                        "description": v_desc,
                        "thumbnail_url": thumb_url,
                        "video_url": f"https://www.youtube.com/watch?v={v_id}",
                        "embed_url": f"https://www.youtube.com/embed/{v_id}",
                        "topic_name": topic_name or query,
                        "difficulty": difficulty or "intermediate",
                        "source": "youtube_api_v3",
                        "relevance_score": score,
                    })

                if candidates:
                    candidates.sort(key=lambda x: x["relevance_score"], reverse=True)
                    return candidates[:max_results]
            else:
                logger.warning(
                    f"YouTube API responded with {response.status_code}: {response.text}"
                )
        except Exception as e:
            logger.error(f"Error querying YouTube Data API: {e}")

    # Fallback to curated catalog with ranking
    fallback = get_fallback_videos_for_query(query, max_results)
    for f in fallback:
        f["topic_name"] = topic_name or query
        f["difficulty"] = difficulty or "intermediate"
        f["relevance_score"] = _compute_relevance_score(
            title=f.get("title", ""),
            description=f.get("description", ""),
            topic_name=topic_name or query,
            course=course,
            difficulty=difficulty,
            language=language,
        )
    fallback.sort(key=lambda x: x["relevance_score"], reverse=True)
    return fallback[:max_results]


def _compute_relevance_score(
    title: str,
    description: str,
    topic_name: str,
    course: str,
    difficulty: str,
    language: str,
) -> int:
    """Ranks educational videos based on topic match, course level, and language preference."""
    score = 5
    title_lower = title.lower()
    desc_lower = description.lower()
    topic_words = [w.lower() for w in topic_name.split() if len(w) > 3]

    for word in topic_words:
        if word in title_lower:
            score += 4
        elif word in desc_lower:
            score += 2

    if course and course.lower() in title_lower:
        score += 3

    if difficulty and difficulty.lower() in title_lower:
        score += 2

    if language and language.lower() not in ["english", "en"]:
        if language.lower() in title_lower or language.lower() in desc_lower:
            score += 4

    # Trusted educational channels bonus
    trusted_channels = ["freecodecamp", "statquest", "mit", "stanford", "edureka", "simplilearn", "gate smashers", "cs50", "traversy"]
    if any(ch in title_lower or ch in desc_lower for ch in trusted_channels):
        score += 2

    return score


def get_fallback_videos_for_query(query: str, max_results: int = 4) -> List[Dict]:
    """Finds curated matching videos by keyword search in slugs or titles."""
    query_lower = query.lower()
    matched = []

    # 1. Exact or partial slug match
    for slug, videos in CURATED_EDUCATIONAL_VIDEOS.items():
        if slug in query_lower or any(word in slug for word in query_lower.split() if len(word) > 3):
            matched.extend(videos)

    # 2. General topic matches
    if not matched:
        for videos in CURATED_EDUCATIONAL_VIDEOS.values():
            for v in videos:
                if (
                    query_lower in v["title"].lower()
                    or query_lower in v["description"].lower()
                ):
                    matched.append(v)

    # 3. If still empty, return top introductory videos
    if not matched:
        matched = (
            CURATED_EDUCATIONAL_VIDEOS.get("intro-machine-learning", [])
            + CURATED_EDUCATIONAL_VIDEOS.get("python-collections-syntax", [])
        )

    # Deduplicate by video_id
    seen = set()
    deduped = []
    for v in matched:
        if v["video_id"] not in seen:
            seen.add(v["video_id"])
            deduped.append(dict(v))

    return deduped[:max_results]


def get_youtube_recommendations_for_topic(
    topic,
    max_results: int = 4,
    course: str = "",
    difficulty: str = "",
    language: str = "English",
) -> List[Dict]:
    """Generates personalized, ranked educational YouTube video recommendations for a topic."""
    query = f"{topic.name} {topic.subject.name}"
    return search_youtube_videos(
        query=query,
        max_results=max_results,
        course=course,
        difficulty=difficulty or getattr(topic, "difficulty", "intermediate"),
        language=language,
        topic_name=topic.name,
    )
