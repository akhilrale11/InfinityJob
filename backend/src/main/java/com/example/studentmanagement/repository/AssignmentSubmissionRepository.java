package com.example.studentmanagement.repository;

import com.example.studentmanagement.entity.AssignmentSubmission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AssignmentSubmissionRepository extends JpaRepository<AssignmentSubmission, Long> {
    List<AssignmentSubmission> findByUserId(Long userId);
    List<AssignmentSubmission> findByUserEmail(String userEmail);
    List<AssignmentSubmission> findByAssignmentId(Long assignmentId);
    Optional<AssignmentSubmission> findByAssignmentIdAndUserId(Long assignmentId, Long userId);
    Optional<AssignmentSubmission> findByAssignmentIdAndUserEmail(Long assignmentId, String userEmail);
}
