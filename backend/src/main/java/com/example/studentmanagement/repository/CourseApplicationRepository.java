package com.example.studentmanagement.repository;

import com.example.studentmanagement.entity.CourseApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CourseApplicationRepository extends JpaRepository<CourseApplication, Long> {
    List<CourseApplication> findByEmailOrderByAppliedAtDesc(String email);
    List<CourseApplication> findAllByOrderByAppliedAtDesc();
}
