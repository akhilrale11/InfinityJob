package com.example.studentmanagement.service;

import com.example.studentmanagement.entity.CourseApplication;
import com.example.studentmanagement.repository.CourseApplicationRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CourseApplicationService {

    private final CourseApplicationRepository applicationRepository;

    public CourseApplicationService(CourseApplicationRepository applicationRepository) {
        this.applicationRepository = applicationRepository;
    }

    public List<CourseApplication> getAllApplications() {
        return applicationRepository.findAllByOrderByAppliedAtDesc();
    }

    public List<CourseApplication> getApplicationsByEmail(String email) {
        return applicationRepository.findByEmailOrderByAppliedAtDesc(email);
    }

    public CourseApplication submitApplication(CourseApplication application) {
        if (application.getStudentName() == null || application.getStudentName().isBlank()) {
            throw new IllegalArgumentException("Student name is required.");
        }
        if (application.getEmail() == null || application.getEmail().isBlank()) {
            throw new IllegalArgumentException("Email is required.");
        }
        if (application.getTargetCourse() == null || application.getTargetCourse().isBlank()) {
            throw new IllegalArgumentException("Target course is required.");
        }
        if (application.getStatus() == null) {
            application.setStatus("PENDING");
        }
        return applicationRepository.save(application);
    }

    public CourseApplication updateApplicationStatus(Long applicationId, String status, String adminNotes) {
        CourseApplication app = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Application not found: " + applicationId));

        if (status != null && !status.isBlank()) {
            app.setStatus(status.toUpperCase());
        }
        if (adminNotes != null) {
            app.setAdminNotes(adminNotes);
        }
        return applicationRepository.save(app);
    }
}
