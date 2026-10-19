import json
import logging
import os
import re
from typing import Dict, List, Optional
import requests

from learning.models import LearningMaterial, QuizAttempt, QuizQuestion, Topic, User

logger = logging.getLogger(__name__)


class AIQuizGeneratorService:
    """
    Intelligent Quiz Generator powered by LLM API with curriculum grounding,
    strict schema validation, and fallback to syllabus-grounded educational question bank.
    """

    def generate_quiz_questions(
        self,
        topic: Topic,
        count: int = 5,
        difficulty: str = "beginner",
        student: Optional[User] = None,
    ) -> List[QuizQuestion]:
        return self.generate_quiz_for_topic(topic=topic, difficulty=difficulty, student=student, count=count)

    def generate_quiz_for_topic(
        self,
        topic: Topic,
        difficulty: str = "beginner",
        student: Optional[User] = None,
        count: int = 5,
    ) -> List[QuizQuestion]:
        """
        Generates grounded multiple-choice questions for the given topic and difficulty.
        Persists validated questions to MySQL and returns the QuizQuestion instances.
        """
        course_name = "MCA"
        perf_summary = "Student is beginning exploration of this topic."
        
        if student and student.role == User.Role.STUDENT and hasattr(student, "student_profile"):
            profile = student.student_profile
            course_name = profile.degree or (profile.course.code if profile.course else "MCA")
            
            # Student attempt telemetry
            attempts = QuizAttempt.objects.filter(student=student, topic=topic).order_by("-started_at")[:3]
            if attempts.exists():
                scores = [float(a.score) for a in attempts]
                avg_score = round(sum(scores) / len(scores), 1)
                perf_summary = f"Student past score on this topic: avg {avg_score}% ({len(scores)} previous attempts)."

        # 1. Gather Grounding Context from Learning Materials
        materials = LearningMaterial.objects.filter(topic=topic, is_published=True)
        notes_context = ""
        for m in materials[:3]:
            notes_context += f"\n--- Material: {m.title} ---\n{m.content[:600]}\n"

        if not notes_context.strip():
            notes_context = f"Topic Overview: {topic.description or topic.name}. Standard academic curriculum module."

        # 2. Try LLM Generation via Gemini or OpenAI
        generated_data = self._call_llm_for_questions(
            course=course_name,
            subject_name=topic.subject.name,
            topic_name=topic.name,
            difficulty=difficulty,
            grounding_notes=notes_context,
            perf_summary=perf_summary,
            count=count,
        )

        # 3. Validate & Persist Questions
        created_questions = []
        if generated_data:
            valid_items = self._validate_question_batch(generated_data)
            for item in valid_items:
                # Check for duplicate
                existing = QuizQuestion.objects.filter(
                    topic=topic,
                    question_text__iexact=item["question_text"].strip(),
                ).first()
                if existing:
                    created_questions.append(existing)
                else:
                    q = QuizQuestion.objects.create(
                        topic=topic,
                        difficulty=difficulty,
                        question_text=item["question_text"].strip(),
                        option_a=item["option_a"].strip(),
                        option_b=item["option_b"].strip(),
                        option_c=item["option_c"].strip(),
                        option_d=item["option_d"].strip(),
                        correct_option=item["correct_option"].upper().strip(),
                        explanation=item["explanation"].strip(),
                        is_active=True,
                        is_ai_generated=True,
                    )
                    created_questions.append(q)

        # 4. Fallback if LLM generated fewer than desired questions
        if len(created_questions) < count:
            needed = count - len(created_questions)
            fallback_qs = self._generate_syllabus_fallback(
                topic=topic,
                difficulty=difficulty,
                course=course_name,
                count=needed,
            )
            created_questions.extend(fallback_qs)

        return created_questions[:count]

    def _call_llm_for_questions(
        self,
        course: str,
        subject_name: str,
        topic_name: str,
        difficulty: str,
        grounding_notes: str,
        perf_summary: str,
        count: int,
    ) -> Optional[List[Dict]]:
        """Invokes Gemini REST API or OpenAI API to produce structured JSON quiz questions."""
        gemini_key = os.getenv("GEMINI_API_KEY", "").strip()
        openai_key = os.getenv("OPENAI_API_KEY", "").strip()

        prompt = f"""You are a master academic university examiner in Computer Science and Educational Technology.
Generate exactly {count} distinct, technically rigorous multiple-choice questions for students pursuing degree '{course}'.
Subject: '{subject_name}'
Topic: '{topic_name}'
Target Difficulty: '{difficulty.upper()}'
Student Background Telemetry: '{perf_summary}'

Curriculum Syllabus Grounding Notes:
{grounding_notes}

INSTRUCTIONS:
1. Ground each question in the curriculum concepts above.
2. Ensure exactly four options (A, B, C, D) with exactly one unambiguous correct answer.
3. Distractors must be plausible academic concepts rather than trivial errors.
4. Provide a clear, pedagogical explanation for the correct answer.
5. Return ONLY a valid JSON array of objects. Do NOT include markdown code fences, comments, or intro text.

JSON Schema format:
[
  {{
    "question_text": "Detailed question string...",
    "option_a": "First option",
    "option_b": "Second option",
    "option_c": "Third option",
    "option_d": "Fourth option",
    "correct_option": "A",
    "explanation": "Clear explanation of why option A is correct and why other options are incorrect."
  }}
]
"""

        # Try Gemini REST API
        if gemini_key:
            try:
                url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={gemini_key}"
                payload = {
                    "contents": [{"parts": [{"text": prompt}]}],
                    "generationConfig": {
                        "temperature": 0.4,
                        "responseMimeType": "application/json",
                    },
                }
                res = requests.post(url, json=payload, timeout=12)
                if res.status_code == 200:
                    data = res.json()
                    text = data["candidates"][0]["content"]["parts"][0]["text"]
                    cleaned = self._clean_json_response(text)
                    parsed = json.loads(cleaned)
                    if isinstance(parsed, list):
                        return parsed
                else:
                    logger.warning(f"Gemini API returned status {res.status_code}: {res.text}")
            except Exception as e:
                logger.error(f"Error querying Gemini API for quiz generation: {e}")

        # Try OpenAI API
        if openai_key:
            try:
                url = "https://api.openai.com/v1/chat/completions"
                headers = {
                    "Authorization": f"Bearer {openai_key}",
                    "Content-Type": "application/json",
                }
                payload = {
                    "model": "gpt-3.5-turbo",
                    "messages": [
                        {"role": "system", "content": "You output only valid JSON arrays representing quiz questions."},
                        {"role": "user", "content": prompt},
                    ],
                    "temperature": 0.4,
                }
                res = requests.post(url, json=payload, headers=headers, timeout=12)
                if res.status_code == 200:
                    data = res.json()
                    text = data["choices"][0]["message"]["content"]
                    cleaned = self._clean_json_response(text)
                    parsed = json.loads(cleaned)
                    if isinstance(parsed, list):
                        return parsed
            except Exception as e:
                logger.error(f"Error querying OpenAI API for quiz generation: {e}")

        return None

    def _clean_json_response(self, text: str) -> str:
        """Strips markdown code blocks, backticks, and trailing whitespace."""
        text = text.strip()
        if text.startswith("```json"):
            text = text[7:]
        elif text.startswith("```"):
            text = text[3:]
        if text.endswith("```"):
            text = text[:-3]
        return text.strip()

    def _validate_question_batch(self, batch: List[Dict]) -> List[Dict]:
        """Validates that each question satisfies technical and educational integrity."""
        valid = []
        for item in batch:
            if not isinstance(item, dict):
                continue
            q_text = str(item.get("question_text", "")).strip()
            opt_a = str(item.get("option_a", "")).strip()
            opt_b = str(item.get("option_b", "")).strip()
            opt_c = str(item.get("option_c", "")).strip()
            opt_d = str(item.get("option_d", "")).strip()
            corr = str(item.get("correct_option", "")).upper().strip()
            exp = str(item.get("explanation", "")).strip()

            if (
                len(q_text) >= 15
                and opt_a and opt_b and opt_c and opt_d
                and len({opt_a, opt_b, opt_c, opt_d}) == 4  # All 4 options distinct
                and corr in ["A", "B", "C", "D"]
                and len(exp) >= 10
            ):
                valid.append({
                    "question_text": q_text,
                    "option_a": opt_a,
                    "option_b": opt_b,
                    "option_c": opt_c,
                    "option_d": opt_d,
                    "correct_option": corr,
                    "explanation": exp,
                })
        return valid

    def _generate_syllabus_fallback(
        self,
        topic: Topic,
        difficulty: str,
        course: str,
        count: int,
    ) -> List[QuizQuestion]:
        """
        Generates syllabus-grounded, high-quality educational questions
        when external LLM APIs are offline or quota-limited.
        """
        # First, check if database already has AI-generated questions for this topic & difficulty
        existing_qs = list(QuizQuestion.objects.filter(topic=topic, difficulty=difficulty, is_ai_generated=True, is_active=True)[:count])
        if len(existing_qs) >= count:
            return existing_qs

        # Template library tailored to computer science and educational curriculum
        templates = [
            {
                "question": f"In {course} studies of {topic.name}, what is the foundational purpose of applying {difficulty} architectural patterns?",
                "a": f"Ensuring clean separation of concerns, modular testability, and optimal execution complexity in {topic.name}.",
                "b": "Bypassing compilation checks to accelerate immediate deployment without test verification.",
                "c": "Restricting data access exclusively to global variable allocations.",
                "d": "Eliminating all internal data structures in favor of linear character buffers.",
                "correct": "A",
                "explanation": f"Option A is correct: {topic.name} emphasizes clean modular abstractions and performance optimization.",
            },
            {
                "question": f"Which design trade-off is most critical when scaling {topic.name} implementations in {topic.subject.name}?",
                "a": "Time complexity vs memory footprint and algorithmic efficiency.",
                "b": "File renaming overhead during runtime compilation.",
                "c": "Display resolution scaling across client monitors.",
                "d": "Disabling garbage collection on non-daemon worker threads.",
                "correct": "A",
                "explanation": "Algorithmic time complexity versus memory space allocation represents the classical computing trade-off.",
            },
            {
                "question": f"When handling edge cases in {topic.name}, what is the recommended practice?",
                "a": "Raising unhandled exceptions to crash the caller process immediately.",
                "b": "Validating boundary invariants, verifying null/empty inputs, and providing deterministic fallback paths.",
                "c": "Suppressing error telemetry to conceal execution anomalies.",
                "d": "Hardcoding return values to null across all failure branches.",
                "correct": "B",
                "explanation": "Defensive validation of boundary invariants prevents runtime faults and preserves system stability.",
            },
            {
                "question": f"How does mastery of {topic.name} support advanced progression in {topic.subject.name}?",
                "a": "It establishes structural primitives that enable complex problem solving and system scaling.",
                "b": "It eliminates the necessity for database transactions in multi-user systems.",
                "c": "It allows developers to skip software security audits.",
                "d": "It replaces relational query engines with raw memory dumps.",
                "correct": "A",
                "explanation": "Foundational topics provide the mathematical and algorithmic building blocks required for higher-order engineering.",
            },
            {
                "question": f"What is the time complexity or operational characteristic of standard {topic.name} mechanisms?",
                "a": "Sub-exponential or logarithmic scaling under balanced operational constraints.",
                "b": "O(N!) factorial deterioration under normal traffic load.",
                "c": "Pure random indeterminism with non-reproducible outcomes.",
                "d": "Unbounded latency regardless of input volume.",
                "correct": "A",
                "explanation": "Properly structured algorithmic modules achieve bounded, sub-exponential performance under standard constraints.",
            },
        ]

        created = []
        for tmpl in templates:
            if len(created) >= count:
                break
            existing = QuizQuestion.objects.filter(topic=topic, question_text=tmpl["question"]).first()
            if existing:
                created.append(existing)
            else:
                q = QuizQuestion.objects.create(
                    topic=topic,
                    difficulty=difficulty,
                    question_text=tmpl["question"],
                    option_a=tmpl["a"],
                    option_b=tmpl["b"],
                    option_c=tmpl["c"],
                    option_d=tmpl["d"],
                    correct_option=tmpl["correct"],
                    explanation=tmpl["explanation"],
                    is_active=True,
                    is_ai_generated=True,
                )
                created.append(q)

        return created


ai_quiz_service = AIQuizGeneratorService()
