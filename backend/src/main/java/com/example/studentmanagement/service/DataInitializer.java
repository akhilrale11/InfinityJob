package com.example.studentmanagement.service;

import com.example.studentmanagement.entity.*;
import com.example.studentmanagement.repository.*;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Component
public class DataInitializer {

    private final CourseRepository courseRepository;
    private final AssignmentRepository assignmentRepository;
    private final StudentRepository studentRepository;
    private final AttendanceRecordRepository attendanceRepository;
    private final CourseApplicationRepository applicationRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final UserRepository userRepository;

    public DataInitializer(CourseRepository courseRepository,
                           AssignmentRepository assignmentRepository,
                           StudentRepository studentRepository,
                           AttendanceRecordRepository attendanceRepository,
                           CourseApplicationRepository applicationRepository,
                           EnrollmentRepository enrollmentRepository,
                           UserRepository userRepository) {
        this.courseRepository = courseRepository;
        this.assignmentRepository = assignmentRepository;
        this.studentRepository = studentRepository;
        this.attendanceRepository = attendanceRepository;
        this.applicationRepository = applicationRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.userRepository = userRepository;
    }

    @PostConstruct
    public void seedData() {
        // Seed Courses
        if (courseRepository.count() == 0) {
            Course c1 = new Course(
                    "FS-MERN-101",
                    "Full Stack Web Development (MERN & Java)",
                    "Master React, Node.js, Spring Boot microservices, system design, and deploy high-concurrency cloud applications.",
                    "Anurag Tiwari (Ex-Amazon SDE II)",
                    24,
                    "Intermediate",
                    "React, Java, Spring Boot, Node.js, PostgreSQL, Docker",
                    "🚀",
                    96,
                    4.9,
                    420
            );

            Course c2 = new Course(
                    "DSA-SYS-201",
                    "DSA & System Design Career Bootcamp",
                    "Crack Tier-1 Product Companies (FAANG). In-depth Data Structures, Graph Algorithms, Dynamic Programming, and LLD/HLD.",
                    "Siddharth Verma (Ex-Google Tech Lead)",
                    16,
                    "Advanced",
                    "DSA, Java, C++, LLD, HLD, Redis, Kafka",
                    "⚡",
                    98,
                    4.95,
                    380
            );

            Course c3 = new Course(
                    "DS-AI-301",
                    "Data Science, Machine Learning & GenAI",
                    "End-to-end Machine Learning, Deep Learning, NLP, Large Language Models (LLMs), LangChain, and production ML pipelines.",
                    "Dr. Pooja Nair (Senior AI Scientist)",
                    20,
                    "Intermediate",
                    "Python, PyTorch, Scikit-Learn, GenAI, LangChain, AWS",
                    "🧠",
                    94,
                    4.85,
                    290
            );

            Course c4 = new Course(
                    "CLOUD-DEV-401",
                    "Cloud Engineering & DevOps Mastery",
                    "Become a high-earning DevOps Engineer. Master AWS, Kubernetes, Terraform, CI/CD pipelines, Prometheus, and security.",
                    "Vikram Sethi (Principal Cloud Architect)",
                    14,
                    "Beginner to Advanced",
                    "AWS, Docker, Kubernetes, Terraform, Jenkins, Prometheus",
                    "☁️",
                    95,
                    4.9,
                    210
            );

            courseRepository.saveAll(List.of(c1, c2, c3, c4));
        }

        // Seed Assignments
        if (assignmentRepository.count() == 0) {
            Assignment a1 = new Assignment(
                    "Build a Realtime Collaboration Canvas in React",
                    "Implement a collaborative whiteboarding tool with WebSockets, optimistic UI updates, undo/redo history, and state persistence.",
                    "FS-MERN-101",
                    "Full Stack Web Development (MERN & Java)",
                    "Module 3: Advanced Frontend & WebSockets",
                    LocalDate.now().plusDays(4),
                    100,
                    "Medium",
                    "https://github.com/infinityjob-curriculum/canvas-starter"
            );

            Assignment a2 = new Assignment(
                    "Design & Implement a Rate Limiter Microservice",
                    "Implement a distributed Token Bucket / Sliding Window rate limiter using Spring Boot, Redis, and custom annotations.",
                    "DSA-SYS-201",
                    "DSA & System Design Career Bootcamp",
                    "Module 5: Low Level Design & Microservices",
                    LocalDate.now().plusDays(6),
                    100,
                    "Hard",
                    "https://github.com/infinityjob-curriculum/rate-limiter-starter"
            );

            Assignment a3 = new Assignment(
                    "Fine-tune LLaMA-3 with LoRA on Custom Dataset",
                    "Prepare domain-specific dataset, configure QLoRA with HuggingFace transformers, and benchmark perplexity metrics.",
                    "DS-AI-301",
                    "Data Science, Machine Learning & GenAI",
                    "Module 6: GenAI & LLM Fine-Tuning",
                    LocalDate.now().plusDays(8),
                    100,
                    "Hard",
                    "https://github.com/infinityjob-curriculum/genai-lora-starter"
            );

            Assignment a4 = new Assignment(
                    "Production Kubernetes Deployment with Helm & Ingress",
                    "Write automated Helm charts with horizontal pod autoscaling (HPA), cert-manager SSL, and Prometheus health metrics.",
                    "CLOUD-DEV-401",
                    "Cloud Engineering & DevOps Mastery",
                    "Module 4: Container Orchestration",
                    LocalDate.now().plusDays(5),
                    100,
                    "Medium",
                    "https://github.com/infinityjob-curriculum/k8s-helm-starter"
            );

            assignmentRepository.saveAll(List.of(a1, a2, a3, a4));
        }

        // Seed Students in Student table if empty
        if (studentRepository.count() == 0) {
            studentRepository.save(new Student("Rahul Sharma", "student@infinityjob.in", "Full Stack Web Development (MERN & Java)", 22, true));
            studentRepository.save(new Student("Priya Patel", "priya.patel@gmail.com", "DSA & System Design Career Bootcamp", 23, true));
            studentRepository.save(new Student("Amit Verma", "amit.verma@outlook.com", "Data Science, Machine Learning & GenAI", 24, true));
            studentRepository.save(new Student("Neha Gupta", "neha.gupta@gmail.com", "Cloud Engineering & DevOps Mastery", 21, false));
            studentRepository.save(new Student("Rohan Iyer", "rohan.iyer@gmail.com", "Full Stack Web Development (MERN & Java)", 25, true));
        }

        // Seed Sample Applications
        if (applicationRepository.count() == 0) {
            applicationRepository.save(new CourseApplication(
                    "Kavya Nair",
                    "kavya.nair@example.com",
                    "+919811223344",
                    "Full Stack Web Development (MERN & Java)",
                    "B.Tech CSE (2024)",
                    "2024",
                    "Intermediate",
                    "Seeking 100% placement track with top product startups."
            ));

            applicationRepository.save(new CourseApplication(
                    "Deepak Joshi",
                    "deepak.j@example.com",
                    "+919877665544",
                    "DSA & System Design Career Bootcamp",
                    "MCA Graduate (2023)",
                    "2023",
                    "Intermediate",
                    "Aiming for SDE-2 roles in Tier 1 companies."
            ));
        }

        // Seed Sample Attendance for Rahul (the demo student)
        if (attendanceRepository.count() == 0) {
            Long studentUserId = userRepository.findByUsername("student").map(User::getId).orElse(3L);
            for (int i = 6; i >= 0; i--) {
                LocalDate date = LocalDate.now().minusDays(i);
                attendanceRepository.save(new AttendanceRecord(
                        studentUserId,
                        "student@infinityjob.in",
                        "Rahul Sharma",
                        "Full Stack Web Development (MERN & Java)",
                        date,
                        LocalTime.of(10, 0 + (i * 2)),
                        i == 3 ? "LATE" : "PRESENT",
                        "LIVE_LECTURE",
                        "Attended Live Lecture & Solved In-Class Quizzes"
                ));
            }
        }

        // Seed Sample Enrollments for Rahul
        if (enrollmentRepository.count() == 0) {
            Long studentUserId = userRepository.findByUsername("student").map(User::getId).orElse(3L);
            Course c1 = courseRepository.findByCode("FS-MERN-101").orElse(null);
            if (c1 != null) {
                Enrollment e1 = new Enrollment(
                        studentUserId,
                        "student@infinityjob.in",
                        "Rahul Sharma",
                        c1.getId(),
                        c1.getCode(),
                        c1.getTitle(),
                        68,
                        "ACTIVE"
                );
                e1.setCompletedAssignments(7);
                e1.setTotalAssignments(10);
                enrollmentRepository.save(e1);
            }
        }
    }
}
