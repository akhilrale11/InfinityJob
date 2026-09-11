package com.example.studentmanagement.controller;

import com.example.studentmanagement.entity.Course;
import com.example.studentmanagement.entity.Enrollment;
import com.example.studentmanagement.service.CourseService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:5173")
public class CourseController {

    private final CourseService courseService;

    public CourseController(CourseService courseService) {
        this.courseService = courseService;
    }

    // --- Course Catalog ---
    @GetMapping("/courses")
    public ResponseEntity<List<Course>> getAllCourses() {
        return ResponseEntity.ok(courseService.getAllCourses());
    }

    @GetMapping("/courses/{id}")
    public ResponseEntity<Course> getCourseById(@PathVariable Long id) {
        return ResponseEntity.ok(courseService.getCourseById(id));
    }

    @PostMapping("/courses")
    public ResponseEntity<Course> createCourse(@RequestBody Course course) {
        return ResponseEntity.ok(courseService.createCourse(course));
    }

    // --- Enrollments ---
    @GetMapping("/enrollments")
    public ResponseEntity<List<Enrollment>> getAllEnrollments(@RequestParam(required = false) Long userId,
                                                              @RequestParam(required = false) String email) {
        if (userId != null) {
            return ResponseEntity.ok(courseService.getEnrollmentsByUserId(userId));
        }
        if (email != null && !email.isBlank()) {
            return ResponseEntity.ok(courseService.getEnrollmentsByUserEmail(email));
        }
        return ResponseEntity.ok(courseService.getAllEnrollments());
    }

    @PostMapping("/enrollments")
    public ResponseEntity<Enrollment> enrollStudent(@RequestBody Map<String, Object> req) {
        Long userId = req.get("userId") != null ? Long.valueOf(req.get("userId").toString()) : 1L;
        String email = req.get("userEmail") != null ? req.get("userEmail").toString() : "";
        String studentName = req.get("studentName") != null ? req.get("studentName").toString() : "";
        Long courseId = Long.valueOf(req.get("courseId").toString());

        Enrollment enrollment = courseService.enrollStudent(userId, email, studentName, courseId);
        return ResponseEntity.ok(enrollment);
    }

    @PutMapping("/enrollments/{id}/progress")
    public ResponseEntity<Enrollment> updateProgress(@PathVariable Long id, @RequestBody Map<String, Integer> req) {
        Integer progress = req.getOrDefault("progressPercent", 0);
        return ResponseEntity.ok(courseService.updateEnrollmentProgress(id, progress));
    }
}
