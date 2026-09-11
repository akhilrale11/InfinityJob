package com.example.studentmanagement.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "assignments")
public class Assignment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(length = 1500)
    private String description;

    private String courseCode;

    private String courseTitle;

    private String moduleName;

    private LocalDate dueDate;

    private Integer maxScore = 100;

    private String difficulty; // Easy, Medium, Hard

    private String starterCodeUrl;

    public Assignment() {
    }

    public Assignment(String title, String description, String courseCode, String courseTitle, String moduleName, LocalDate dueDate, Integer maxScore, String difficulty, String starterCodeUrl) {
        this.title = title;
        this.description = description;
        this.courseCode = courseCode;
        this.courseTitle = courseTitle;
        this.moduleName = moduleName;
        this.dueDate = dueDate;
        this.maxScore = maxScore != null ? maxScore : 100;
        this.difficulty = difficulty != null ? difficulty : "Medium";
        this.starterCodeUrl = starterCodeUrl;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getCourseCode() {
        return courseCode;
    }

    public void setCourseCode(String courseCode) {
        this.courseCode = courseCode;
    }

    public String getCourseTitle() {
        return courseTitle;
    }

    public void setCourseTitle(String courseTitle) {
        this.courseTitle = courseTitle;
    }

    public String getModuleName() {
        return moduleName;
    }

    public void setModuleName(String moduleName) {
        this.moduleName = moduleName;
    }

    public LocalDate getDueDate() {
        return dueDate;
    }

    public void setDueDate(LocalDate dueDate) {
        this.dueDate = dueDate;
    }

    public Integer getMaxScore() {
        return maxScore;
    }

    public void setMaxScore(Integer maxScore) {
        this.maxScore = maxScore;
    }

    public String getDifficulty() {
        return difficulty;
    }

    public void setDifficulty(String difficulty) {
        this.difficulty = difficulty;
    }

    public String getStarterCodeUrl() {
        return starterCodeUrl;
    }

    public void setStarterCodeUrl(String starterCodeUrl) {
        this.starterCodeUrl = starterCodeUrl;
    }
}
