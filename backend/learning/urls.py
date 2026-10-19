from django.urls import include, path
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

from .views import (
    AdminStatsView,
    AdminUserViewSet,
    AIModelStatusView,
    AIQuizGenerateView,
    AITutorChatView,
    CompletedResourceViewSet,
    CourseViewSet,
    InstructorDashboardView,
    LearningMaterialViewSet,
    QuizAPIView,
    QuizAttemptDetailView,
    QuizHistoryView,
    QuizQuestionManageViewSet,
    RecommendationViewSet,
    RegisterView,
    StudentDashboardView,
    StudentProfileView,
    SubjectViewSet,
    TopicProgressViewSet,
    TopicViewSet,
    UserProfileView,
    YouTubeRecommendationsView,
)

router = DefaultRouter()
router.register(r"courses", CourseViewSet, basename="course")
router.register(r"subjects", SubjectViewSet, basename="subject")
router.register(r"topics", TopicViewSet, basename="topic")
router.register(r"materials", LearningMaterialViewSet, basename="material")
router.register(r"progress", TopicProgressViewSet, basename="progress")
router.register(r"recommendations", RecommendationViewSet, basename="recommendation")
router.register(r"quizzes/questions", QuizQuestionManageViewSet, basename="quiz-question")
router.register(r"resources/completed", CompletedResourceViewSet, basename="completed-resource")
router.register(r"admin/users", AdminUserViewSet, basename="admin-user")

urlpatterns = [
    # Authentication & Student Profile
    path("auth/register/", RegisterView.as_view(), name="auth-register"),
    path("auth/profile/", UserProfileView.as_view(), name="auth-profile"),
    path("auth/token/", TokenObtainPairView.as_view(), name="token-obtain-pair"),
    path("auth/token/refresh/", TokenRefreshView.as_view(), name="token-refresh"),
    path("student/profile/", StudentProfileView.as_view(), name="student-profile"),

    # Quizzes
    path("quizzes/topic/<int:topic_id>/", QuizAPIView.as_view(), name="quiz-questions"),
    path("quizzes/generate/", AIQuizGenerateView.as_view(), name="quiz-generate"),
    path("topics/<int:topic_id>/generate-quiz/", AIQuizGenerateView.as_view(), name="topic-quiz-generate"),
    path("quizzes/submit/", QuizAPIView.as_view(), name="quiz-submit"),
    path("quizzes/history/", QuizHistoryView.as_view(), name="quiz-history"),
    path("quizzes/attempts/<int:pk>/", QuizAttemptDetailView.as_view(), name="quiz-attempt-detail"),

    # Dashboards & Recommendations
    path("dashboard/student/", StudentDashboardView.as_view(), name="dashboard-student"),
    path("dashboard/instructor/", InstructorDashboardView.as_view(), name="dashboard-instructor"),
    path("admin/stats/", AdminStatsView.as_view(), name="admin-stats"),
    path("youtube/recommendations/", YouTubeRecommendationsView.as_view(), name="youtube-recommendations"),
    path("ai-model/status/", AIModelStatusView.as_view(), name="ai-model-status"),
    path("ai-tutor/chat/", AITutorChatView.as_view(), name="ai-tutor-chat"),

    # Router endpoints
    path("", include(router.urls)),
]

