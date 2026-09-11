package com.example.studentmanagement.controller;

import com.example.studentmanagement.entity.CourseApplication;
import com.example.studentmanagement.service.CourseApplicationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/applications")
@CrossOrigin(origins = "http://localhost:5173")
public class CourseApplicationController {

    private final CourseApplicationService applicationService;

    public CourseApplicationController(CourseApplicationService applicationService) {
        this.applicationService = applicationService;
    }

    @GetMapping
    public ResponseEntity<List<CourseApplication>> getApplications(@RequestParam(required = false) String email) {
        if (email != null && !email.isBlank()) {
            return ResponseEntity.ok(applicationService.getApplicationsByEmail(email));
        }
        return ResponseEntity.ok(applicationService.getAllApplications());
    }

    @PostMapping
    public ResponseEntity<CourseApplication> submitApplication(@RequestBody CourseApplication application) {
        CourseApplication saved = applicationService.submitApplication(application);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<CourseApplication> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> req) {
        String status = req.get("status");
        String adminNotes = req.get("adminNotes");
        CourseApplication updated = applicationService.updateApplicationStatus(id, status, adminNotes);
        return ResponseEntity.ok(updated);
    }
}
