import React, { useState, useEffect, useMemo } from "react";
import ReactDOM from "react-dom/client";
import "./style.css";
import TwoFactorLoginModal from "./TwoFactorLoginModal";
import StudentPortal from "./StudentPortal";
import {
  fetchApplications,
  updateApplicationStatus,
  fetchAttendance,
  fetchAssignments,
  fetchSubmissions,
  gradeSubmission,
} from "./services/portalService";

const API_BASE_URL = "http://localhost:8080/api/students";

function App() {
  // Authentication State
  const [auth, setAuth] = useState(() => {
    try {
      const saved = localStorage.getItem("infinityjob_auth");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Admin Tab Navigation: "students", "applications", "attendance", "grading"
  const [adminTab, setAdminTab] = useState("students");

  // Admin Data State
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState([]);
  const [adminAttendance, setAdminAttendance] = useState([]);
  const [adminSubmissions, setAdminSubmissions] = useState([]);
  const [adminAssignments, setAdminAssignments] = useState([]);

  // Grading Modal State
  const [gradingModalItem, setGradingModalItem] = useState(null);
  const [gradeScore, setGradeScore] = useState(95);
  const [gradeFeedback, setGradeFeedback] = useState("Excellent solution with clean structure.");
  const [isGrading, setIsGrading] = useState(false);

  // Search & Filter State for Students
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("ALL");
  const [sortOrder, setSortOrder] = useState("id-asc");

  // Modal State for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [formData, setFormData] = useState({ name: "", email: "", course: "", age: "" });
  const [submitting, setSubmitting] = useState(false);

  // Modal State for View by ID
  const [viewingStudent, setViewingStudent] = useState(null);

  // Modal State for Delete Confirmation
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Toast Notifications
  const [toasts, setToasts] = useState([]);

  const showToast = (type, title, message) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const handleLoginSuccess = (authData) => {
    setAuth(authData);
    try {
      localStorage.setItem("infinityjob_auth", JSON.stringify(authData));
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogout = () => {
    setAuth(null);
    localStorage.removeItem("infinityjob_auth");
    showToast("info", "Signed Out", "You have successfully signed out of InfinityJob.");
  };

  // Load Admin Data
  const loadStudents = async () => {
    setLoading(true);
    try {
      const response = await fetch(API_BASE_URL);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setStudents(data);
    } catch (err) {
      console.error("Failed to load students:", err);
      showToast("error", "Connection Error", "Could not fetch students from backend.");
    } finally {
      setLoading(false);
    }
  };

  const loadAdminData = async () => {
    try {
      const [apps, att, subs, assigns] = await Promise.all([
        fetchApplications().catch(() => []),
        fetchAttendance().catch(() => []),
        fetchSubmissions().catch(() => []),
        fetchAssignments().catch(() => []),
      ]);
      setApplications(apps);
      setAdminAttendance(att);
      setAdminSubmissions(subs);
      setAdminAssignments(assigns);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (auth) {
      loadStudents();
      loadAdminData();
    }
  }, [auth]);

  // CRUD Operations for Students
  const handleOpenAddModal = () => {
    setEditingStudent(null);
    setFormData({ name: "", email: "", course: "", age: "" });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (student) => {
    setEditingStudent(student);
    setFormData({
      name: student.name || "",
      email: student.email || "",
      course: student.course || "",
      age: student.age ? String(student.age) : "",
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        course: formData.course.trim(),
        age: formData.age ? parseInt(formData.age, 10) : null,
      };

      let response;
      if (editingStudent) {
        response = await fetch(`${API_BASE_URL}/${editingStudent.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...payload, emailVerified: editingStudent.emailVerified }),
        });
      } else {
        response = await fetch(API_BASE_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || "Failed to save student record");
      }

      const saved = await response.json();
      showToast(
        "success",
        editingStudent ? "Student Updated" : "Student Enrolled",
        `Student ID #${saved.id} (${saved.name}) saved successfully.`
      );
      setIsModalOpen(false);
      loadStudents();
    } catch (err) {
      showToast("error", "Operation Failed", err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      const response = await fetch(`${API_BASE_URL}/${deleteTarget.id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete record");
      showToast("success", "Student Deleted", `Student ID #${deleteTarget.id} removed.`);
      setDeleteTarget(null);
      loadStudents();
    } catch (err) {
      showToast("error", "Delete Failed", err.message);
    }
  };

  const handleViewDetails = async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/${id}`);
      if (!res.ok) throw new Error("Could not find student.");
      const data = await res.json();
      setViewingStudent(data);
    } catch (err) {
      showToast("error", "View Error", err.message);
    }
  };

  const handleAppStatus = async (appId, status) => {
    try {
      await updateApplicationStatus(appId, status, `Application status updated to ${status}`);
      showToast("success", `Application ${status}`, "Candidate request updated.");
      loadAdminData();
    } catch (err) {
      showToast("error", "Failed", "Could not update status.");
    }
  };

  const handleGradeSubmit = async (e) => {
    e.preventDefault();
    if (!gradingModalItem) return;
    setIsGrading(true);
    try {
      await gradeSubmission(gradingModalItem.id, gradeScore, gradeFeedback);
      showToast("success", "Grade Saved", `Score ${gradeScore}/100 assigned to candidate.`);
      setGradingModalItem(null);
      loadAdminData();
    } catch (err) {
      showToast("error", "Grading Failed", "Could not save grade.");
    } finally {
      setIsGrading(false);
    }
  };

  const uniqueCourses = useMemo(() => {
    const courses = students.map((s) => s.course?.trim()).filter(Boolean);
    return Array.from(new Set(courses));
  }, [students]);

  const filteredStudents = useMemo(() => {
    return students
      .filter((s) => {
        const matchesCourse = selectedCourse === "ALL" || s.course?.trim() === selectedCourse;
        const q = searchQuery.toLowerCase().trim();
        const matchesSearch =
          !q ||
          String(s.id).includes(q) ||
          s.name?.toLowerCase().includes(q) ||
          s.email?.toLowerCase().includes(q) ||
          s.course?.toLowerCase().includes(q);
        return matchesCourse && matchesSearch;
      })
      .sort((a, b) => {
        if (sortOrder === "id-asc") return a.id - b.id;
        if (sortOrder === "id-desc") return b.id - a.id;
        if (sortOrder === "name-asc") return (a.name || "").localeCompare(b.name || "");
        return 0;
      });
  }, [students, selectedCourse, searchQuery, sortOrder]);

  // If Not Authenticated, show Login / 2FA / Register Modal
  if (!auth) {
    return (
      <div className="app-root">
        <TwoFactorLoginModal onLoginSuccess={handleLoginSuccess} showToast={showToast} />
        <div className="toast-container">
          {toasts.map((t) => (
            <div key={t.id} className={`custom-toast toast-${t.type}`}>
              <div className="toast-title">{t.title}</div>
              <div className="toast-msg">{t.message}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ==========================================
  // 1. STUDENT INTERFACE
  // ==========================================
  const userRole = (auth?.user?.role || "STUDENT").toUpperCase();
  if (userRole === "STUDENT") {
    return (
      <div className="app-root">
        <StudentPortal auth={auth} onLogout={handleLogout} showToast={showToast} />
        <div className="toast-container">
          {toasts.map((t) => (
            <div key={t.id} className={`custom-toast toast-${t.type}`}>
              <div className="toast-title">{t.title}</div>
              <div className="toast-msg">{t.message}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ==========================================
  // 2. ADMIN INTERFACE
  // ==========================================
  const currentUser = auth.user || {};

  return (
    <div className="app-root admin-mode">
      {/* Top Navbar */}
      <header className="admin-header">
        <div className="header-brand-wrap">
          <div className="brand-badge-logo">♾️</div>
          <div>
            <h1 className="admin-portal-title">InfinityJob Admin Console</h1>
            <span className="admin-portal-tagline">Manage Student Records (CRUD by ID) & Institute Operations</span>
          </div>
        </div>

        <div className="admin-header-actions">
          <div className="admin-user-pill">
            <span className="admin-role-badge">🛡️ ADMIN</span>
            <span className="admin-name">{currentUser.fullName || currentUser.username || "Admin"}</span>
          </div>

          <button className="btn-portal-logout" onClick={handleLogout} title="Log Out">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <span>Log Out</span>
          </button>
        </div>
      </header>

      {/* Admin Tabs */}
      <nav className="admin-nav-tabs">
        <button
          className={`admin-tab ${adminTab === "students" ? "active" : ""}`}
          onClick={() => setAdminTab("students")}
        >
          🎓 Student Master Records ({students.length})
        </button>
        <button
          className={`admin-tab ${adminTab === "applications" ? "active" : ""}`}
          onClick={() => {
            setAdminTab("applications");
            loadAdminData();
          }}
        >
          📑 Admissions & Inquiries ({applications.length})
        </button>
        <button
          className={`admin-tab ${adminTab === "attendance" ? "active" : ""}`}
          onClick={() => {
            setAdminTab("attendance");
            loadAdminData();
          }}
        >
          📅 Daily Attendance Ledger ({adminAttendance.length})
        </button>
        <button
          className={`admin-tab ${adminTab === "grading" ? "active" : ""}`}
          onClick={() => {
            setAdminTab("grading");
            loadAdminData();
          }}
        >
          📝 Assignment Review & Grading ({adminSubmissions.length})
        </button>
      </nav>

      {/* Main Admin Body */}
      <main className="admin-body">
        {/* TAB 1: STUDENTS MASTER CRUD */}
        {adminTab === "students" && (
          <div className="admin-section">
            <div className="metric-cards-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
              <div className="metric-card">
                <div className="metric-icon blue">👨‍🎓</div>
                <div className="metric-data">
                  <div className="metric-num">{students.length}</div>
                  <div className="metric-lbl">Total Students Enrolled</div>
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-icon purple">📚</div>
                <div className="metric-data">
                  <div className="metric-num">{uniqueCourses.length}</div>
                  <div className="metric-lbl">Distinct Career Tracks</div>
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-icon green">⚡</div>
                <div className="metric-data">
                  <div className="metric-num">CRUD by ID</div>
                  <div className="metric-lbl">Full Operations on Student ID</div>
                </div>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="table-controls-card">
              <div className="search-box-wrap">
                <span className="search-icon">🔍</span>
                <input
                  type="text"
                  placeholder="Search by Student ID (e.g. 1, 33), Name, Email, Course..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button className="btn-clear-search" onClick={() => setSearchQuery("")}>✕</button>
                )}
              </div>

              <div className="filter-group">
                <select value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)}>
                  <option value="ALL">All Courses ({uniqueCourses.length})</option>
                  {uniqueCourses.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>

                <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
                  <option value="id-asc">Sort: ID (Low to High)</option>
                  <option value="id-desc">Sort: ID (High to Low)</option>
                  <option value="name-asc">Sort: Name (A-Z)</option>
                </select>

                <button className="btn-add-student" onClick={handleOpenAddModal}>
                  + Add New Student
                </button>
              </div>
            </div>

            {/* Students Table */}
            <div className="table-wrapper-card">
              <div className="table-responsive">
                <table className="custom-data-table">
                  <thead>
                    <tr>
                      <th style={{ width: "100px" }}>Student ID</th>
                      <th>Student Name</th>
                      <th>Email Address</th>
                      <th>Course</th>
                      <th>Age</th>
                      <th style={{ textAlign: "right" }}>Actions (CRUD by ID)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan="6" className="text-center py-6">
                          <div className="spinner-infinity" /> Loading student records...
                        </td>
                      </tr>
                    ) : filteredStudents.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="text-center py-8">
                          No students found matching your filters.
                        </td>
                      </tr>
                    ) : (
                      filteredStudents.map((st) => (
                        <tr key={st.id}>
                          <td>
                            <span
                              style={{
                                background: "rgba(99, 102, 241, 0.2)",
                                color: "#a5b4fc",
                                border: "1px solid rgba(99, 102, 241, 0.4)",
                                padding: "4px 10px",
                                borderRadius: "6px",
                                fontWeight: "800",
                                fontFamily: "monospace",
                                fontSize: "13px",
                              }}
                            >
                              #{st.id}
                            </span>
                          </td>
                          <td>
                            <strong style={{ color: "#fff" }}>{st.name}</strong>
                          </td>
                          <td>
                            <span style={{ color: "var(--text-secondary)" }}>{st.email}</span>
                          </td>
                          <td>
                            <span className="course-pill course-cs">{st.course}</span>
                          </td>
                          <td>{st.age ? `${st.age} yrs` : "—"}</td>
                          <td style={{ textAlign: "right" }}>
                            <div className="action-buttons-group" style={{ justifyContent: "flex-end" }}>
                              <button
                                className="btn-action-edit"
                                onClick={() => handleViewDetails(st.id)}
                                title="View Details by ID"
                                style={{ background: "rgba(6, 182, 212, 0.15)", color: "#67e8f9" }}
                              >
                                👁️ View
                              </button>
                              <button
                                className="btn-action-edit"
                                onClick={() => handleOpenEditModal(st)}
                                title={`Edit Student #${st.id}`}
                              >
                                ✏️ Edit
                              </button>
                              <button
                                className="btn-action-delete"
                                onClick={() => setDeleteTarget(st)}
                                title={`Delete Student #${st.id}`}
                              >
                                🗑️ Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: APPLICATIONS & ADMISSIONS */}
        {adminTab === "applications" && (
          <div className="admin-section">
            <div className="section-intro-bar">
              <div>
                <h2>Admissions & Track Enrollment Inquiries</h2>
                <p>Review candidate applications and approve admissions requests.</p>
              </div>
              <button className="btn-secondary-glow" onClick={loadAdminData}>↻ Refresh</button>
            </div>

            <div className="table-wrapper-card">
              <div className="table-responsive">
                <table className="custom-data-table">
                  <thead>
                    <tr>
                      <th>Candidate & Contact</th>
                      <th>Target Track</th>
                      <th>Education & Grad Year</th>
                      <th>Goals</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {applications.length === 0 ? (
                      <tr><td colSpan="6" className="text-center py-8">No applications submitted yet.</td></tr>
                    ) : (
                      applications.map((app) => (
                        <tr key={app.id}>
                          <td>
                            <strong>{app.studentName}</strong>
                            <div className="text-muted text-xs">{app.email}</div>
                          </td>
                          <td><span className="course-pill course-cs">{app.targetCourse}</span></td>
                          <td><div>{app.education}</div><span className="text-muted text-xs">Year: {app.graduationYear}</span></td>
                          <td className="text-sm max-w-xs">{app.goals}</td>
                          <td><span className={`app-status-badge ${app.status?.toLowerCase()}`}>{app.status}</span></td>
                          <td>
                            <div className="action-buttons-group">
                              <button className="btn-approve-sm" onClick={() => handleAppStatus(app.id, "APPROVED")}>✓ Approve</button>
                              <button className="btn-reject-sm" onClick={() => handleAppStatus(app.id, "REJECTED")}>✕ Reject</button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: ATTENDANCE LEDGER */}
        {adminTab === "attendance" && (
          <div className="admin-section">
            <div className="section-intro-bar">
              <div>
                <h2>Daily Attendance Ledger</h2>
                <p>All student check-in logs recorded across lecture sessions.</p>
              </div>
              <button className="btn-secondary-glow" onClick={loadAdminData}>↻ Refresh</button>
            </div>

            <div className="table-wrapper-card">
              <div className="table-responsive">
                <table className="custom-data-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Student Name</th>
                      <th>Email</th>
                      <th>Course</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adminAttendance.length === 0 ? (
                      <tr><td colSpan="5" className="text-center py-8">No attendance records logged yet.</td></tr>
                    ) : (
                      adminAttendance.map((rec) => (
                        <tr key={rec.id}>
                          <td className="font-semibold">{rec.attendanceDate}</td>
                          <td>{rec.studentName}</td>
                          <td className="text-muted">{rec.userEmail}</td>
                          <td>{rec.courseName || "Full Stack Web Development"}</td>
                          <td><span className={`status-pill ${rec.status?.toLowerCase()}`}>✓ {rec.status}</span></td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: ASSIGNMENT GRADING */}
        {adminTab === "grading" && (
          <div className="admin-section">
            <div className="section-intro-bar">
              <div>
                <h2>Student Assignment Submissions & Code Evaluation</h2>
                <p>Inspect student GitHub repositories and assign marks with mentor review.</p>
              </div>
              <button className="btn-secondary-glow" onClick={loadAdminData}>↻ Refresh</button>
            </div>

            <div className="table-wrapper-card">
              <div className="table-responsive">
                <table className="custom-data-table">
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Assignment Title</th>
                      <th>Submission URL</th>
                      <th>Student Remarks</th>
                      <th>Grade</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adminSubmissions.length === 0 ? (
                      <tr><td colSpan="6" className="text-center py-8">No assignments submitted yet.</td></tr>
                    ) : (
                      adminSubmissions.map((sub) => (
                        <tr key={sub.id}>
                          <td><strong>{sub.studentName}</strong><div className="text-muted text-xs">{sub.userEmail}</div></td>
                          <td className="font-semibold">{sub.assignmentTitle}</td>
                          <td><a href={sub.submissionUrl} target="_blank" rel="noopener noreferrer" className="link-repo">🔗 View Project ↗</a></td>
                          <td className="text-sm max-w-xs">{sub.comments || "—"}</td>
                          <td>
                            {sub.status === "GRADED" ? (
                              <span className="grade-pill-done">{sub.score} / 100</span>
                            ) : (
                              <span className="grade-pill-pending">Pending</span>
                            )}
                          </td>
                          <td>
                            <button
                              className="btn-grade-action"
                              onClick={() => {
                                setGradingModalItem(sub);
                                setGradeScore(sub.score || 95);
                                setGradeFeedback(sub.feedback || "Clean code and well-tested endpoints.");
                              }}
                            >
                              {sub.status === "GRADED" ? "Update Grade ✍️" : "Grade 🌟"}
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ADD / EDIT MODAL */}
      {isModalOpen && (
        <div className="portal-modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="portal-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-styled">
              <div>
                <span className="modal-tag">Student Record</span>
                <h3>{editingStudent ? `Edit Student #${editingStudent.id}` : "Enroll New Student"}</h3>
              </div>
              <button className="btn-modal-close" onClick={() => setIsModalOpen(false)}>✕</button>
            </div>

            <form onSubmit={handleFormSubmit} className="portal-form">
              <div className="form-group-custom">
                <label>Student Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Rahul Sharma"
                />
              </div>

              <div className="form-group-custom">
                <label>Email Address *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="rahul@example.com"
                />
              </div>

              <div className="form-row-2">
                <div className="form-group-custom">
                  <label>Course *</label>
                  <input
                    type="text"
                    required
                    value={formData.course}
                    onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                    placeholder="e.g. Computer Science"
                  />
                </div>
                <div className="form-group-custom">
                  <label>Age</label>
                  <input
                    type="number"
                    min="15"
                    max="99"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    placeholder="22"
                  />
                </div>
              </div>

              <div className="modal-footer-actions">
                <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-primary-glow" disabled={submitting}>
                  {submitting ? "Saving..." : editingStudent ? `Save Changes (#${editingStudent.id})` : "Enroll Student 🚀"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW DETAILS MODAL */}
      {viewingStudent && (
        <div className="portal-modal-overlay" onClick={() => setViewingStudent(null)}>
          <div className="portal-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-styled">
              <div>
                <span className="modal-tag">Student Details</span>
                <h3>Student ID #{viewingStudent.id}</h3>
              </div>
              <button className="btn-modal-close" onClick={() => setViewingStudent(null)}>✕</button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px", margin: "16px 0" }}>
              <div style={{ background: "rgba(15, 23, 42, 0.7)", padding: "12px 16px", borderRadius: "8px" }}>
                <span style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase" }}>Full Name</span>
                <div style={{ fontSize: "16px", fontWeight: "700", color: "#fff" }}>{viewingStudent.name}</div>
              </div>
              <div style={{ background: "rgba(15, 23, 42, 0.7)", padding: "12px 16px", borderRadius: "8px" }}>
                <span style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase" }}>Email Address</span>
                <div style={{ fontSize: "14px", color: "#cbd5e1" }}>{viewingStudent.email}</div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div style={{ background: "rgba(15, 23, 42, 0.7)", padding: "12px 16px", borderRadius: "8px" }}>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase" }}>Course</span>
                  <div style={{ fontSize: "14px", color: "#a5b4fc", fontWeight: "600" }}>{viewingStudent.course}</div>
                </div>
                <div style={{ background: "rgba(15, 23, 42, 0.7)", padding: "12px 16px", borderRadius: "8px" }}>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase" }}>Age</span>
                  <div style={{ fontSize: "14px", color: "#fff" }}>{viewingStudent.age ? `${viewingStudent.age} years` : "—"}</div>
                </div>
              </div>
            </div>

            <div className="modal-footer-actions">
              <button
                type="button"
                className="btn-primary-glow"
                onClick={() => {
                  const target = viewingStudent;
                  setViewingStudent(null);
                  handleOpenEditModal(target);
                }}
              >
                Edit Student #{viewingStudent.id}
              </button>
              <button type="button" className="btn-secondary" onClick={() => setViewingStudent(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {deleteTarget && (
        <div className="portal-modal-overlay" onClick={() => setDeleteTarget(null)}>
          <div className="portal-modal-content max-w-sm" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-styled">
              <div>
                <span className="modal-tag danger">Delete Confirmation</span>
                <h3>Delete Student #{deleteTarget.id}?</h3>
              </div>
              <button className="btn-modal-close" onClick={() => setDeleteTarget(null)}>✕</button>
            </div>

            <p style={{ color: "var(--text-secondary)", margin: "14px 0", fontSize: "14px" }}>
              Are you sure you want to delete Student <strong>ID #{deleteTarget.id}</strong> ({deleteTarget.name})?
            </p>

            <div className="modal-footer-actions">
              <button type="button" className="btn-secondary" onClick={() => setDeleteTarget(null)}>Cancel</button>
              <button type="button" className="btn-danger-solid" onClick={handleDeleteConfirm}>Delete ID #{deleteTarget.id}</button>
            </div>
          </div>
        </div>
      )}

      {/* GRADING MODAL */}
      {gradingModalItem && (
        <div className="portal-modal-overlay" onClick={() => setGradingModalItem(null)}>
          <div className="portal-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-styled">
              <div>
                <span className="modal-tag">Faculty Evaluation</span>
                <h3>Grade: {gradingModalItem.assignmentTitle}</h3>
              </div>
              <button className="btn-modal-close" onClick={() => setGradingModalItem(null)}>✕</button>
            </div>

            <form onSubmit={handleGradeSubmit} className="portal-form">
              <div className="form-group-custom">
                <label>Candidate</label>
                <input type="text" disabled value={`${gradingModalItem.studentName} (${gradingModalItem.userEmail})`} />
              </div>
              <div className="form-group-custom">
                <label>Submission Link</label>
                <a href={gradingModalItem.submissionUrl} target="_blank" rel="noopener noreferrer" className="link-repo mb-2 block">
                  🔗 {gradingModalItem.submissionUrl} ↗
                </a>
              </div>
              <div className="form-group-custom">
                <label>Score (0 - 100) *</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  required
                  value={gradeScore}
                  onChange={(e) => setGradeScore(parseInt(e.target.value, 10))}
                />
              </div>
              <div className="form-group-custom">
                <label>Mentor Feedback</label>
                <textarea
                  rows="3"
                  value={gradeFeedback}
                  onChange={(e) => setGradeFeedback(e.target.value)}
                />
              </div>
              <div className="modal-footer-actions">
                <button type="button" className="btn-secondary" onClick={() => setGradingModalItem(null)}>Cancel</button>
                <button type="submit" className="btn-primary-glow" disabled={isGrading}>
                  {isGrading ? "Saving..." : "Save Grade 🌟"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast Container */}
      <div className="toast-container">
        {toasts.map((t) => (
          <div key={t.id} className={`custom-toast toast-${t.type}`}>
            <div className="toast-title">{t.title}</div>
            <div className="toast-msg">{t.message}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);