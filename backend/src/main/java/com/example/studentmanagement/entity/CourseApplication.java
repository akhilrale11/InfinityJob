package com.example.studentmanagement.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "course_applications")
public class CourseApplication {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String studentName;

    @Column(nullable = false)
    private String email;

    private String phone;

    @Column(nullable = false)
    private String targetCourse;

    private String education; // e.g. "B.Tech CSE, 2024 Graduate"

    private String graduationYear;

    private String codingExperience; // "Beginner", "Intermediate", "Advanced"

    @Column(length = 1000)
    private String goals;

    private LocalDateTime appliedAt = LocalDateTime.now();

    private String status = "PENDING"; // PENDING, UNDER_REVIEW, APPROVED, REJECTED

    private String adminNotes;

    public CourseApplication() {
    }

    public CourseApplication(String studentName, String email, String phone, String targetCourse, String education, String graduationYear, String codingExperience, String goals) {
        this.studentName = studentName;
        this.email = email;
        this.phone = phone;
        this.targetCourse = targetCourse;
        this.education = education;
        this.graduationYear = graduationYear;
        this.codingExperience = codingExperience;
        this.goals = goals;
        this.appliedAt = LocalDateTime.now();
        this.status = "PENDING";
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getStudentName() {
        return studentName;
    }

    public void setStudentName(String studentName) {
        this.studentName = studentName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getTargetCourse() {
        return targetCourse;
    }

    public void setTargetCourse(String targetCourse) {
        this.targetCourse = targetCourse;
    }

    public String getEducation() {
        return education;
    }

    public void setEducation(String education) {
        this.education = education;
    }

    public String getGraduationYear() {
        return graduationYear;
    }

    public void setGraduationYear(String graduationYear) {
        this.graduationYear = graduationYear;
    }

    public String getCodingExperience() {
        return codingExperience;
    }

    public void setCodingExperience(String codingExperience) {
        this.codingExperience = codingExperience;
    }

    public String getGoals() {
        return goals;
    }

    public void setGoals(String goals) {
        this.goals = goals;
    }

    public LocalDateTime getAppliedAt() {
        return appliedAt;
    }

    public void setAppliedAt(LocalDateTime appliedAt) {
        this.appliedAt = appliedAt;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getAdminNotes() {
        return adminNotes;
    }

    public void setAdminNotes(String adminNotes) {
        this.adminNotes = adminNotes;
    }
}
