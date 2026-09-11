package com.example.studentmanagement.repository;

import com.example.studentmanagement.entity.AttendanceRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceRecordRepository extends JpaRepository<AttendanceRecord, Long> {
    List<AttendanceRecord> findByUserIdOrderByAttendanceDateDesc(Long userId);
    List<AttendanceRecord> findByUserEmailOrderByAttendanceDateDesc(String userEmail);
    List<AttendanceRecord> findByAttendanceDateOrderByStudentNameAsc(LocalDate date);
    Optional<AttendanceRecord> findByUserIdAndAttendanceDate(Long userId, LocalDate date);
    Optional<AttendanceRecord> findByUserEmailAndAttendanceDate(String userEmail, LocalDate date);
}
