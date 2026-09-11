import React, { useState, useEffect, useMemo } from "react";
import {
  fetchCourses,
  fetchEnrollments,
  enrollInCourse,
  updateEnrollmentProgress,
  fetchAttendance,
  fetchAttendanceStats,
  markTodayAttendance,
  fetchAssignments,
  fetchSubmissions,
  submitAssignment,
  submitCourseApplication,
  fetchApplications,
} from "./services/portalService";

export default function StudentPortal({ auth, onLogout, showToast }) {
  const [activeTab, setActiveTab] = useState("overview"); // overview, courses, attendance, assignments, apply
  const [loading, setLoading] = useState(true);

  // Data states
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [attendanceStats, setAttendanceStats] = useState({
    percentage: 92,
    streakDays: 6,
    presentDays: 14,
    absentDays: 1,
    totalDays: 15,
  });
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [myApplications, setMyApplications] = useState([]);

  // Modals & Action States
  const [markingAttendance, setMarkingAttendance] = useState(false);
  const [selectedCourseForDetails, setSelectedCourseForDetails] = useState(null);
  const [submittingAssignment, setSubmittingAssignment] = useState(null);
  const [solutionUrl, setSolutionUrl] = useState("");
  const [solutionComments, setSolutionComments] = useState("");
  const [isSubmittingTask, setIsSubmittingTask] = useState(false);

  // Application Form State
  const [applicationModalOpen, setApplicationModalOpen] = useState(false);
  const [appForm, setAppForm] = useState({
    studentName: auth?.user?.fullName || auth?.user?.username || "Rahul Sharma",
    email: auth?.user?.email || "student@infinityjob.in",
    phone: auth?.user?.mobileNumber || "+91 9876543212",
    targetCourse: "Full Stack Web Development (MERN & Java)",
    education: "B.Tech Computer Science (Final Year)",
    graduationYear: "2025",
    codingExperience: "Intermediate",
    goals: "Targeting SDE-1 roles in Top Tier Tech Companies with 15+ LPA package.",
  });
  const [sendingApp, setSendingApp] = useState(false);

  const currentUser = auth?.user || {};
  const currentUserId = currentUser.id || 3;
  const currentUserEmail = currentUser.email || "student@infinityjob.in";
  const currentUserName = currentUser.fullName || currentUser.username || "Rahul Sharma";

  // Load All Portal Data
  const loadPortalData = async () => {
    setLoading(true);
    try {
      const [coursesData, enrollData, attData, statsData, assignData, subData, appData] = await Promise.all([
        fetchCourses().catch(() => []),
        fetchEnrollments(currentUserId, currentUserEmail).catch(() => []),
        fetchAttendance(currentUserId, currentUserEmail).catch(() => []),
        fetchAttendanceStats(currentUserId).catch(() => ({
          percentage: 92,
          streakDays: 7,
          presentDays: 14,
          absentDays: 1,
          totalDays: 15,
        })),
        fetchAssignments().catch(() => []),
        fetchSubmissions(currentUserId, currentUserEmail).catch(() => []),
        fetchApplications(currentUserEmail).catch(() => []),
      ]);

      setCourses(coursesData);
      setEnrollments(enrollData);
      setAttendanceRecords(attData);
      if (statsData) setAttendanceStats(statsData);
      setAssignments(assignData);
      setSubmissions(subData);
      setMyApplications(appData);
    } catch (err) {
      console.error("Failed to load student data:", err);
      showToast("error", "Data Load Error", "Could not sync all records from InfinityJob backend.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPortalData();
  }, [auth]);

  // Check if student already marked attendance today
  const hasMarkedToday = useMemo(() => {
    const todayStr = new Date().toISOString().split("T")[0];
    return attendanceRecords.some((r) => r.attendanceDate === todayStr && r.status === "PRESENT");
  }, [attendanceRecords]);

  // Handle Marking Today's Attendance
  const handleMarkAttendance = async () => {
    if (hasMarkedToday) {
      showToast("info", "Already Marked", "You have already marked your attendance for today! Keep up the streak 🔥");
      return;
    }

    setMarkingAttendance(true);
    try {
      const res = await markTodayAttendance(
        currentUserId,
        currentUserEmail,
        currentUserName,
        enrollments[0]?.courseTitle || "Full Stack Web Development",
        "LIVE_LECTURE",
        "Checked-in via InfinityJob Student Portal"
      );
      showToast("success", "Attendance Marked! 🔥", "Your daily punch-in is recorded. Current streak: " + ((attendanceStats.streakDays || 5) + 1) + " days!");
      loadPortalData();
    } catch (err) {
      console.error(err);
      showToast("error", "Attendance Failed", "Could not mark attendance right now. Please try again.");
    } finally {
      setMarkingAttendance(false);
    }
  };

  // Handle Course Enrollment
  const handleEnroll = async (course) => {
    try {
      await enrollInCourse(currentUserId, currentUserEmail, currentUserName, course.id);
      showToast("success", "Enrollment Confirmed! 🚀", `Welcome to ${course.title}. Your curriculum is now unlocked.`);
      loadPortalData();
      setSelectedCourseForDetails(null);
    } catch (err) {
      showToast("error", "Enrollment Error", "Failed to enroll in track. Please try again.");
    }
  };

  // Handle Assignment Submission
  const handleOpenSubmitModal = (assignment) => {
    const existing = submissions.find((s) => s.assignmentId === assignment.id);
    setSubmittingAssignment(assignment);
    setSolutionUrl(existing?.submissionUrl || "");
    setSolutionComments(existing?.comments || "");
  };

  const handleSubmitSolution = async (e) => {
    e.preventDefault();
    if (!solutionUrl.trim()) {
      showToast("error", "URL Required", "Please provide a valid GitHub repo, PR, or hosted project URL.");
      return;
    }

    setIsSubmittingTask(true);
    try {
      await submitAssignment(
        submittingAssignment.id,
        currentUserId,
        currentUserName,
        currentUserEmail,
        solutionUrl.trim(),
        solutionComments.trim()
      );
      showToast("success", "Assignment Submitted! 🎉", "Your solution has been submitted for faculty & mentor evaluation.");
      setSubmittingAssignment(null);
      loadPortalData();
    } catch (err) {
      showToast("error", "Submission Failed", "Could not record your submission. Please try again.");
    } finally {
      setIsSubmittingTask(false);
    }
  };

  // Handle Application Submission
  const handleSendApplication = async (e) => {
    e.preventDefault();
    setSendingApp(true);
    try {
      await submitCourseApplication(appForm);
      showToast("success", "Application Sent! 🎯", "Our senior academic advisor will review your profile and reach out within 24 hours.");
      setApplicationModalOpen(false);
      loadPortalData();
    } catch (err) {
      showToast("error", "Application Failed", "Unable to submit application. Please try again.");
    } finally {
      setSendingApp(false);
    }
  };

  // Progress calculations
  const totalCompletedAssignments = submissions.filter((s) => s.status === "GRADED" || s.status === "SUBMITTED").length;
  const primaryEnrollment = enrollments[0];
  const overallCourseProgress = primaryEnrollment?.progressPercent || 68;

  // Placement readiness score calculation (0-100)
  const placementReadiness = useMemo(() => {
    const attWeight = (attendanceStats.percentage || 90) * 0.3;
    const courseWeight = overallCourseProgress * 0.4;
    const assignWeight = Math.min(100, (totalCompletedAssignments / Math.max(1, assignments.length)) * 100) * 0.3;
    return Math.round(attWeight + courseWeight + assignWeight);
  }, [attendanceStats, overallCourseProgress, totalCompletedAssignments, assignments]);

  return (
    <div className="student-portal-wrapper">
      {/* Top Banner Navigation */}
      <header className="portal-header">
        <div className="portal-brand">
          <div className="brand-logo-icon">♾️</div>
          <div className="brand-titles">
            <h1 className="portal-title">InfinityJob</h1>
            <span className="portal-subtitle">Student Learning Hub & Career Accelerator</span>
          </div>
        </div>

        <div className="student-profile-bar">
          <div className="streak-badge-pill" title="Continuous Active Daily Attendance">
            <span className="fire-icon">🔥</span>
            <span className="streak-num">{attendanceStats.streakDays || 6} Days Streak</span>
          </div>

          <div className="student-badge">
            <div className="student-avatar-circle">
              {currentUserName.substring(0, 2).toUpperCase()}
            </div>
            <div className="student-meta">
              <span className="student-name">{currentUserName}</span>
              <span className="student-role-tag">Candidate • SDE Track</span>
            </div>
          </div>

          <button className="btn-portal-logout" onClick={onLogout} title="Sign Out">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Tab Navigation */}
      <nav className="portal-nav-tabs">
        <button
          className={`portal-tab ${activeTab === "overview" ? "active" : ""}`}
          onClick={() => setActiveTab("overview")}
        >
          <span className="tab-icon">📊</span> Overview & Progress
        </button>
        <button
          className={`portal-tab ${activeTab === "courses" ? "active" : ""}`}
          onClick={() => setActiveTab("courses")}
        >
          <span className="tab-icon">🚀</span> My Courses & Catalog
          {enrollments.length > 0 && <span className="tab-badge">{enrollments.length}</span>}
        </button>
        <button
          className={`portal-tab ${activeTab === "attendance" ? "active" : ""}`}
          onClick={() => setActiveTab("attendance")}
        >
          <span className="tab-icon">📅</span> Daily Attendance
          <span className="tab-indicator-dot" />
        </button>
        <button
          className={`portal-tab ${activeTab === "assignments" ? "active" : ""}`}
          onClick={() => setActiveTab("assignments")}
        >
          <span className="tab-icon">📝</span> Assignments & Tasks
          {assignments.length > 0 && <span className="tab-badge">{assignments.length}</span>}
        </button>
        <button
          className={`portal-tab ${activeTab === "apply" ? "active" : ""}`}
          onClick={() => setActiveTab("apply")}
        >
          <span className="tab-icon">🎯</span> Admissions & Requests
        </button>
      </nav>

      {/* Main Content Area */}
      <main className="portal-body">
        {loading ? (
          <div className="portal-loading-card">
            <div className="spinner-infinity" />
            <p>Syncing InfinityJob Curriculum & Live Records...</p>
          </div>
        ) : (
          <>
            {/* 1. OVERVIEW & PROGRESS TAB */}
            {activeTab === "overview" && (
              <div className="portal-view-section">
                {/* Daily Punch-in Hero Banner */}
                <div className="punchin-hero-card">
                  <div className="punchin-content">
                    <div className="punchin-badge">Live Attendance Ledger</div>
                    <h2>Mark Today's Class & Lab Attendance</h2>
                    <p>
                      Daily consistency is tracked by top hiring partners. Check in every day before 11:59 PM to maintain your placement eligibility.
                    </p>
                    <div className="punchin-actions">
                      <button
                        className={`btn-punch-in ${hasMarkedToday ? "marked" : ""}`}
                        onClick={handleMarkAttendance}
                        disabled={markingAttendance}
                      >
                        {hasMarkedToday ? (
                          <>
                            <span className="check-icon">✓</span> Attendance Marked for Today (Present)
                          </>
                        ) : (
                          <>
                            <span className="pulse-dot" /> {markingAttendance ? "Recording Check-in..." : "Mark Present for Today"}
                          </>
                        )}
                      </button>
                      <span className="punch-date-label">
                        📅 {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "short", day: "numeric" })}
                      </span>
                    </div>
                  </div>
                  <div className="streak-visual-box">
                    <div className="streak-circle-flame">🔥</div>
                    <div className="streak-details">
                      <span className="streak-count">{attendanceStats.streakDays || 6} Days</span>
                      <span className="streak-sub">Active Learning Streak</span>
                    </div>
                  </div>
                </div>

                {/* Metric Summary Cards */}
                <div className="student-stats-grid">
                  <div className="stat-glow-card">
                    <div className="stat-glow-header">
                      <span className="stat-glow-icon">📈</span>
                      <span className="stat-glow-tag">Career Readiness</span>
                    </div>
                    <div className="stat-glow-value">{placementReadiness}%</div>
                    <div className="stat-glow-bar-bg">
                      <div className="stat-glow-bar-fill readiness" style={{ width: `${placementReadiness}%` }} />
                    </div>
                    <span className="stat-glow-caption">Ready for Tier-1 Mock Interviews</span>
                  </div>

                  <div className="stat-glow-card">
                    <div className="stat-glow-header">
                      <span className="stat-glow-icon">📅</span>
                      <span className="stat-glow-tag">Attendance Rate</span>
                    </div>
                    <div className="stat-glow-value">{attendanceStats.percentage || 92}%</div>
                    <div className="stat-glow-bar-bg">
                      <div className="stat-glow-bar-fill attendance" style={{ width: `${attendanceStats.percentage || 92}%` }} />
                    </div>
                    <span className="stat-glow-caption">{attendanceStats.presentDays || 14} Present / {attendanceStats.totalDays || 15} Class Days</span>
                  </div>

                  <div className="stat-glow-card">
                    <div className="stat-glow-header">
                      <span className="stat-glow-icon">💻</span>
                      <span className="stat-glow-tag">Curriculum Mastery</span>
                    </div>
                    <div className="stat-glow-value">{overallCourseProgress}%</div>
                    <div className="stat-glow-bar-bg">
                      <div className="stat-glow-bar-fill curriculum" style={{ width: `${overallCourseProgress}%` }} />
                    </div>
                    <span className="stat-glow-caption">{primaryEnrollment?.courseTitle || "Full Stack Web Development"}</span>
                  </div>

                  <div className="stat-glow-card">
                    <div className="stat-glow-header">
                      <span className="stat-glow-icon">🏆</span>
                      <span className="stat-glow-tag">Assignments</span>
                    </div>
                    <div className="stat-glow-value">{submissions.length} / {assignments.length || 4}</div>
                    <div className="stat-glow-bar-bg">
                      <div className="stat-glow-bar-fill assignments" style={{ width: `${Math.min(100, (submissions.length / (assignments.length || 4)) * 100)}%` }} />
                    </div>
                    <span className="stat-glow-caption">{submissions.filter(s => s.status === "GRADED").length} Graded by Faculty</span>
                  </div>
                </div>

                {/* Active Courses & Next Deadlines Split */}
                <div className="overview-split-layout">
                  {/* Left: Active Course Progress Card */}
                  <div className="dashboard-panel">
                    <div className="panel-header-row">
                      <div className="panel-title-with-icon">
                        <span className="icon">🚀</span>
                        <h3>Active Enrolled Tracks</h3>
                      </div>
                      <button className="btn-link-action" onClick={() => setActiveTab("courses")}>
                        View All Tracks →
                      </button>
                    </div>

                    {enrollments.length === 0 ? (
                      <div className="empty-state-simple">
                        <p>You haven't enrolled in a track yet.</p>
                        <button className="btn-primary-sm" onClick={() => setActiveTab("courses")}>
                          Browse Tracks
                        </button>
                      </div>
                    ) : (
                      <div className="enrolled-tracks-list">
                        {enrollments.map((enr) => (
                          <div key={enr.id} className="enrolled-track-item">
                            <div className="track-item-header">
                              <div className="track-name-badge">
                                <span className="track-code">{enr.courseCode}</span>
                                <h4>{enr.courseTitle}</h4>
                              </div>
                              <span className="track-status-pill">{enr.status}</span>
                            </div>

                            <div className="progress-interactive-slider">
                              <div className="slider-label-row">
                                <span>Track Progress</span>
                                <span className="progress-pct-bold">{enr.progressPercent}%</span>
                              </div>
                              <div className="track-progress-bar">
                                <div className="track-progress-fill" style={{ width: `${enr.progressPercent}%` }} />
                              </div>
                            </div>

                            <div className="track-meta-pills">
                              <span>📅 Enrolled: {enr.enrolledDate}</span>
                              <span>📝 Tasks: {enr.completedAssignments || 0}/{enr.totalAssignments || 10} Complete</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Right: Upcoming Assignments & Submissions */}
                  <div className="dashboard-panel">
                    <div className="panel-header-row">
                      <div className="panel-title-with-icon">
                        <span className="icon">⏳</span>
                        <h3>Pending Assignments</h3>
                      </div>
                      <button className="btn-link-action" onClick={() => setActiveTab("assignments")}>
                        View All Tasks →
                      </button>
                    </div>

                    <div className="mini-tasks-list">
                      {assignments.slice(0, 3).map((task) => {
                        const sub = submissions.find((s) => s.assignmentId === task.id);
                        return (
                          <div key={task.id} className="mini-task-card">
                            <div className="mini-task-main">
                              <span className={`diff-pill ${task.difficulty?.toLowerCase()}`}>
                                {task.difficulty}
                              </span>
                              <h4>{task.title}</h4>
                              <p className="mini-task-module">{task.moduleName}</p>
                              <span className="task-deadline">📅 Due: {task.dueDate}</span>
                            </div>

                            <div className="mini-task-action">
                              {sub ? (
                                <span className={`sub-badge ${sub.status.toLowerCase()}`}>
                                  {sub.status === "GRADED" ? `Score: ${sub.score}/100` : "Submitted ✓"}
                                </span>
                              ) : (
                                <button className="btn-submit-task-sm" onClick={() => handleOpenSubmitModal(task)}>
                                  Submit Code
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 2. MY COURSES & CATALOG TAB */}
            {activeTab === "courses" && (
              <div className="portal-view-section">
                <div className="section-intro-bar">
                  <div>
                    <h2>InfinityJob Career Accelerator Tracks</h2>
                    <p>Designed with senior architects from FAANG & top unicorn startups to guarantee job readiness.</p>
                  </div>
                  <button className="btn-secondary-glow" onClick={() => setApplicationModalOpen(true)}>
                    Apply for 100% Scholarship / New Track 🎯
                  </button>
                </div>

                <div className="courses-catalog-grid">
                  {courses.map((c) => {
                    const isEnrolled = enrollments.some((e) => e.courseCode === c.code);
                    const enrollment = enrollments.find((e) => e.courseCode === c.code);

                    return (
                      <div key={c.id} className={`course-track-card ${isEnrolled ? "enrolled-border" : ""}`}>
                        {isEnrolled && <div className="enrolled-ribbon">Active Enrolled</div>}
                        <div className="course-card-top">
                          <div className="course-icon-badge">{c.icon || "💻"}</div>
                          <div className="course-rating-pill">⭐ {c.rating || 4.9} ({c.totalEnrolled || 350}+ Alumni)</div>
                        </div>

                        <h3 className="course-card-title">{c.title}</h3>
                        <p className="course-card-desc">{c.description}</p>

                        <div className="course-instructor-row">
                          <span className="inst-label">Lead Mentor:</span>
                          <span className="inst-name">{c.instructor}</span>
                        </div>

                        <div className="course-tags-container">
                          {c.tags?.split(",").map((tag, idx) => (
                            <span key={idx} className="tech-tag">{tag.trim()}</span>
                          ))}
                        </div>

                        <div className="course-card-stats-row">
                          <div className="course-stat-col">
                            <span className="val">{c.durationWeeks} Weeks</span>
                            <span className="lbl">Duration</span>
                          </div>
                          <div className="course-stat-col">
                            <span className="val">{c.level}</span>
                            <span className="lbl">Level</span>
                          </div>
                          <div className="course-stat-col">
                            <span className="val placement-highlight">{c.placementRate}%</span>
                            <span className="lbl">Placement Rate</span>
                          </div>
                        </div>

                        <div className="course-card-footer">
                          {isEnrolled ? (
                            <div className="enrolled-footer-status">
                              <div className="progress-inline-row">
                                <span>Track Progress: {enrollment?.progressPercent || 0}%</span>
                              </div>
                              <div className="track-progress-bar">
                                <div className="track-progress-fill" style={{ width: `${enrollment?.progressPercent || 0}%` }} />
                              </div>
                            </div>
                          ) : (
                            <button className="btn-enroll-track" onClick={() => handleEnroll(c)}>
                              Enroll in Track Now 🚀
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 3. DAILY ATTENDANCE TAB */}
            {activeTab === "attendance" && (
              <div className="portal-view-section">
                <div className="attendance-dashboard-grid">
                  {/* Left: Punch-In & Stats Card */}
                  <div className="attendance-left-col">
                    <div className="attendance-mark-panel">
                      <div className="panel-badge-top">Live Class Attendance</div>
                      <h3>Punch Today's Presence</h3>
                      <p>
                        Mark your daily presence to keep your minimum 85% attendance requirement for InfinityJob placement drives.
                      </p>

                      <div className="today-punch-card">
                        <div className="today-date-text">
                          {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                        </div>
                        <button
                          className={`btn-punch-in-large ${hasMarkedToday ? "done" : ""}`}
                          onClick={handleMarkAttendance}
                          disabled={markingAttendance}
                        >
                          {hasMarkedToday ? (
                            <>
                              <span className="icon-check">✓</span>
                              <span>Attendance Recorded</span>
                              <small>Marked Present for Today</small>
                            </>
                          ) : (
                            <>
                              <span className="pulse-ring" />
                              <span>{markingAttendance ? "Processing..." : "Punch In Now"}</span>
                              <small>Click to mark present</small>
                            </>
                          )}
                        </button>
                      </div>

                      <div className="attendance-quick-stats">
                        <div className="q-stat">
                          <span className="num green">{attendanceStats.presentDays || 14}</span>
                          <span className="txt">Days Present</span>
                        </div>
                        <div className="q-stat">
                          <span className="num red">{attendanceStats.absentDays || 1}</span>
                          <span className="txt">Days Absent</span>
                        </div>
                        <div className="q-stat">
                          <span className="num purple">{attendanceStats.streakDays || 6}🔥</span>
                          <span className="txt">Day Streak</span>
                        </div>
                        <div className="q-stat">
                          <span className="num blue">{attendanceStats.percentage || 92}%</span>
                          <span className="txt">Overall Rate</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right: Attendance History Ledger */}
                  <div className="attendance-right-col">
                    <div className="dashboard-panel">
                      <div className="panel-header-row">
                        <div className="panel-title-with-icon">
                          <span className="icon">📋</span>
                          <h3>Recent Attendance History</h3>
                        </div>
                        <span className="badge-count">{attendanceRecords.length} Records</span>
                      </div>

                      <div className="table-responsive">
                        <table className="custom-data-table">
                          <thead>
                            <tr>
                              <th>Date</th>
                              <th>Session / Course</th>
                              <th>Time</th>
                              <th>Status</th>
                              <th>Notes</th>
                            </tr>
                          </thead>
                          <tbody>
                            {attendanceRecords.length === 0 ? (
                              <tr>
                                <td colSpan="5" className="text-center py-4">
                                  No attendance logs found yet. Click 'Punch In Now' to mark your first day!
                                </td>
                              </tr>
                            ) : (
                              attendanceRecords.map((r) => (
                                <tr key={r.id}>
                                  <td className="font-semibold">{r.attendanceDate}</td>
                                  <td>{r.courseName || "Full Stack Web Development"}</td>
                                  <td className="text-muted">{r.markedTime || "10:00 AM"}</td>
                                  <td>
                                    <span className={`status-pill ${r.status?.toLowerCase()}`}>
                                      {r.status === "PRESENT" ? "✓ Present" : r.status}
                                    </span>
                                  </td>
                                  <td className="text-sm">{r.notes || "Self marked"}</td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 4. ASSIGNMENTS & TASKS TAB */}
            {activeTab === "assignments" && (
              <div className="portal-view-section">
                <div className="section-intro-bar">
                  <div>
                    <h2>Course Assignments & Coding Projects</h2>
                    <p>Submit your GitHub repository or hosted project links for mentor code reviews & placement grading.</p>
                  </div>
                </div>

                <div className="assignments-grid">
                  {assignments.map((task) => {
                    const sub = submissions.find((s) => s.assignmentId === task.id);
                    return (
                      <div key={task.id} className="assignment-card">
                        <div className="assignment-card-header">
                          <div className="badge-group">
                            <span className="module-badge">{task.moduleName || task.courseCode}</span>
                            <span className={`diff-tag ${task.difficulty?.toLowerCase()}`}>{task.difficulty}</span>
                          </div>
                          <span className="due-date-pill">⏰ Due: {task.dueDate}</span>
                        </div>

                        <h3 className="assignment-title">{task.title}</h3>
                        <p className="assignment-desc">{task.description}</p>

                        {task.starterCodeUrl && (
                          <div className="starter-code-link">
                            <a href={task.starterCodeUrl} target="_blank" rel="noopener noreferrer">
                              📂 View Starter Code Repo ↗
                            </a>
                          </div>
                        )}

                        {/* Submission status & review details */}
                        {sub ? (
                          <div className="submission-status-box">
                            <div className="sub-status-header">
                              <span className="status-label">Your Submission Status:</span>
                              <span className={`status-badge-tag ${sub.status.toLowerCase()}`}>
                                {sub.status}
                              </span>
                            </div>

                            <div className="submitted-link-preview">
                              <span>🔗 URL: </span>
                              <a href={sub.submissionUrl} target="_blank" rel="noopener noreferrer">
                                {sub.submissionUrl}
                              </a>
                            </div>

                            {sub.comments && (
                              <p className="submitted-notes">
                                <strong>Remarks:</strong> {sub.comments}
                              </p>
                            )}

                            {sub.status === "GRADED" && (
                              <div className="grade-result-banner">
                                <div className="grade-score">
                                  <span>Mentor Score:</span>
                                  <strong>{sub.score} / {task.maxScore || 100}</strong>
                                </div>
                                {sub.feedback && (
                                  <p className="grade-feedback">
                                    <em>"{sub.feedback}"</em>
                                  </p>
                                )}
                              </div>
                            )}

                            <button className="btn-resubmit-sm" onClick={() => handleOpenSubmitModal(task)}>
                              Update / Resubmit Solution
                            </button>
                          </div>
                        ) : (
                          <div className="assignment-action-footer">
                            <button className="btn-primary-glow" onClick={() => handleOpenSubmitModal(task)}>
                              Submit Project / Code Solution 🚀
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 5. ADMISSIONS & REQUESTS TAB */}
            {activeTab === "apply" && (
              <div className="portal-view-section">
                <div className="admissions-split-grid">
                  {/* Left: Application Form */}
                  <div className="dashboard-panel">
                    <div className="panel-header-row">
                      <div className="panel-title-with-icon">
                        <span className="icon">🎯</span>
                        <h3>Request Admission / Track Switch</h3>
                      </div>
                    </div>
                    <p className="panel-desc">
                      Submit an inquiry for career counseling, scholarship consideration, or track upgrade with InfinityJob faculty.
                    </p>

                    <form onSubmit={handleSendApplication} className="portal-form">
                      <div className="form-group-custom">
                        <label>Candidate Full Name</label>
                        <input
                          type="text"
                          required
                          value={appForm.studentName}
                          onChange={(e) => setAppForm({ ...appForm, studentName: e.target.value })}
                        />
                      </div>

                      <div className="form-row-2">
                        <div className="form-group-custom">
                          <label>Email Address</label>
                          <input
                            type="email"
                            required
                            value={appForm.email}
                            onChange={(e) => setAppForm({ ...appForm, email: e.target.value })}
                          />
                        </div>
                        <div className="form-group-custom">
                          <label>Contact Phone</label>
                          <input
                            type="text"
                            required
                            value={appForm.phone}
                            onChange={(e) => setAppForm({ ...appForm, phone: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="form-group-custom">
                        <label>Target Career Track</label>
                        <select
                          value={appForm.targetCourse}
                          onChange={(e) => setAppForm({ ...appForm, targetCourse: e.target.value })}
                        >
                          <option value="Full Stack Web Development (MERN & Java)">Full Stack Web Development (MERN & Java)</option>
                          <option value="DSA & System Design Career Bootcamp">DSA & System Design Career Bootcamp</option>
                          <option value="Data Science, Machine Learning & GenAI">Data Science, Machine Learning & GenAI</option>
                          <option value="Cloud Engineering & DevOps Mastery">Cloud Engineering & DevOps Mastery</option>
                        </select>
                      </div>

                      <div className="form-row-2">
                        <div className="form-group-custom">
                          <label>Educational Background</label>
                          <input
                            type="text"
                            value={appForm.education}
                            onChange={(e) => setAppForm({ ...appForm, education: e.target.value })}
                            placeholder="e.g. B.Tech / BCA / Working Professional"
                          />
                        </div>
                        <div className="form-group-custom">
                          <label>Graduation Year</label>
                          <input
                            type="text"
                            value={appForm.graduationYear}
                            onChange={(e) => setAppForm({ ...appForm, graduationYear: e.target.value })}
                            placeholder="e.g. 2025"
                          />
                        </div>
                      </div>

                      <div className="form-group-custom">
                        <label>Career Goals & Aspirations</label>
                        <textarea
                          rows="3"
                          value={appForm.goals}
                          onChange={(e) => setAppForm({ ...appForm, goals: e.target.value })}
                          placeholder="Tell us about your placement goals, target companies, or scholarship requests..."
                        />
                      </div>

                      <button type="submit" className="btn-submit-application" disabled={sendingApp}>
                        {sendingApp ? "Sending Request..." : "Submit Admission Request 🚀"}
                      </button>
                    </form>
                  </div>

                  {/* Right: Existing Applications & Status */}
                  <div className="dashboard-panel">
                    <div className="panel-header-row">
                      <div className="panel-title-with-icon">
                        <span className="icon">📑</span>
                        <h3>Your Submitted Applications</h3>
                      </div>
                      <span className="badge-count">{myApplications.length} Requests</span>
                    </div>

                    <div className="applications-history-list">
                      {myApplications.length === 0 ? (
                        <div className="empty-state-card">
                          <p>You haven't submitted any special track requests yet.</p>
                        </div>
                      ) : (
                        myApplications.map((app) => (
                          <div key={app.id} className="application-record-card">
                            <div className="app-card-top">
                              <h4>{app.targetCourse}</h4>
                              <span className={`app-status-badge ${app.status?.toLowerCase()}`}>
                                {app.status}
                              </span>
                            </div>
                            <p className="app-meta-line">
                              <span>📅 Submitted: {new Date(app.appliedAt).toLocaleDateString()}</span>
                              <span>🎓 {app.education} ({app.graduationYear})</span>
                            </p>
                            {app.goals && <p className="app-goals-preview">"{app.goals}"</p>}
                            {app.adminNotes && (
                              <div className="admin-notes-box">
                                <strong>Admin Response:</strong> {app.adminNotes}
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* SUBMISSION MODAL */}
      {submittingAssignment && (
        <div className="portal-modal-overlay" onClick={() => setSubmittingAssignment(null)}>
          <div className="portal-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-styled">
              <div>
                <span className="modal-tag">Assignment Submission</span>
                <h3>{submittingAssignment.title}</h3>
              </div>
              <button className="btn-modal-close" onClick={() => setSubmittingAssignment(null)}>✕</button>
            </div>

            <form onSubmit={handleSubmitSolution} className="portal-form">
              <div className="form-group-custom">
                <label>GitHub Repository / PR or Live Hosted URL *</label>
                <input
                  type="url"
                  required
                  placeholder="https://github.com/your-username/project-repo"
                  value={solutionUrl}
                  onChange={(e) => setSolutionUrl(e.target.value)}
                />
              </div>

              <div className="form-group-custom">
                <label>Solution Remarks / Architecture Notes</label>
                <textarea
                  rows="4"
                  placeholder="Briefly explain your implementation, edge cases handled, and features built..."
                  value={solutionComments}
                  onChange={(e) => setSolutionComments(e.target.value)}
                />
              </div>

              <div className="modal-footer-actions">
                <button type="button" className="btn-secondary" onClick={() => setSubmittingAssignment(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary-glow" disabled={isSubmittingTask}>
                  {isSubmittingTask ? "Submitting..." : "Submit for Faculty Review 🚀"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* POPUP APPLICATION MODAL */}
      {applicationModalOpen && (
        <div className="portal-modal-overlay" onClick={() => setApplicationModalOpen(false)}>
          <div className="portal-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-styled">
              <div>
                <span className="modal-tag">InfinityJob Admissions</span>
                <h3>Apply for New Track or Scholarship</h3>
              </div>
              <button className="btn-modal-close" onClick={() => setApplicationModalOpen(false)}>✕</button>
            </div>

            <form onSubmit={handleSendApplication} className="portal-form">
              <div className="form-group-custom">
                <label>Candidate Full Name</label>
                <input
                  type="text"
                  required
                  value={appForm.studentName}
                  onChange={(e) => setAppForm({ ...appForm, studentName: e.target.value })}
                />
              </div>

              <div className="form-row-2">
                <div className="form-group-custom">
                  <label>Email Address</label>
                  <input
                    type="email"
                    required
                    value={appForm.email}
                    onChange={(e) => setAppForm({ ...appForm, email: e.target.value })}
                  />
                </div>
                <div className="form-group-custom">
                  <label>Contact Phone</label>
                  <input
                    type="text"
                    required
                    value={appForm.phone}
                    onChange={(e) => setAppForm({ ...appForm, phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group-custom">
                <label>Target Career Track</label>
                <select
                  value={appForm.targetCourse}
                  onChange={(e) => setAppForm({ ...appForm, targetCourse: e.target.value })}
                >
                  <option value="Full Stack Web Development (MERN & Java)">Full Stack Web Development (MERN & Java)</option>
                  <option value="DSA & System Design Career Bootcamp">DSA & System Design Career Bootcamp</option>
                  <option value="Data Science, Machine Learning & GenAI">Data Science, Machine Learning & GenAI</option>
                  <option value="Cloud Engineering & DevOps Mastery">Cloud Engineering & DevOps Mastery</option>
                </select>
              </div>

              <div className="form-group-custom">
                <label>Career Goals & Aspirations</label>
                <textarea
                  rows="3"
                  value={appForm.goals}
                  onChange={(e) => setAppForm({ ...appForm, goals: e.target.value })}
                />
              </div>

              <div className="modal-footer-actions">
                <button type="button" className="btn-secondary" onClick={() => setApplicationModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary-glow" disabled={sendingApp}>
                  {sendingApp ? "Submitting..." : "Submit Application 🎯"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
