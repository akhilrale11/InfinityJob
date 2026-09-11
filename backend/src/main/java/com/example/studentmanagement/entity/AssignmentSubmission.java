package com.example.studentmanagement.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "assignment_submissions")
public class AssignmentSubmission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long assignmentId;

    private String assignmentTitle;

    private String courseCode;

    @Column(nullable = false)
    private Long userId;

    private String studentName;

    private String userEmail;

    @Column(length = 1000)
    private String submissionUrl; // GitHub repo, PR, or hosted app link

    @Column(length = 2000)
    private String comments;

    private LocalDateTime submittedAt = LocalDateTime.now();

    private Integer score; // e.g. 95 out of 100

    @Column(length = 1000)
    private String feedback; // Mentor/Admin feedback

    private String status = "SUBMITTED"; // SUBMITTED, REVIEWED, GRADED, RESUBMISSION_REQUIRED

    public AssignmentSubmission() {
    }

    public AssignmentSubmission(Long assignmentId, String assignmentTitle, String courseCode, Long userId, String studentName, String userEmail, String submissionUrl, String comments) {
        this.assignmentId = assignmentId;
        this.assignmentTitle = assignmentTitle;
        this.courseCode = courseCode;
        this.userId = userId;
        this.studentName = studentName;
        this.userEmail = userEmail;
        this.submissionUrl = submissionUrl;
        this.comments = comments;
        this.submittedAt = LocalDateTime.now();
        this.status = "SUBMITTED";
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getAssignmentId() {
        return assignmentId;
    }

    public void setAssignmentId(Long assignmentId) {
        this.assignmentId = assignmentId;
    }

    public String getAssignmentTitle() {
        return assignmentTitle;
    }

    public void setAssignmentTitle(String assignmentTitle) {
        this.assignmentTitle = assignmentTitle;
    }

    public String getCourseCode() {
        return courseCode;
    }

    public void setCourseCode(String courseCode) {
        this.courseCode = courseCode;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getStudentName() {
        return studentName;
    }

    public void setStudentName(String studentName) {
        this.studentName = studentName;
    }

    public String getUserEmail() {
        return userEmail;
    }

    public void setUserEmail(String userEmail) {
        this.userEmail = userEmail;
    }

    public String getSubmissionUrl() {
        return submissionUrl;
    }

    public void setSubmissionUrl(String submissionUrl) {
        this.submissionUrl = submissionUrl;
    }

    public String getComments() {
        return comments;
    }

    public void setComments(String comments) {
        this.comments = comments;
    }

    public LocalDateTime getSubmittedAt() {
        return submittedAt;
    }

    public void setSubmittedAt(LocalDateTime submittedAt) {
        this.submittedAt = submittedAt;
    }

    public Integer getScore() {
        return score;
    }

    public void setScore(Integer score) {
        this.score = score;
    }

    public String getFeedback() {
        return feedback;
    }

    public void setFeedback(String feedback) {
        this.feedback = feedback;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
