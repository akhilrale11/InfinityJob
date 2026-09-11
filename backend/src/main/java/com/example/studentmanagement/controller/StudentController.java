package com.example.studentmanagement.controller;

import com.example.studentmanagement.entity.Student;
import com.example.studentmanagement.service.EmailService;
import com.example.studentmanagement.service.StudentService;
import com.example.studentmanagement.service.VerificationCodeService;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/students")
@CrossOrigin(origins = "http://localhost:5173")
public class StudentController {

    private final StudentService studentService;
    private final VerificationCodeService codeService;
    private final EmailService emailService;

    @Value("${app.verification.dev-mode:true}")
    private boolean devMode = true;

    public void setDevMode(boolean devMode) {
        this.devMode = devMode;
    }

    public StudentController(
            StudentService studentService,
            VerificationCodeService codeService,
            EmailService emailService
    ) {
        this.studentService = studentService;
        this.codeService = codeService;
        this.emailService = emailService;
    }


    // ==========================================
    // CREATE STUDENT
    // POST /api/students
    // ==========================================

    @PostMapping
    public ResponseEntity<Student> createStudent(
            @RequestBody Student student
    ) {

        Student createdStudent =
                studentService.createStudent(student);

        return ResponseEntity.ok(createdStudent);
    }


    // ==========================================
    // GET ALL STUDENTS
    // GET /api/students
    // ==========================================

    @GetMapping
    public ResponseEntity<List<Student>> getAllStudents() {

        return ResponseEntity.ok(
                studentService.getAllStudents()
        );
    }


    // ==========================================
    // GET STUDENT BY ID
    // GET /api/students/{id}
    // ==========================================

    @GetMapping("/{id}")
    public ResponseEntity<Student> getStudentById(
            @PathVariable Long id
    ) {

        return ResponseEntity.ok(
                studentService.getStudentById(id)
        );
    }


    // ==========================================
    // UPDATE STUDENT
    // PUT /api/students/{id}
    // ==========================================

    @PutMapping("/{id}")
    public ResponseEntity<Student> updateStudent(
            @PathVariable Long id,
            @RequestBody Student student
    ) {

        return ResponseEntity.ok(
                studentService.updateStudent(
                        id,
                        student
                )
        );
    }


    // ==========================================
    // DELETE STUDENT
    // DELETE /api/students/{id}
    // ==========================================

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteStudent(
            @PathVariable Long id
    ) {

        studentService.deleteStudent(id);

        return ResponseEntity.ok(
                "Student deleted successfully"
        );
    }


    // ==========================================
    // SEND 6-DIGIT OTP TO STUDENT EMAIL
    // POST /api/students/{id}/send-verification
    // ==========================================

    @PostMapping("/{id}/send-verification")
    public ResponseEntity<Map<String, Object>> sendStudentVerification(@PathVariable Long id) {
        Student student = studentService.getStudentById(id);
        String studentEmail = student.getEmail();

        String otp = codeService.generateVerificationCode(studentEmail);
        String formattedCode = VerificationCodeService.formatCode(otp);
        boolean sent = emailService.sendVerificationCode(
                studentEmail,
                otp,
                "Student Email 2FA Verification for " + student.getName()
        );

        Map<String, Object> resp = new HashMap<>();
        resp.put("success", true);
        resp.put("studentId", id);
        resp.put("studentName", student.getName());
        resp.put("email", studentEmail);
        resp.put("codeLength", 6);
        resp.put("emailSent", sent);
        resp.put("message", "6-digit 2FA verification code sent to " + studentEmail);

        if (devMode) {
            resp.put("devMode", true);
            resp.put("devCode", otp);
            resp.put("formattedPreview", formattedCode);
        }

        return ResponseEntity.ok(resp);
    }


    // ==========================================
    // VERIFY STUDENT EMAIL WITH 6-DIGIT OTP
    // POST /api/students/{id}/verify-email
    // ==========================================

    @PostMapping("/{id}/verify-email")
    public ResponseEntity<Map<String, Object>> verifyStudentEmail(
            @PathVariable Long id,
            @RequestBody Map<String, String> request
    ) {
        Student student = studentService.getStudentById(id);
        String code = request.get("code");

        if (code == null || code.trim().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Please enter the 6-digit verification code."
            ));
        }

        boolean isValid = codeService.verifyCode(student.getEmail(), code);
        if (!isValid) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                    "success", false,
                    "message", "Invalid or expired 6-digit verification code."
            ));
        }

        Student updatedStudent = studentService.verifyStudentEmail(id);

        Map<String, Object> resp = new HashMap<>();
        resp.put("success", true);
        resp.put("message", "Email for student " + student.getName() + " verified successfully!");
        resp.put("student", updatedStudent);

        return ResponseEntity.ok(resp);
    }
}