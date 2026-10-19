from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient
from .models import (
    LearningMaterial,
    QuizAttempt,
    QuizQuestion,
    QuizResponse,
    Recommendation,
    Subject,
    Topic,
    TopicProgress,
    User,
)
from .recommendation_engine import generate_recommendations_for_student


class SmartLearningPlatformTests(TestCase):
    def setUp(self):
        self.client = APIClient()

        # Users
        self.student = User.objects.create_user(
            username="test_student",
            email="student@test.com",
            password="Password123!",
            role=User.Role.STUDENT,
        )
        self.instructor = User.objects.create_user(
            username="test_instructor",
            email="instructor@test.com",
            password="Password123!",
            role=User.Role.INSTRUCTOR,
        )
        self.admin = User.objects.create_user(
            username="test_admin",
            email="admin@test.com",
            password="Password123!",
            role=User.Role.ADMIN,
            is_staff=True,
        )

        # Subject & Topics
        self.subject = Subject.objects.create(
            name="Data Science",
            slug="data-science",
            description="Data analysis and science",
        )
        self.topic1 = Topic.objects.create(
            subject=self.subject,
            name="Pandas Basics",
            slug="pandas-basics",
            difficulty=Topic.Difficulty.BEGINNER,
            order=1,
        )
        self.topic2 = Topic.objects.create(
            subject=self.subject,
            name="Advanced NumPy",
            slug="advanced-numpy",
            difficulty=Topic.Difficulty.ADVANCED,
            order=2,
        )

        # Learning Material
        self.material1 = LearningMaterial.objects.create(
            topic=self.topic1,
            title="Introduction to DataFrames",
            material_type=LearningMaterial.MaterialType.NOTES,
            content="DataFrames represent tabular 2D data.",
            is_published=True,
            created_by=self.instructor,
        )

        # Quiz Questions for Topic 1
        self.q1 = QuizQuestion.objects.create(
            topic=self.topic1,
            difficulty=Topic.Difficulty.BEGINNER,
            question_text="What is a DataFrame in Pandas?",
            option_a="A 2D labeled data structure",
            option_b="A database server",
            option_c="A browser engine",
            option_d="An operating system",
            correct_option="A",
            explanation="A DataFrame is a 2D labeled data structure with columns of potentially different types.",
            created_by=self.instructor,
        )
        self.q2 = QuizQuestion.objects.create(
            topic=self.topic1,
            difficulty=Topic.Difficulty.BEGINNER,
            question_text="Which function is used to read CSV files in Pandas?",
            option_a="pd.open_csv()",
            option_b="pd.read_csv()",
            option_c="pd.load()",
            option_d="pd.import_csv()",
            correct_option="B",
            explanation="read_csv reads a comma-separated values (csv) file into a DataFrame.",
            created_by=self.instructor,
        )

    # -------------------------------------------------------------
    # 1. AUTHENTICATION & JWT TESTS
    # -------------------------------------------------------------
    def test_user_registration(self):
        payload = {
            "username": "newuser",
            "email": "newuser@test.com",
            "password": "Password123!",
            "password_confirm": "Password123!",
            "first_name": "New",
            "last_name": "User",
            "role": "student",
        }
        response = self.client.post("/api/auth/register/", payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn("tokens", response.data)
        self.assertIn("access", response.data["tokens"])

    def test_jwt_login(self):
        response = self.client.post(
            "/api/auth/token/",
            {"username": "test_student", "password": "Password123!"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)

    # -------------------------------------------------------------
    # 2. CURRICULUM & LEARNING CONTENT TESTS
    # -------------------------------------------------------------
    def test_fetch_curriculum(self):
        self.client.force_authenticate(user=self.student)
        response = self.client.get("/api/subjects/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["name"], "Data Science")
        self.assertEqual(len(response.data[0]["topics"]), 2)

    def test_mark_topic_progress(self):
        self.client.force_authenticate(user=self.student)
        payload = {
            "topic_id": self.topic1.id,
            "status": "completed",
            "percent_complete": 100.0,
        }
        response = self.client.post("/api/progress/mark/", payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["status"], "completed")
        self.assertEqual(float(response.data["percent_complete"]), 100.0)

    # -------------------------------------------------------------
    # 3. QUIZ SYSTEM & AUTOMATED EVALUATION TESTS
    # -------------------------------------------------------------
    def test_quiz_question_masking_for_student(self):
        self.client.force_authenticate(user=self.student)
        response = self.client.get(f"/api/quizzes/topic/{self.topic1.id}/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        questions = response.data["questions"]
        self.assertEqual(len(questions), 2)
        # Verify correct_option and explanation are NOT leaked to the student
        self.assertNotIn("correct_option", questions[0])
        self.assertNotIn("explanation", questions[0])

    def test_quiz_submission_and_scoring(self):
        self.client.force_authenticate(user=self.student)
        payload = {
            "topic_id": self.topic1.id,
            "difficulty": "beginner",
            "answers": {
                str(self.q1.id): "A",  # Correct
                str(self.q2.id): "C",  # Incorrect (correct is B)
            },
        }
        response = self.client.post("/api/quizzes/submit/", payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(float(response.data["score"]), 50.0)
        self.assertEqual(response.data["correct_answers"], 1)
        self.assertEqual(response.data["total_questions"], 2)
        # Responses should include explanation for review
        self.assertEqual(len(response.data["responses"]), 2)
        self.assertTrue(response.data["responses"][0]["is_correct"])

    # -------------------------------------------------------------
    # 4. RECOMMENDATION ENGINE TESTS
    # -------------------------------------------------------------
    def test_cold_start_recommendation_for_new_student(self):
        recs = generate_recommendations_for_student(self.student)
        self.assertTrue(recs.exists())
        first_rec = recs.first()
        self.assertEqual(first_rec.topic, self.topic1)

    def test_weak_topic_review_recommendation_triggered(self):
        # Student scores 50% on topic1
        self.client.force_authenticate(user=self.student)
        self.client.post(
            "/api/quizzes/submit/",
            {
                "topic_id": self.topic1.id,
                "difficulty": "beginner",
                "answers": {str(self.q1.id): "A", str(self.q2.id): "C"},
            },
            format="json",
        )
        recs = Recommendation.objects.filter(student=self.student, is_active=True)
        review_recs = recs.filter(kind=Recommendation.Kind.REVIEW)
        self.assertTrue(review_recs.exists())
        self.assertEqual(review_recs.first().priority, 5)

    def test_mastery_challenge_recommendation_triggered(self):
        # Student scores 100% on topic1
        self.client.force_authenticate(user=self.student)
        self.client.post(
            "/api/quizzes/submit/",
            {
                "topic_id": self.topic1.id,
                "difficulty": "beginner",
                "answers": {str(self.q1.id): "A", str(self.q2.id): "B"},
            },
            format="json",
        )
        recs = Recommendation.objects.filter(student=self.student, is_active=True)
        challenge_recs = recs.filter(kind=Recommendation.Kind.CHALLENGE)
        self.assertTrue(challenge_recs.exists())
        self.assertEqual(challenge_recs.first().topic, self.topic2)

    # -------------------------------------------------------------
    # 5. DASHBOARDS & ANALYTICS TESTS
    # -------------------------------------------------------------
    def test_student_dashboard(self):
        self.client.force_authenticate(user=self.student)
        response = self.client.get("/api/dashboard/student/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("metrics", response.data)
        self.assertIn("recommendations", response.data)
        self.assertIn("subject_progress", response.data)
        self.assertIn("score_trend", response.data)

    def test_instructor_dashboard_permission_and_data(self):
        # Student forbidden from instructor dashboard
        self.client.force_authenticate(user=self.student)
        res_forbidden = self.client.get("/api/dashboard/instructor/")
        self.assertEqual(res_forbidden.status_code, status.HTTP_403_FORBIDDEN)

        # Instructor allowed
        self.client.force_authenticate(user=self.instructor)
        res_inst = self.client.get("/api/dashboard/instructor/")
        self.assertEqual(res_inst.status_code, status.HTTP_200_OK)
        self.assertIn("metrics", res_inst.data)
        self.assertIn("weak_topics", res_inst.data)
        self.assertIn("score_distribution", res_inst.data)

    def test_admin_stats(self):
        self.client.force_authenticate(user=self.admin)
        response = self.client.get("/api/admin/stats/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("total_users", response.data)
        self.assertIn("subjects", response.data)
        self.assertIn("topics", response.data)

    # -------------------------------------------------------------
    # 6. YOUTUBE API & VIDEO RECOMMENDATION TESTS
    # -------------------------------------------------------------
    def test_youtube_recommendations_by_topic(self):
        self.client.force_authenticate(user=self.student)
        response = self.client.get(f"/api/youtube/recommendations/?topic={self.topic1.id}")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("videos", response.data)
        videos = response.data["videos"]
        self.assertTrue(len(videos) > 0)
        first = videos[0]
        self.assertIn("video_id", first)
        self.assertIn("title", first)
        self.assertIn("thumbnail_url", first)
        self.assertIn("embed_url", first)

    def test_youtube_recommendations_by_query(self):
        self.client.force_authenticate(user=self.student)
        response = self.client.get("/api/youtube/recommendations/?query=neural networks")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("videos", response.data)
        self.assertTrue(len(response.data["videos"]) > 0)

    def test_youtube_videos_in_recommendations_serializer(self):
        self.client.force_authenticate(user=self.student)
        response = self.client.get("/api/recommendations/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(len(response.data) > 0)
        first_rec = response.data[0]
        self.assertIn("youtube_videos", first_rec)
        self.assertIsInstance(first_rec["youtube_videos"], list)
        self.assertIn("match_percentage", first_rec)

    # -------------------------------------------------------------
    # 7. REAL AI MODEL & AI TUTOR CHAT TESTS
    # -------------------------------------------------------------
    def test_ai_model_diagnostics_endpoint(self):
        response = self.client.get("/api/ai-model/status/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("model_type", response.data)
        self.assertIn("supervised_model", response.data)
        self.assertIn("training_accuracy", response.data)
        self.assertIn("feature_importances", response.data)
        self.assertEqual(response.data["supervised_model"], "RandomForestClassifier")

    def test_ai_tutor_chat_endpoint(self):
        self.client.force_authenticate(user=self.student)
        payload = {"message": "How do lists and dictionaries work in Python?"}
        response = self.client.post("/api/ai-tutor/chat/", payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("reply", response.data)
        self.assertTrue(len(response.data["reply"]) > 20)
        self.assertIn("recommended_topics", response.data)
        self.assertTrue(response.data["ai_engine_active"])

    def test_student_dashboard_includes_ml_readiness(self):
        self.client.force_authenticate(user=self.student)
        response = self.client.get("/api/dashboard/student/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("ml_readiness", response.data)
        ml = response.data["ml_readiness"]
        self.assertIn("state", ml)
        self.assertIn("confidence", ml)
        self.assertIn("study_hours", response.data["metrics"])
        self.assertIn("day_streak", response.data["metrics"])
        self.assertIn("today_goal", response.data["metrics"])

    # -------------------------------------------------------------
    # 8. NEW FEATURE TESTS: Profile, Courses, AI Quiz, & YouTube Tracking
    # -------------------------------------------------------------
    def test_student_profile_retrieve_and_update(self):
        self.client.force_authenticate(user=self.student)
        get_res = self.client.get("/api/student/profile/")
        self.assertEqual(get_res.status_code, status.HTTP_200_OK)
        self.assertEqual(get_res.data["username"], "test_student")
        self.assertIn("profile", get_res.data)

        # Update profile
        payload = {
            "first_name": "UpdatedName",
            "degree": "MCA",
            "skill_level": "intermediate",
            "student_id": "MCA-2026-999",
            "learning_goals": "Master Distributed Systems & AI",
            "preferred_language": "English",
        }
        patch_res = self.client.patch("/api/student/profile/", payload, format="json")
        self.assertEqual(patch_res.status_code, status.HTTP_200_OK)
        self.assertEqual(patch_res.data["first_name"], "UpdatedName")
        self.assertEqual(patch_res.data["profile"]["degree"], "MCA")
        self.assertEqual(patch_res.data["profile"]["skill_level"], "intermediate")
        self.assertEqual(patch_res.data["profile"]["student_id"], "MCA-2026-999")

    def test_courses_list_endpoint(self):
        from .models import Course
        Course.objects.get_or_create(name="Master of Computer Applications", code="MCA")
        response = self.client.get("/api/courses/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(len(response.data) >= 1)

    def test_ai_quiz_generation_endpoint(self):
        self.client.force_authenticate(user=self.student)
        payload = {
            "topic_id": self.topic1.id,
            "difficulty": "beginner",
            "count": 2,
        }
        response = self.client.post("/api/quizzes/generate/", payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn("questions", response.data)
        self.assertTrue(len(response.data["questions"]) >= 1)
        first_q = response.data["questions"][0]
        self.assertIn("question_text", first_q)
        self.assertIn("option_a", first_q)
        self.assertIn("option_b", first_q)
        self.assertTrue(first_q["is_ai_generated"])

    def test_completed_resource_toggle_endpoint(self):
        self.client.force_authenticate(user=self.student)
        payload = {
            "topic_id": self.topic1.id,
            "resource_id": "test_video_123",
            "title": "Introduction to Machine Learning Video",
            "resource_type": "youtube_video",
        }
        # First toggle: marks completed
        res1 = self.client.post("/api/resources/completed/toggle/", payload, format="json")
        self.assertEqual(res1.status_code, status.HTTP_201_CREATED)
        self.assertTrue(res1.data["completed"])

        # Second toggle: marks incomplete
        res2 = self.client.post("/api/resources/completed/toggle/", payload, format="json")
        self.assertEqual(res2.status_code, status.HTTP_200_OK)
        self.assertFalse(res2.data["completed"])


