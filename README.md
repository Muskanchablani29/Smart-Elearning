# AI-Driven Smart E-Learning Content Recommendation Platform (MCA Mini Project)

An intelligent, full-stack adaptive e-learning web platform that personalizes student learning paths using hybrid rule-based decision logic and content-based filtering. The system continuously evaluates student quiz performance, detects knowledge gaps, and dynamically serves tailored recommendations, interactive assessments, and cohort analytics.

---

## 🛠️ Technology Stack

- **Frontend**: React.js (v19), React Router (v7), Recharts (data visualizations), Lucide Icons, Modern CSS3 Architecture
- **Backend**: Python 3.10+, Django 5.2, Django REST Framework (DRF)
- **Database**: MySQL (configured with UTF8mb4 charset)
- **Authentication**: JWT (JSON Web Tokens via `djangorestframework-simplejwt`)
- **Recommendation Engine**: Explainable rule-based logic + content-based metadata filtering + cold-start fallback
- **Automated Testing**: Django TestCase & REST Framework APIClient

---

## 🚀 Key Functional Modules

### 1. Authentication & Role-Based Access Control (RBAC)
- Student, Instructor, and Administrator roles.
- Secure registration and login issuing access and refresh JWT tokens.
- Protected client-side routes and backend permission classes (`IsStudent`, `IsInstructor`, `IsAdminUserRole`, `IsInstructorOrReadOnly`).
- Pre-configured demo accounts for fast assessment.

### 2. Curriculum & Learning Content Delivery
- Structured taxonomy: **Subjects &rarr; Topics &rarr; Learning Materials**.
- Topics tagged with difficulty levels: `Beginner`, `Intermediate`, `Advanced`.
- Rich study notes reader, video lectures, and external curated resources.
- Interactive progress tracker allowing students to track completion percentages and timestamps.

### 3. Automated Quiz & Assessment System
- Multiple-choice questions categorized by topic and difficulty.
- Anti-cheating client serializer: answer keys and explanations are masked during quiz attempts.
- Instant automated scoring calculation with attempt history logging and question-level responses.
- In-depth post-submission review displaying student choice, correct answers, and conceptual explanations.

### 4. Explainable AI Recommendation Engine
- **Weak Topic Revision (Review - Priority 5)**: Flags topics where quiz score or average is below 60%. Prioritizes review notes and video material.
- **Next Topic Progression (Priority 4)**: For topics with scores &ge; 70% or marked completed, automatically schedules consecutive curriculum topics.
- **Mastery Challenge (Priority 3)**: For scores &ge; 85% in foundational subjects, surfaces advanced topics and challenging concepts.
- **Content-Based Filtering**: Matches students' active subjects and difficulty preferences with unattempted curriculum topics.
- **Cold-Start Handling**: Provides foundational starter topics to newly registered students with zero previous attempts.
- **Real-Time Dynamic Synchronization**: Re-runs engine immediately upon quiz submission or progress update.

### 5. YouTube API Video Recommendations
- **Real-Time YouTube Data API v3 Search**: Connects with YouTube Data API using `YOUTUBE_API_KEY` to search for verified video tutorials matching topics, weak points, or student search queries.
- **Graceful Fallback & Curated Educational Catalog**: When API key is not yet set or daily YouTube quota is exceeded, automatically serves high-quality curated educational lectures (freeCodeCamp, StatQuest, 3Blue1Brown, Corey Schafer, PedroTech, Traversy Media).
- **In-App Video Player**: Watch recommended lessons directly inside an embedded modal or launch on YouTube.
- **Embedded in Recommendations & Topics**: Attached to individual AI recommendation cards and accessible as dedicated video lecture carousels on Topic pages and the Recommendations tab.

### 6. Role-Specific Dashboards
- **Student Dashboard**: KPI cards, Subject Progress bar chart, Quiz Score trend line chart (Recharts), active AI recommendation cards, and recent attempt logs.
- **Instructor Dashboard**: Cohort analytics, average score across cohort, score distribution bar chart, completion rates, knowledge gap detector (weak topics in cohort), and modals to publish new learning materials and questions.
- **Admin Control Panel**: System inventory (users, subjects, topics, questions, attempts) and user management table with role promotion/demotion.

---

## 🔑 Pre-Seeded Demo Accounts

All demo accounts share the password: `Password123!`

| Role | Username | Password | Purpose |
|---|---|---|---|
| **Student** | `student1` | `Password123!` | Has completed topics, weak topic (33.3% on Linear Regression), and active AI recommendations. |
| **Instructor** | `instructor1` | `Password123!` | Accesses cohort analytics, score distributions, and content publishing tools. |
| **Administrator** | `admin` | `Password123!` | Accesses system stats, user role management, and curriculum controls. |

*Quick-login buttons are also available directly on the login page.*

---

## 💻 Setup & Execution Guide

### 1. Backend Setup (Django + MySQL)

1. Open PowerShell and navigate to the backend directory:
   ```powershell
   cd backend
   ```
2. Activate the virtual environment:
   ```powershell
   .\.venv\Scripts\Activate.ps1
   ```
3. Ensure MySQL is running on `127.0.0.1:3306` and credentials in `backend/.env` match your local MySQL configuration:
   ```env
   DJANGO_SECRET_KEY=<your_generated_secret_key>
   DJANGO_DEBUG=True
   DJANGO_ALLOWED_HOSTS=127.0.0.1,localhost,testserver

   MYSQL_DATABASE=smart_learning
   MYSQL_USER=root
   MYSQL_PASSWORD=<your_mysql_password>
   MYSQL_HOST=127.0.0.1
   MYSQL_PORT=3306

   CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
   ```
4. Run migrations and seed data:
   ```powershell
   python manage.py makemigrations learning
   python manage.py migrate
   python manage.py seed_data
   ```
5. Run automated tests to verify API integrity:
   ```powershell
   python manage.py test learning
   ```
6. Start the Django development server:
   ```powershell
   python manage.py runserver
   ```
   *Backend API runs at: `http://127.0.0.1:8000/`*
   *Django Admin is available at: `http://127.0.0.1:8000/admin/`*

---

### 2. Frontend Setup (React.js)

1. Open a second PowerShell terminal and navigate to the frontend directory:
   ```powershell
   cd frontend
   ```
2. Start the React development server:
   ```powershell
   npm start
   ```
3. Or build for production:
   ```powershell
   npm run build
   ```
   *Frontend application runs at: `http://localhost:3000/`*

---

## 📡 REST API Endpoints Overview

| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/auth/register/` | Register user and receive JWT token pair | Public |
| `POST` | `/api/auth/token/` | Obtain JWT token pair (login) | Public |
| `POST` | `/api/auth/token/refresh/` | Refresh expired access token | Public |
| `GET` | `/api/auth/profile/` | Fetch authenticated user profile | Authenticated |
| `GET` | `/api/subjects/` | List all active subjects with topics | Authenticated |
| `GET` | `/api/topics/<id>/` | Fetch topic detail with materials and progress | Authenticated |
| `POST` | `/api/progress/mark/` | Update topic status and percentage | Students |
| `GET` | `/api/quizzes/topic/<id>/` | Fetch quiz questions (answer keys masked) | Students |
| `POST` | `/api/quizzes/submit/` | Submit quiz, score attempt, refresh AI recs | Students |
| `GET` | `/api/quizzes/history/` | View past quiz attempts | Students |
| `GET` | `/api/recommendations/` | Retrieve personalized recommendations | Students |
| `POST` | `/api/recommendations/refresh/` | Force re-evaluation of recommendation rules | Students |
| `GET` | `/api/youtube/recommendations/` | Sourced YouTube video tutorials by topic/query | Students |
| `GET` | `/api/dashboard/student/` | Student analytics, charts, and metrics | Students |
| `GET` | `/api/dashboard/instructor/` | Cohort performance analytics and weak topics | Instructors / Admin |
| `POST` | `/api/materials/` | Publish new learning material | Instructors / Admin |
| `POST` | `/api/quizzes/questions/` | Add new quiz question | Instructors / Admin |
| `GET` | `/api/admin/stats/` | System-wide statistics | Admin |
| `GET/PATCH` | `/api/admin/users/` | Manage user roles and permissions | Admin |
#   S m a r t - E l e a r n i n g  
 #   E - l e a r n i n g  
 #   S m a r t - E l e a r n i n g  
 