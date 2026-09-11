package com.example.studentmanagement.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "courses")
public class Course {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String code;

    @Column(nullable = false)
    private String title;

    @Column(length = 1000)
    private String description;

    private String instructor;

    private Integer durationWeeks;

    private String level; // Beginner, Intermediate, Advanced

    private String tags; // e.g. "React, Node.js, Spring Boot"

    private String icon; // emoji or icon code

    private Integer placementRate; // e.g. 96 (%)

    private Double rating; // e.g. 4.9

    private Integer totalEnrolled;

    public Course() {
    }

    public Course(String code, String title, String description, String instructor, Integer durationWeeks, String level, String tags, String icon, Integer placementRate, Double rating, Integer totalEnrolled) {
        this.code = code;
        this.title = title;
        this.description = description;
        this.instructor = instructor;
        this.durationWeeks = durationWeeks;
        this.level = level;
        this.tags = tags;
        this.icon = icon;
        this.placementRate = placementRate;
        this.rating = rating;
        this.totalEnrolled = totalEnrolled;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
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

    public String getInstructor() {
        return instructor;
    }

    public void setInstructor(String instructor) {
        this.instructor = instructor;
    }

    public Integer getDurationWeeks() {
        return durationWeeks;
    }

    public void setDurationWeeks(Integer durationWeeks) {
        this.durationWeeks = durationWeeks;
    }

    public String getLevel() {
        return level;
    }

    public void setLevel(String level) {
        this.level = level;
    }

    public String getTags() {
        return tags;
    }

    public void setTags(String tags) {
        this.tags = tags;
    }

    public String getIcon() {
        return icon;
    }

    public void setIcon(String icon) {
        this.icon = icon;
    }

    public Integer getPlacementRate() {
        return placementRate;
    }

    public void setPlacementRate(Integer placementRate) {
        this.placementRate = placementRate;
    }

    public Double getRating() {
        return rating;
    }

    public void setRating(Double rating) {
        this.rating = rating;
    }

    public Integer getTotalEnrolled() {
        return totalEnrolled;
    }

    public void setTotalEnrolled(Integer totalEnrolled) {
        this.totalEnrolled = totalEnrolled;
    }
}
