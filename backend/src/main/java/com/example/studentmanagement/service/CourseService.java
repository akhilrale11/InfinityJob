package com.example.studentmanagement.service;

import com.example.studentmanagement.entity.Course;
import com.example.studentmanagement.entity.Enrollment;
import com.example.studentmanagement.repository.CourseRepository;
import com.example.studentmanagement.repository.EnrollmentRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CourseService {

    private final CourseRepository courseRepository;
    private final EnrollmentRepository enrollmentRepository;

    public CourseService(CourseRepository courseRepository, EnrollmentRepository enrollmentRepository) {
        this.courseRepository = courseRepository;
        this.enrollmentRepository = enrollmentRepository;
    }

    public List<Course> getAllCourses() {
        return courseRepository.findAll();
    }

    public Course getCourseById(Long id) {
        return courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Course not found with id: " + id));
    }

    public Course createCourse(Course course) {
        return courseRepository.save(course);
    }

    public List<Enrollment> getEnrollmentsByUserId(Long userId) {
        return enrollmentRepository.findByUserId(userId);
    }

    public List<Enrollment> getEnrollmentsByUserEmail(String email) {
        return enrollmentRepository.findByUserEmail(email);
    }

    public List<Enrollment> getAllEnrollments() {
        return enrollmentRepository.findAll();
    }

    public Enrollment enrollStudent(Long userId, String userEmail, String studentName, Long courseId) {
        Course course = getCourseById(courseId);

        Optional<Enrollment> existing = enrollmentRepository.findByUserIdAndCourseId(userId, courseId);
        if (existing.isPresent()) {
            return existing.get();
        }

        Enrollment enrollment = new Enrollment(
                userId,
                userEmail,
                studentName,
                course.getId(),
                course.getCode(),
                course.getTitle(),
                0,
                "ACTIVE"
        );

        // increment course enrollment count
        course.setTotalEnrolled(course.getTotalEnrolled() != null ? course.getTotalEnrolled() + 1 : 1);
        courseRepository.save(course);

        return enrollmentRepository.save(enrollment);
    }

    public Enrollment updateEnrollmentProgress(Long enrollmentId, Integer progressPercent) {
        Enrollment enrollment = enrollmentRepository.findById(enrollmentId)
                .orElseThrow(() -> new RuntimeException("Enrollment not found: " + enrollmentId));

        enrollment.setProgressPercent(Math.min(100, Math.max(0, progressPercent)));
        if (progressPercent >= 100) {
            enrollment.setStatus("COMPLETED");
        }
        return enrollmentRepository.save(enrollment);
    }
}
