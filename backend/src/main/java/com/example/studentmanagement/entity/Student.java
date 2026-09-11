package com.example.studentmanagement.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "students")
public class Student {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String course;


    private Integer age;

    @Column(nullable = false, columnDefinition = "boolean default false")
    private Boolean emailVerified = false;

    // Default constructor
    public Student() {
    }

    // Parameterized constructor
    public Student(
            String name,
            String email,
            String course,
            Integer age
    ) {
        this.name = name;
        this.email = email;
        this.course = course;
        this.age = age;
        this.emailVerified = false;
    }

    public Student(
            String name,
            String email,
            String course,
            Integer age,
            Boolean emailVerified
    ) {
        this.name = name;
        this.email = email;
        this.course = course;
        this.age = age;
        this.emailVerified = emailVerified != null ? emailVerified : false;
    }

    // Getter and Setter for ID

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    // Getter and Setter for Name

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    // Getter and Setter for Email

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    // Getter and Setter for Course

    public String getCourse() {
        return course;
    }

    public void setCourse(String course) {
        this.course = course;
    }

    // Getter and Setter for Age

    public Integer getAge() {
        return age;
    }

    public void setAge(Integer age) {
        this.age = age;
    }

    // Getter and Setter for EmailVerified

    public Boolean getEmailVerified() {
        return emailVerified != null ? emailVerified : false;
    }

    public Boolean isEmailVerified() {
        return emailVerified != null ? emailVerified : false;
    }

    public void setEmailVerified(Boolean emailVerified) {
        this.emailVerified = emailVerified != null ? emailVerified : false;
    }
}