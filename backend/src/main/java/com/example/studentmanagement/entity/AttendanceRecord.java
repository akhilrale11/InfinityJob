package com.example.studentmanagement.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "attendance_records")
public class AttendanceRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    private String userEmail;

    private String studentName;

    private String courseName;

    @Column(nullable = false)
    private LocalDate attendanceDate;

    private LocalTime markedTime;

    @Column(nullable = false)
    private String status; // PRESENT, ABSENT, LATE, EXCUSED

    private String sessionType; // LIVE_LECTURE, CODING_LAB, MENTORSHIP

    private String notes;

    public AttendanceRecord() {
    }

    public AttendanceRecord(Long userId, String userEmail, String studentName, String courseName, LocalDate attendanceDate, LocalTime markedTime, String status, String sessionType, String notes) {
        this.userId = userId;
        this.userEmail = userEmail;
        this.studentName = studentName;
        this.courseName = courseName;
        this.attendanceDate = attendanceDate;
        this.markedTime = markedTime != null ? markedTime : LocalTime.now();
        this.status = status != null ? status : "PRESENT";
        this.sessionType = sessionType != null ? sessionType : "LIVE_LECTURE";
        this.notes = notes;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getUserEmail() {
        return userEmail;
    }

    public void setUserEmail(String userEmail) {
        this.userEmail = userEmail;
    }

    public String getStudentName() {
        return studentName;
    }

    public void setStudentName(String studentName) {
        this.studentName = studentName;
    }

    public String getCourseName() {
        return courseName;
    }

    public void setCourseName(String courseName) {
        this.courseName = courseName;
    }

    public LocalDate getAttendanceDate() {
        return attendanceDate;
    }

    public void setAttendanceDate(LocalDate attendanceDate) {
        this.attendanceDate = attendanceDate;
    }

    public LocalTime getMarkedTime() {
        return markedTime;
    }

    public void setMarkedTime(LocalTime markedTime) {
        this.markedTime = markedTime;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getSessionType() {
        return sessionType;
    }

    public void setSessionType(String sessionType) {
        this.sessionType = sessionType;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
