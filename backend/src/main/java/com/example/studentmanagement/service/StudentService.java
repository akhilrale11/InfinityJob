package com.example.studentmanagement.service;

import com.example.studentmanagement.entity.Student;
import com.example.studentmanagement.repository.StudentRepository;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class StudentService {

    private final StudentRepository studentRepository;

    public StudentService(StudentRepository studentRepository) {
        this.studentRepository = studentRepository;
    }

    // =========================
    // CREATE
    // =========================

    public Student createStudent(Student student) {

        return studentRepository.save(student);
    }


    // =========================
    // READ ALL
    // =========================

    public List<Student> getAllStudents() {

        return studentRepository.findAll();
    }


    // =========================
    // READ BY ID
    // =========================

    public Student getStudentById(Long id) {

        return studentRepository
                .findById(id)
                .orElseThrow(
                        () -> new RuntimeException(
                                "Student not found with ID: " + id
                        )
                );
    }


    // =========================
    // UPDATE
    // =========================

    public Student updateStudent(
            Long id,
            Student studentDetails
    ) {

        Student existingStudent =
                studentRepository
                        .findById(id)
                        .orElseThrow(
                                () -> new RuntimeException(
                                        "Student not found with ID: " + id
                                )
                        );

        existingStudent.setName(
                studentDetails.getName()
        );

        // If email has changed, reset verification status unless explicitly provided
        if (!existingStudent.getEmail().equalsIgnoreCase(studentDetails.getEmail())) {
            existingStudent.setEmailVerified(studentDetails.getEmailVerified() != null ? studentDetails.getEmailVerified() : false);
        } else if (studentDetails.getEmailVerified() != null) {
            existingStudent.setEmailVerified(studentDetails.getEmailVerified());
        }

        existingStudent.setEmail(
                studentDetails.getEmail()
        );

        existingStudent.setCourse(
                studentDetails.getCourse()
        );

        existingStudent.setAge(
                studentDetails.getAge()
        );

        return studentRepository.save(existingStudent);
    }


    // =========================
    // VERIFY EMAIL
    // =========================

    public Student verifyStudentEmail(Long id) {
        Student existingStudent =
                studentRepository
                        .findById(id)
                        .orElseThrow(
                                () -> new RuntimeException(
                                        "Student not found with ID: " + id
                                )
                        );

        existingStudent.setEmailVerified(true);
        return studentRepository.save(existingStudent);
    }


    // =========================
    // DELETE
    // =========================

    public void deleteStudent(Long id) {

        if (!studentRepository.existsById(id)) {

            throw new RuntimeException(
                    "Student not found with ID: " + id
            );
        }

        studentRepository.deleteById(id);
    }
}