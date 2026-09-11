package com.example.studentmanagement.repository;

import com.example.studentmanagement.entity.Enrollment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EnrollmentRepository extends JpaRepository<Enrollment, Long> {
    List<Enrollment> findByUserId(Long userId);
    List<Enrollment> findByUserEmail(String userEmail);
    Optional<Enrollment> findByUserIdAndCourseId(Long userId, Long courseId);
    Optional<Enrollment> findByUserEmailAndCourseCode(String userEmail, String courseCode);
}
