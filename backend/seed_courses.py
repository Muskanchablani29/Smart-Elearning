import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from learning.models import Course, Subject, Topic, LearningMaterial, QuizQuestion, StudentProfile, User
from django.utils.text import slugify

def seed_courses_and_subjects():
    print("Seeding flexible courses and curricula...")

    # Define Courses & Subjects Map
    course_catalog = [
        {
            "code": "MCA",
            "name": "Master of Computer Applications (MCA)",
            "description": "Comprehensive postgraduate computer application program covering software engineering, systems, databases, and intelligent computing.",
            "subjects": [
                {
                    "name": "Python Programming",
                    "slug": "python-programming",
                    "description": "Core and advanced Python programming, functional paradigms, OOP, and data pipelines.",
                    "topics": [
                        {"name": "Python Functions & Scopes", "difficulty": "beginner", "order": 1},
                        {"name": "Object-Oriented Programming in Python", "difficulty": "intermediate", "order": 2},
                        {"name": "Generators, Iterators & Decorators", "difficulty": "advanced", "order": 3},
                    ]
                },
                {
                    "name": "Java Programming",
                    "slug": "java-programming",
                    "description": "Enterprise Java, Collections framework, multithreading, and OOP design patterns.",
                    "topics": [
                        {"name": "Java Classes, Interfaces & Polymorphism", "difficulty": "beginner", "order": 1},
                        {"name": "Java Collections Framework & Generics", "difficulty": "intermediate", "order": 2},
                        {"name": "Java Concurrency & Multithreading", "difficulty": "advanced", "order": 3},
                    ]
                },
                {
                    "name": "Database Management Systems (DBMS)",
                    "slug": "database-management-systems",
                    "description": "Relational schemas, SQL queries, indexing, transactions, and normalization.",
                    "topics": [
                        {"name": "Relational Modeling & Normalization", "difficulty": "beginner", "order": 1},
                        {"name": "SQL Joins, Aggregations & Subqueries", "difficulty": "intermediate", "order": 2},
                        {"name": "ACID Properties, Transactions & Indexing", "difficulty": "advanced", "order": 3},
                    ]
                },
                {
                    "name": "Data Structures & Algorithms",
                    "slug": "data-structures-algorithms",
                    "description": "Linear and non-linear data structures, searching, sorting, and asymptotic complexity.",
                    "topics": [
                        {"name": "Arrays, Linked Lists & Stacks", "difficulty": "beginner", "order": 1},
                        {"name": "Binary Search Trees & Heap Structures", "difficulty": "intermediate", "order": 2},
                        {"name": "Graph Traversal & Dynamic Programming", "difficulty": "advanced", "order": 3},
                    ]
                },
                {
                    "name": "Machine Learning & AI",
                    "slug": "machine-learning-ai",
                    "description": "Supervised and unsupervised ML algorithms, model evaluation, and neural networks.",
                    "topics": [
                        {"name": "Supervised Learning & Regression Models", "difficulty": "beginner", "order": 1},
                        {"name": "Classification with Random Forest & SVM", "difficulty": "intermediate", "order": 2},
                        {"name": "Deep Learning & Neural Network Architectures", "difficulty": "advanced", "order": 3},
                    ]
                },
                {
                    "name": "Web Development",
                    "slug": "web-development",
                    "description": "Modern frontend architectures, RESTful APIs, and fullstack applications.",
                    "topics": [
                        {"name": "HTML5, CSS3 & Responsive Design", "difficulty": "beginner", "order": 1},
                        {"name": "React Hooks, State & Component Lifecycle", "difficulty": "intermediate", "order": 2},
                        {"name": "RESTful API Integration & JWT Authentication", "difficulty": "advanced", "order": 3},
                    ]
                },
            ]
        },
        {
            "code": "MSc",
            "name": "Master of Science in Computer Science (MSc CS)",
            "description": "Advanced theoretical and applied computing specialization focusing on big data, distributed systems, and AI research.",
            "subjects": [
                {
                    "name": "Advanced Machine Learning",
                    "slug": "advanced-machine-learning",
                    "description": "Ensemble methods, reinforcement learning, and advanced deep learning paradigms.",
                    "topics": [
                        {"name": "Feature Engineering & Dimensionality Reduction", "difficulty": "beginner", "order": 1},
                        {"name": "Convolutional & Recurrent Neural Networks", "difficulty": "intermediate", "order": 2},
                        {"name": "Reinforcement Learning & Markov Decisions", "difficulty": "advanced", "order": 3},
                    ]
                },
                {
                    "name": "Big Data Analytics",
                    "slug": "big-data-analytics",
                    "description": "Hadoop, Apache Spark, MapReduce, and large-scale data stream processing.",
                    "topics": [
                        {"name": "Distributed Storage & HDFS Architecture", "difficulty": "beginner", "order": 1},
                        {"name": "Apache Spark RDDs & DataFrames", "difficulty": "intermediate", "order": 2},
                        {"name": "Real-time Streaming Analytics & Kafka", "difficulty": "advanced", "order": 3},
                    ]
                },
                {
                    "name": "Cloud Computing & Microservices",
                    "slug": "cloud-computing-microservices",
                    "description": "Virtualization, containerization, cloud service models (IaaS/PaaS/SaaS), and orchestration.",
                    "topics": [
                        {"name": "Cloud Architecture & Virtualization Concepts", "difficulty": "beginner", "order": 1},
                        {"name": "Docker Containerization & Kubernetes Basics", "difficulty": "intermediate", "order": 2},
                        {"name": "Serverless Computing & Cloud Security", "difficulty": "advanced", "order": 3},
                    ]
                },
            ]
        },
        {
            "code": "MA",
            "name": "Master of Arts in Educational Technology (MA EdTech)",
            "description": "Interdisciplinary program examining cognitive learning, digital pedagogy, instructional design, and educational media.",
            "subjects": [
                {
                    "name": "Instructional Design & E-Learning",
                    "slug": "instructional-design-elearning",
                    "description": "ADDIE model, pedagogical frameworks, learning management systems, and curriculum design.",
                    "topics": [
                        {"name": "Instructional Design Models & Principles", "difficulty": "beginner", "order": 1},
                        {"name": "Digital Curriculum Development & Multimedia", "difficulty": "intermediate", "order": 2},
                        {"name": "Formative & Summative Learning Analytics", "difficulty": "advanced", "order": 3},
                    ]
                },
                {
                    "name": "Cognitive Learning Theories",
                    "slug": "cognitive-learning-theories",
                    "description": "Behaviorism, constructivism, cognitive load theory, and personalized learning psychology.",
                    "topics": [
                        {"name": "Foundational Theories: Piaget & Vygotsky", "difficulty": "beginner", "order": 1},
                        {"name": "Cognitive Load Theory & Multimedia Learning", "difficulty": "intermediate", "order": 2},
                        {"name": "Adaptive & Metacognitive Learning Strategies", "difficulty": "advanced", "order": 3},
                    ]
                },
            ]
        }
    ]

    for c_data in course_catalog:
        course, created = Course.objects.get_or_create(
            code=c_data["code"],
            defaults={
                "name": c_data["name"],
                "description": c_data["description"],
                "is_active": True,
            }
        )
        if not created:
            course.name = c_data["name"]
            course.description = c_data["description"]
            course.save()

        print(f"Course: {course.code} - {course.name} ({'Created' if created else 'Updated'})")

        for s_data in c_data["subjects"]:
            subject, s_created = Subject.objects.get_or_create(
                slug=s_data["slug"],
                defaults={
                    "name": s_data["name"],
                    "description": s_data["description"],
                    "is_active": True,
                }
            )
            if not s_created:
                subject.name = s_data["name"]
                subject.description = s_data["description"]
                subject.save()

            course.subjects.add(subject)

            # Seed topics
            for t_data in s_data["topics"]:
                t_slug = slugify(t_data["name"])
                topic, t_created = Topic.objects.get_or_create(
                    subject=subject,
                    slug=t_slug,
                    defaults={
                        "name": t_data["name"],
                        "difficulty": t_data["difficulty"],
                        "order": t_data["order"],
                        "description": f"Curriculum module covering core principles of {t_data['name']}.",
                        "is_active": True,
                    }
                )

                # Seed sample learning material if none
                if not topic.materials.exists():
                    LearningMaterial.objects.create(
                        topic=topic,
                        title=f"{topic.name} Comprehensive Study Guide",
                        description=f"Detailed reference notes and conceptual breakdown for {topic.name}.",
                        material_type=LearningMaterial.MaterialType.NOTES,
                        content=f"## Overview of {topic.name}\n\nThis guide breaks down key concepts, standard practices, architectural considerations, and code examples for {topic.name}. Review this content before attempting practice quizzes.",
                        estimated_minutes=15,
                        is_published=True,
                    )

                # Seed at least 2 baseline quiz questions if none
                if not topic.questions.exists():
                    QuizQuestion.objects.create(
                        topic=topic,
                        difficulty=topic.difficulty,
                        question_text=f"Which of the following best characterizes the primary objective of {topic.name}?",
                        option_a=f"Standardizing structural abstractions and computational efficiency.",
                        option_b=f"Bypassing runtime validation checks completely.",
                        option_c=f"Replacing relational storage with unformatted flat files.",
                        option_d=f"Disabling asynchronous event loops.",
                        correct_option="A",
                        explanation=f"Option A accurately highlights how {topic.name} provides clean architectural abstractions and optimized operational efficiency.",
                        is_active=True,
                        is_ai_generated=False,
                    )
                    QuizQuestion.objects.create(
                        topic=topic,
                        difficulty=topic.difficulty,
                        question_text=f"What is a key best practice when implementing {topic.name}?",
                        option_a="Ignoring boundary edge cases in production.",
                        option_b="Maintaining modular cohesion, clear separation of concerns, and robust error handling.",
                        option_c="Hardcoding global configuration credentials.",
                        option_d="Avoiding code reviews and unit test suites.",
                        correct_option="B",
                        explanation="Option B is the industry standard practice for reliable, maintainable software design.",
                        is_active=True,
                        is_ai_generated=False,
                    )

    # Attach existing students to MCA if profile missing
    mca_course = Course.objects.filter(code="MCA").first()
    students = User.objects.filter(role=User.Role.STUDENT)
    for s in students:
        if not hasattr(s, "student_profile"):
            StudentProfile.objects.create(
                student=s,
                course=mca_course,
                degree=StudentProfile.Degree.MCA,
                previous_education="BCA / BSc Computer Science",
                academic_background="Undergraduate degree in Computer Science with foundations in C, C++, and basic web development.",
                skill_level=StudentProfile.SkillLevel.INTERMEDIATE,
                learning_goals="Master advanced Python, Data Structures, and AI to prepare for senior software development roles.",
                preferred_language="English",
            )
            print(f"Created default StudentProfile for existing student: {s.username}")

    print("Course, Subject, Topic, and StudentProfile seeding completed successfully!")

if __name__ == "__main__":
    seed_courses_and_subjects()
