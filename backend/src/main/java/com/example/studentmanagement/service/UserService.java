package com.example.studentmanagement.service;

import com.example.studentmanagement.entity.User;
import com.example.studentmanagement.repository.UserRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @PostConstruct
    public void initDefaultUsers() {
        if (userRepository.findByUsername("admin").isEmpty()) {
            userRepository.save(new User(
                    "admin",
                    "admin@infinityjob.in",
                    "+919876543210",
                    "admin123",
                    "System Administrator",
                    "ADMIN"
            ));
        }

        if (userRepository.findByUsername("faculty").isEmpty()) {
            userRepository.save(new User(
                    "faculty",
                    "faculty@infinityjob.in",
                    "+919876543211",
                    "admin123",
                    "Faculty Lead",
                    "FACULTY"
            ));
        }

        if (userRepository.findByUsername("student").isEmpty()) {
            userRepository.save(new User(
                    "student",
                    "student@infinityjob.in",
                    "+919876543212",
                    "student123",
                    "Rahul Sharma",
                    "STUDENT"
            ));
        }
    }

    /**
     * Registers a new user account with duplicate username/email checks.
     */
    public User registerUser(User user) {
        if (user.getUsername() == null || user.getUsername().trim().isBlank()) {
            throw new IllegalArgumentException("Username is required.");
        }
        if (user.getEmail() == null || user.getEmail().trim().isBlank()) {
            throw new IllegalArgumentException("Email address is required.");
        }
        if (user.getPassword() == null || user.getPassword().trim().length() < 4) {
            throw new IllegalArgumentException("Password must be at least 4 characters long.");
        }

        String username = user.getUsername().trim();
        String email = user.getEmail().trim().toLowerCase();

        if (userRepository.findByUsername(username).isPresent()) {
            throw new RuntimeException("Username '" + username + "' is already taken. Please choose another.");
        }

        if (userRepository.findByEmail(email).isPresent()) {
            throw new RuntimeException("Email '" + email + "' is already registered. Please sign in or use another email.");
        }

        user.setUsername(username);
        user.setEmail(email);
        if (user.getFullName() != null) user.setFullName(user.getFullName().trim());
        if (user.getMobileNumber() != null) user.setMobileNumber(user.getMobileNumber().trim());
        if (user.getRole() == null || user.getRole().isBlank()) {
            user.setRole("STUDENT");
        }

        return userRepository.save(user);
    }

    /**
     * Authenticates user using username or email and password.
     */
    public User authenticate(String usernameOrEmail, String password) {
        if (usernameOrEmail == null || password == null) {
            throw new IllegalArgumentException("Username/email and password are required.");
        }

        String identifier = usernameOrEmail.trim();
        Optional<User> userOpt = userRepository.findByUsername(identifier);
        if (userOpt.isEmpty()) {
            userOpt = userRepository.findByEmail(identifier.toLowerCase());
        }

        if (userOpt.isEmpty()) {
            throw new RuntimeException("No account found with username/email: " + identifier);
        }

        User user = userOpt.get();
        if (!user.getPassword().equals(password)) {
            throw new RuntimeException("Incorrect password. Please try again or use 'Forgot Password'.");
        }

        return user;
    }

    /**
     * Finds a user by username, email, or mobile number.
     */
    public Optional<User> findByIdentifier(String identifier) {
        if (identifier == null || identifier.isBlank()) {
            return Optional.empty();
        }
        String clean = identifier.trim();

        // Check username
        Optional<User> user = userRepository.findByUsername(clean);
        if (user.isPresent()) return user;

        // Check email
        user = userRepository.findByEmail(clean.toLowerCase());
        if (user.isPresent()) return user;

        // Check mobile number (stripping formatting)
        user = userRepository.findByMobileNumber(clean);
        if (user.isPresent()) return user;

        // Try clean digits for mobile number
        String digitsOnly = clean.replaceAll("[^0-9+]", "");
        if (!digitsOnly.isEmpty()) {
            user = userRepository.findByMobileNumber(digitsOnly);
        }

        return user;
    }

    /**
     * Updates the password for the specified user.
     */
    public User updatePassword(String identifier, String newPassword) {
        User user = findByIdentifier(identifier)
                .orElseThrow(() -> new RuntimeException("User not found for identifier: " + identifier));

        user.setPassword(newPassword);
        return userRepository.save(user);
    }
}
