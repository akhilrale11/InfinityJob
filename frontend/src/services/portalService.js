const API_BASE = "http://localhost:8080/api";

export async function fetchCourses() {
  const res = await fetch(`${API_BASE}/courses`);
  if (!res.ok) throw new Error("Failed to fetch courses");
  return res.json();
}

export async function fetchEnrollments(userId, email) {
  let url = `${API_BASE}/enrollments`;
  if (userId) url += `?userId=${userId}`;
  else if (email) url += `?email=${encodeURIComponent(email)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch enrollments");
  return res.json();
}

export async function enrollInCourse(userId, userEmail, studentName, courseId) {
  const res = await fetch(`${API_BASE}/enrollments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, userEmail, studentName, courseId }),
  });
  if (!res.ok) throw new Error("Failed to enroll in course");
  return res.json();
}

export async function updateEnrollmentProgress(enrollmentId, progressPercent) {
  const res = await fetch(`${API_BASE}/enrollments/${enrollmentId}/progress`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ progressPercent }),
  });
  if (!res.ok) throw new Error("Failed to update progress");
  return res.json();
}

export async function fetchAttendance(userId, email) {
  let url = `${API_BASE}/attendance`;
  if (userId) url += `?userId=${userId}`;
  else if (email) url += `?email=${encodeURIComponent(email)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch attendance");
  return res.json();
}

export async function fetchAttendanceStats(userId) {
  const res = await fetch(`${API_BASE}/attendance/stats/${userId}`);
  if (!res.ok) throw new Error("Failed to fetch attendance stats");
  return res.json();
}

export async function markTodayAttendance(userId, userEmail, studentName, courseName, sessionType, notes) {
  const res = await fetch(`${API_BASE}/attendance/mark-today`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, userEmail, studentName, courseName, sessionType, notes }),
  });
  if (!res.ok) throw new Error("Failed to mark attendance");
  return res.json();
}

export async function fetchAssignments(courseCode) {
  let url = `${API_BASE}/assignments`;
  if (courseCode) url += `?courseCode=${encodeURIComponent(courseCode)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch assignments");
  return res.json();
}

export async function fetchSubmissions(userId, email) {
  let url = `${API_BASE}/assignments/submissions`;
  if (userId) url += `?userId=${userId}`;
  else if (email) url += `?email=${encodeURIComponent(email)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch submissions");
  return res.json();
}

export async function submitAssignment(assignmentId, userId, studentName, userEmail, submissionUrl, comments) {
  const res = await fetch(`${API_BASE}/assignments/submit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ assignmentId, userId, studentName, userEmail, submissionUrl, comments }),
  });
  if (!res.ok) throw new Error("Failed to submit assignment");
  return res.json();
}

export async function gradeSubmission(submissionId, score, feedback) {
  const res = await fetch(`${API_BASE}/assignments/submissions/${submissionId}/grade`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ score, feedback }),
  });
  if (!res.ok) throw new Error("Failed to grade submission");
  return res.json();
}

export async function fetchApplications(email) {
  let url = `${API_BASE}/applications`;
  if (email) url += `?email=${encodeURIComponent(email)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch applications");
  return res.json();
}

export async function submitCourseApplication(applicationData) {
  const res = await fetch(`${API_BASE}/applications`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(applicationData),
  });
  if (!res.ok) throw new Error("Failed to submit application");
  return res.json();
}

export async function updateApplicationStatus(applicationId, status, adminNotes) {
  const res = await fetch(`${API_BASE}/applications/${applicationId}/status`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status, adminNotes }),
  });
  if (!res.ok) throw new Error("Failed to update application status");
  return res.json();
}
