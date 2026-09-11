package com.example.studentmanagement.controller;

import com.example.studentmanagement.entity.User;
import com.example.studentmanagement.service.EmailService;
import com.example.studentmanagement.service.UserService;
import com.example.studentmanagement.service.VerificationCodeService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.regex.Pattern;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    private static final Pattern EMAIL_REGEX = Pattern.compile(
            "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$"
    );

    private final VerificationCodeService codeService;
    private final EmailService emailService;
    private final UserService userService;

    @Value("${app.verification.dev-mode:true}")
    private boolean devMode = true;

    @Value("${app.verification.code-length:6}")
    private int codeLength = 6;

    public void setDevMode(boolean devMode) {
        this.devMode = devMode;
    }

    public void setCodeLength(int codeLength) {
        this.codeLength = codeLength;
    }

    public AuthController(VerificationCodeService codeService, EmailService emailService, UserService userService) {
        this.codeService = codeService;
        this.emailService = emailService;
        this.userService = userService;
    }

    // ==========================================
    // USER REGISTRATION
    // POST /api/auth/register
    // ==========================================
    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> registerUser(@RequestBody Map<String, String> request) {
        String fullName = request.get("fullName");
        String username = request.get("username");
        String email = request.get("email");
        String mobileNumber = request.get("mobileNumber");
        String password = request.get("password");
        String role = request.getOrDefault("role", "STUDENT");

        if (username == null || username.trim().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Username is required."));
        }
        if (email == null || email.trim().isBlank() || !EMAIL_REGEX.matcher(email.trim()).matches()) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Valid email address is required."));
        }
        if (password == null || password.trim().length() < 4) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Password must be at least 4 characters."));
        }

        try {
            User newUser = new User(
                    username.trim(),
                    email.trim(),
                    mobileNumber != null ? mobileNumber.trim() : null,
                    password.trim(),
                    fullName != null ? fullName.trim() : username.trim(),
                    role
            );

            User savedUser = userService.registerUser(newUser);

            Map<String, Object> userData = new HashMap<>();
            userData.put("id", savedUser.getId());
            userData.put("username", savedUser.getUsername());
            userData.put("email", savedUser.getEmail());
            userData.put("mobileNumber", savedUser.getMobileNumber());
            userData.put("fullName", savedUser.getFullName());
            userData.put("role", savedUser.getRole());

            Map<String, Object> resp = new HashMap<>();
            resp.put("success", true);
            resp.put("message", "Registration successful! You can now sign in with your credentials.");
            resp.put("user", userData);

            return ResponseEntity.status(HttpStatus.CREATED).body(resp);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                    "success", false,
                    "message", e.getMessage()
            ));
        }
    }

    // ==========================================
    // USERNAME / EMAIL & PASSWORD LOGIN
    // POST /api/auth/login
    // ==========================================
    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> request) {
        String usernameOrEmail = request.get("username");
        if (usernameOrEmail == null || usernameOrEmail.isBlank()) {
            usernameOrEmail = request.get("email");
        }
        String password = request.get("password");

        if (usernameOrEmail == null || usernameOrEmail.trim().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Username or email is required."
            ));
        }

        if (password == null || password.trim().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Password is required."
            ));
        }

        try {
            User user = userService.authenticate(usernameOrEmail, password);
            String sessionToken = "session_" + UUID.randomUUID().toString().replace("-", "");

            Map<String, Object> userData = new HashMap<>();
            userData.put("id", user.getId());
            userData.put("username", user.getUsername());
            userData.put("email", user.getEmail());
            userData.put("mobileNumber", user.getMobileNumber());
            userData.put("fullName", user.getFullName());
            userData.put("role", user.getRole());

            Map<String, Object> resp = new HashMap<>();
            resp.put("success", true);
            resp.put("message", "Login successful! Welcome back, " + (user.getFullName() != null ? user.getFullName() : user.getUsername()) + ".");
            resp.put("token", sessionToken);
            resp.put("user", userData);
            resp.put("email", user.getEmail());
            resp.put("verifiedAt", Instant.now().toString());

            return ResponseEntity.ok(resp);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                    "success", false,
                    "message", e.getMessage()
            ));
        }
    }

    // ==========================================
    // FORGOT PASSWORD: SEND 6-DIGIT OTP VIA EMAIL / MOBILE
    // POST /api/auth/forgot-password/send-otp
    // ==========================================
    @PostMapping("/forgot-password/send-otp")
    public ResponseEntity<Map<String, Object>> sendForgotPasswordOtp(@RequestBody Map<String, String> request) {
        String identifier = request.get("identifier");
        String channel = request.getOrDefault("channel", "EMAIL").toUpperCase(); // "EMAIL" or "MOBILE"

        if (identifier == null || identifier.trim().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Please provide your registered Email or Mobile Number."
            ));
        }

        String cleanIdentifier = identifier.trim();

        // Check if user exists in the database
        Optional<User> userOpt = userService.findByIdentifier(cleanIdentifier);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                    "success", false,
                    "message", "No registered account found with " + cleanIdentifier + ". Please verify and try again."
            ));
        }

        User user = userOpt.get();

        // Generate the 6-digit OTP
        String otp = codeService.generateVerificationCode(cleanIdentifier);
        String formattedCode = VerificationCodeService.formatCode(otp);

        boolean dispatched = false;
        String targetDestination;

        if ("MOBILE".equals(channel)) {
            targetDestination = user.getMobileNumber() != null ? user.getMobileNumber() : cleanIdentifier;
            dispatched = emailService.sendSmsOtp(targetDestination, otp, "Password Reset OTP");
        } else {
            targetDestination = user.getEmail() != null ? user.getEmail() : cleanIdentifier;
            dispatched = emailService.sendVerificationCode(targetDestination, otp, "Password Reset OTP");
        }

        Map<String, Object> resp = new HashMap<>();
        resp.put("success", true);
        resp.put("identifier", cleanIdentifier);
        resp.put("channel", channel);
        resp.put("target", targetDestination);
        resp.put("codeLength", codeLength > 0 ? codeLength : 6);
        resp.put("dispatched", dispatched);
        resp.put("message", "Password reset OTP has been sent via " + channel + " to " + targetDestination + ".");

        if (devMode) {
            resp.put("devMode", true);
            resp.put("devCode", otp);
            resp.put("formattedPreview", formattedCode);
        }

        return ResponseEntity.ok(resp);
    }

    // ==========================================
    // FORGOT PASSWORD: VERIFY OTP & RESET PASSWORD
    // POST /api/auth/forgot-password/reset
    // ==========================================
    @PostMapping("/forgot-password/reset")
    public ResponseEntity<Map<String, Object>> resetPassword(@RequestBody Map<String, String> request) {
        String identifier = request.get("identifier");
        String otp = request.get("otp");
        String newPassword = request.get("newPassword");

        if (identifier == null || identifier.trim().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Identifier (Email or Mobile Number) is required."
            ));
        }

        if (otp == null || otp.trim().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Please enter the verification OTP."
            ));
        }

        if (newPassword == null || newPassword.trim().length() < 4) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "New password must be at least 4 characters long."
            ));
        }

        String cleanIdentifier = identifier.trim();

        // Verify the OTP
        boolean isOtpValid = codeService.verifyCode(cleanIdentifier, otp);
        if (!isOtpValid) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                    "success", false,
                    "message", "Invalid or expired OTP. Please check the code or request a new one."
            ));
        }

        try {
            User updatedUser = userService.updatePassword(cleanIdentifier, newPassword.trim());

            Map<String, Object> resp = new HashMap<>();
            resp.put("success", true);
            resp.put("message", "Password has been successfully reset! You can now log in with your new password.");
            resp.put("username", updatedUser.getUsername());
            resp.put("email", updatedUser.getEmail());

            return ResponseEntity.ok(resp);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "success", false,
                    "message", "Failed to update password: " + e.getMessage()
            ));
        }
    }

    // ==========================================
    // STEP 1: REQUEST 6-DIGIT 2FA OTP
    // POST /api/auth/send-code
    // ==========================================
    @PostMapping("/send-code")
    public ResponseEntity<Map<String, Object>> sendCode(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String purpose = request.getOrDefault("purpose", "Two-Factor Authentication");

        if (email == null || email.trim().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Email address is required."
            ));
        }

        String normalizedEmail = email.trim().toLowerCase();
        if (!EMAIL_REGEX.matcher(normalizedEmail).matches()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Invalid email format. Please provide a valid email address."
            ));
        }

        // Generate the 6-digit OTP
        String otp = codeService.generateVerificationCode(normalizedEmail);
        String formattedCode = VerificationCodeService.formatCode(otp);

        // Dispatch email (or log to console if SMTP credentials not configured yet)
        boolean emailSent = emailService.sendVerificationCode(normalizedEmail, otp, purpose);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("email", normalizedEmail);
        response.put("codeLength", codeLength > 0 ? codeLength : 6);
        response.put("expiresInMinutes", 10);
        response.put("emailSent", emailSent);
        response.put("message", "A 6-digit 2FA verification code has been sent to " + normalizedEmail + ".");

        if (devMode) {
            response.put("devMode", true);
            response.put("devCode", otp);
            response.put("formattedPreview", formattedCode);
        }

        return ResponseEntity.ok(response);
    }

    // ==========================================
    // STEP 2: VERIFY 6-DIGIT 2FA OTP
    // POST /api/auth/verify-code
    // ==========================================
    @PostMapping("/verify-code")
    public ResponseEntity<Map<String, Object>> verifyCode(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String code = request.get("code");

        if (email == null || email.trim().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Email address is required."
            ));
        }

        if (code == null || code.trim().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Please enter the 6-digit verification OTP."
            ));
        }

        boolean isValid = codeService.verifyCode(email, code);

        if (!isValid) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                    "success", false,
                    "message", "Invalid or expired 6-digit OTP. Please check and try again."
            ));
        }

        // Return a mock auth session token
        String sessionToken = "2fa_session_" + UUID.randomUUID().toString().replace("-", "");
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Two-factor verification completed successfully!");
        response.put("token", sessionToken);
        response.put("email", email.trim().toLowerCase());
        response.put("verifiedAt", Instant.now().toString());

        return ResponseEntity.ok(response);
    }

    // ==========================================
    // STATUS & INFO
    // GET /api/auth/status
    // ==========================================
    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getAuthStatus() {
        return ResponseEntity.ok(Map.of(
                "twoFactorEnabled", true,
                "passwordLoginEnabled", true,
                "registrationEnabled", true,
                "forgotPasswordEnabled", true,
                "codeLength", 6,
                "format", "XXXXXX",
                "expiryMinutes", 10,
                "devMode", devMode
        ));
    }
}
