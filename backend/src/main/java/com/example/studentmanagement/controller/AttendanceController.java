package com.example.studentmanagement.controller;

import com.example.studentmanagement.entity.AttendanceRecord;
import com.example.studentmanagement.service.AttendanceService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/attendance")
@CrossOrigin(origins = "http://localhost:5173")
public class AttendanceController {

    private final AttendanceService attendanceService;

    public AttendanceController(AttendanceService attendanceService) {
        this.attendanceService = attendanceService;
    }

    @GetMapping
    public ResponseEntity<List<AttendanceRecord>> getAttendance(
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) String email,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        if (userId != null) {
            return ResponseEntity.ok(attendanceService.getAttendanceByUserId(userId));
        }
        if (email != null && !email.isBlank()) {
            return ResponseEntity.ok(attendanceService.getAttendanceByUserEmail(email));
        }
        if (date != null) {
            return ResponseEntity.ok(attendanceService.getAttendanceByDate(date));
        }
        return ResponseEntity.ok(attendanceService.getAllAttendance());
    }

    @PostMapping("/mark-today")
    public ResponseEntity<AttendanceRecord> markTodayAttendance(@RequestBody Map<String, Object> req) {
        Long userId = req.get("userId") != null ? Long.valueOf(req.get("userId").toString()) : 1L;
        String email = req.get("userEmail") != null ? req.get("userEmail").toString() : "student@infinityjob.in";
        String name = req.get("studentName") != null ? req.get("studentName").toString() : "Student";
        String courseName = req.get("courseName") != null ? req.get("courseName").toString() : null;
        String sessionType = req.get("sessionType") != null ? req.get("sessionType").toString() : "LIVE_LECTURE";
        String notes = req.get("notes") != null ? req.get("notes").toString() : null;

        AttendanceRecord record = attendanceService.markTodayAttendance(userId, email, name, courseName, sessionType, notes);
        return ResponseEntity.ok(record);
    }

    @PostMapping
    public ResponseEntity<AttendanceRecord> createAttendance(@RequestBody AttendanceRecord record) {
        return ResponseEntity.ok(attendanceService.markCustomAttendance(record));
    }

    @GetMapping("/stats/{userId}")
    public ResponseEntity<Map<String, Object>> getStudentStats(@PathVariable Long userId) {
        return ResponseEntity.ok(attendanceService.getStudentAttendanceStats(userId));
    }
}
