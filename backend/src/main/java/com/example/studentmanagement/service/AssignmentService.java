package com.example.studentmanagement.service;

import com.example.studentmanagement.entity.Assignment;
import com.example.studentmanagement.entity.AssignmentSubmission;
import com.example.studentmanagement.repository.AssignmentRepository;
import com.example.studentmanagement.repository.AssignmentSubmissionRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class AssignmentService {

    private final AssignmentRepository assignmentRepository;
    private final AssignmentSubmissionRepository submissionRepository;

    public AssignmentService(AssignmentRepository assignmentRepository, AssignmentSubmissionRepository submissionRepository) {
        this.assignmentRepository = assignmentRepository;
        this.submissionRepository = submissionRepository;
    }

    public List<Assignment> getAllAssignments() {
        return assignmentRepository.findAll();
    }

    public List<Assignment> getAssignmentsByCourse(String courseCode) {
        return assignmentRepository.findByCourseCode(courseCode);
    }

    public Assignment createAssignment(Assignment assignment) {
        return assignmentRepository.save(assignment);
    }

    public List<AssignmentSubmission> getAllSubmissions() {
        return submissionRepository.findAll();
    }

    public List<AssignmentSubmission> getSubmissionsByUserId(Long userId) {
        return submissionRepository.findByUserId(userId);
    }

    public List<AssignmentSubmission> getSubmissionsByUserEmail(String email) {
        return submissionRepository.findByUserEmail(email);
    }

    public AssignmentSubmission submitAssignment(Long assignmentId, Long userId, String studentName, String userEmail, String submissionUrl, String comments) {
        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new RuntimeException("Assignment not found with id: " + assignmentId));

        Optional<AssignmentSubmission> existing = submissionRepository.findByAssignmentIdAndUserId(assignmentId, userId);
        AssignmentSubmission submission;
        if (existing.isPresent()) {
            submission = existing.get();
            submission.setSubmissionUrl(submissionUrl);
            submission.setComments(comments);
            submission.setSubmittedAt(LocalDateTime.now());
            submission.setStatus("SUBMITTED");
        } else {
            submission = new AssignmentSubmission(
                    assignmentId,
                    assignment.getTitle(),
                    assignment.getCourseCode(),
                    userId,
                    studentName,
                    userEmail,
                    submissionUrl,
                    comments
            );
        }
        return submissionRepository.save(submission);
    }

    public AssignmentSubmission gradeSubmission(Long submissionId, Integer score, String feedback) {
        AssignmentSubmission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new RuntimeException("Submission not found: " + submissionId));

        submission.setScore(score);
        submission.setFeedback(feedback);
        submission.setStatus("GRADED");
        return submissionRepository.save(submission);
    }
}
