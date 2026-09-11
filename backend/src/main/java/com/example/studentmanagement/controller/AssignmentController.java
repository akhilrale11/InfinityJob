package com.example.studentmanagement.controller;

import com.example.studentmanagement.entity.Assignment;
import com.example.studentmanagement.entity.AssignmentSubmission;
import com.example.studentmanagement.service.AssignmentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/assignments")
@CrossOrigin(origins = "http://localhost:5173")
public class AssignmentController {

    private final AssignmentService assignmentService;

    public AssignmentController(AssignmentService assignmentService) {
        this.assignmentService = assignmentService;
    }

    // --- Assignments Catalog ---
    @GetMapping
    public ResponseEntity<List<Assignment>> getAllAssignments(@RequestParam(required = false) String courseCode) {
        if (courseCode != null && !courseCode.isBlank()) {
            return ResponseEntity.ok(assignmentService.getAssignmentsByCourse(courseCode));
        }
        return ResponseEntity.ok(assignmentService.getAllAssignments());
    }

    @PostMapping
    public ResponseEntity<Assignment> createAssignment(@RequestBody Assignment assignment) {
        return ResponseEntity.ok(assignmentService.createAssignment(assignment));
    }

    // --- Submissions ---
    @GetMapping("/submissions")
    public ResponseEntity<List<AssignmentSubmission>> getAllSubmissions(
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) String email) {
        if (userId != null) {
            return ResponseEntity.ok(assignmentService.getSubmissionsByUserId(userId));
        }
        if (email != null && !email.isBlank()) {
            return ResponseEntity.ok(assignmentService.getSubmissionsByUserEmail(email));
        }
        return ResponseEntity.ok(assignmentService.getAllSubmissions());
    }

    @PostMapping("/submit")
    public ResponseEntity<AssignmentSubmission> submitAssignment(@RequestBody Map<String, Object> req) {
        Long assignmentId = Long.valueOf(req.get("assignmentId").toString());
        Long userId = req.get("userId") != null ? Long.valueOf(req.get("userId").toString()) : 1L;
        String studentName = req.get("studentName") != null ? req.get("studentName").toString() : "Student";
        String userEmail = req.get("userEmail") != null ? req.get("userEmail").toString() : "student@infinityjob.in";
        String submissionUrl = req.get("submissionUrl") != null ? req.get("submissionUrl").toString() : "";
        String comments = req.get("comments") != null ? req.get("comments").toString() : "";

        AssignmentSubmission submission = assignmentService.submitAssignment(assignmentId, userId, studentName, userEmail, submissionUrl, comments);
        return ResponseEntity.ok(submission);
    }

    @PutMapping("/submissions/{id}/grade")
    public ResponseEntity<AssignmentSubmission> gradeSubmission(@PathVariable Long id, @RequestBody Map<String, Object> req) {
        Integer score = req.get("score") != null ? Integer.valueOf(req.get("score").toString()) : 100;
        String feedback = req.get("feedback") != null ? req.get("feedback").toString() : "Well done!";

        AssignmentSubmission graded = assignmentService.gradeSubmission(id, score, feedback);
        return ResponseEntity.ok(graded);
    }
}
