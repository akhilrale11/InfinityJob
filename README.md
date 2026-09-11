# ♾️ InfinityJob - EdTech Career Accelerator & Online Courses Platform

Inspired by platforms like AccioJob and Scaler, **InfinityJob** is an online courses & career accelerator platform built with a Java Spring Boot REST backend, H2/MySQL database persistence, and a modern React + Vite frontend.

---

## 🌟 Key Features

### 🎓 1. Student / Candidate Learning Hub
- **Course Catalog & Enrolled Tracks**: Explore industry-aligned tracks (Full Stack Web Dev MERN & Java, DSA & System Design, Data Science & GenAI, Cloud DevOps & Kubernetes) with one-click enrollment & progress tracking.
- **Daily Attendance Punch-In**: Mark daily class/lab presence with 1-click punch-in button, active learning streak counter (🔥), and attendance percentage analytics.
- **Assignment Submissions & Code Reviews**: View course projects, deadlines, submit GitHub/live URLs with implementation remarks, and view faculty grades (0-100) & mentor feedback.
- **Career & Placement Readiness Tracker**: Real-time readiness index computed from attendance, track completion, and assignment scores.
- **Admissions & Track Request Form**: Submit course applications, scholarship requests, or track upgrades directly to the administration.

### 🛡️ 2. Admin & Faculty Management Console
- **Student Master Records**: Full CRUD operations for student candidate records, course filter, search, and 2FA email verification.
- **Admissions & Track Applications**: Review submitted candidate applications with educational background, graduation years, and career goals. Approve or reject with admin notes.
- **Daily Attendance Ledger**: Monitor real-time student check-in logs per day, course, and session type.
- **Assignment Review & Grading Hub**: View submitted candidate GitHub repositories and assign scores with personalized mentor code review notes.
- **Institute Analytics**: Real-time batch stats on enrolled candidates, placement readiness, and track health.

### 🔐 3. Authentication & Security
- Separated **Student Portal** and **Admin Portal** login views.
- 6-Digit 2FA OTP verification via email/SMS with dev-mode preview.
- Forgot password workflow with 6-digit OTP verification.
- Instant 1-click demo login buttons.

---

## 🚀 Quick Start & Launch

### Option A: One-Click Windows Launcher
Double click `start-application.bat` or run in PowerShell:
```powershell
.\start-application.ps1
```

### Option B: Manual Startup
1. **Start Backend**:
   ```bash
   cd backend
   mvn spring-boot:run
   ```
2. **Start Frontend**:
   ```bash
   cd frontend
   npm run dev
   ```
3. Open `http://localhost:5173` in your browser.

---

## 🔑 Demo Credentials

| Role | Username / Email | Password | Portal View |
| :--- | :--- | :--- | :--- |
| **Student** | `student` or `student@infinityjob.in` | `student123` | Student Learning Hub |
| **Admin** | `admin` or `admin@infinityjob.in` | `admin123` | Admin Master Console |
