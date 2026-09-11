package com.example.studentmanagement.controller;

import com.example.studentmanagement.entity.User;
import com.example.studentmanagement.repository.UserRepository;
import com.example.studentmanagement.service.EmailService;
import com.example.studentmanagement.service.UserService;
import com.example.studentmanagement.service.VerificationCodeService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

class AuthControllerTest {

    private VerificationCodeService codeService;
    private EmailService emailService;
    private UserRepository userRepository;
    private UserService userService;
    private AuthController authController;

    private User sampleUser;

    @BeforeEach
    void setUp() {
        codeService = new VerificationCodeService();
        emailService = new EmailService(null);
        userRepository = Mockito.mock(UserRepository.class);
        userService = new UserService(userRepository);
        authController = new AuthController(codeService, emailService, userService);

        sampleUser = new User("admin", "admin@university.edu", "+919876543210", "admin123", "System Administrator", "ADMIN");
        sampleUser.setId(1L);

        when(userRepository.findByUsername("admin")).thenReturn(Optional.of(sampleUser));
        when(userRepository.findByEmail("admin@university.edu")).thenReturn(Optional.of(sampleUser));
        when(userRepository.findByMobileNumber("+919876543210")).thenReturn(Optional.of(sampleUser));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));
    }

    @Test
    void testPasswordLoginSuccess() {
        Map<String, String> request = Map.of("username", "admin", "password", "admin123");
        ResponseEntity<Map<String, Object>> response = authController.login(request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue((Boolean) response.getBody().get("success"));
        assertNotNull(response.getBody().get("token"));
        assertEquals("admin@university.edu", response.getBody().get("email"));
    }

    @Test
    void testPasswordLoginInvalidCredentials() {
        Map<String, String> request = Map.of("username", "admin", "password", "wrongpass");
        ResponseEntity<Map<String, Object>> response = authController.login(request);

        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
        assertNotNull(response.getBody());
        assertFalse((Boolean) response.getBody().get("success"));
    }

    @Test
    void testForgotPasswordOtpViaEmailAndResetFlow() {
        // Step 1: Request OTP via Email
        Map<String, String> otpRequest = Map.of("identifier", "admin@university.edu", "channel", "EMAIL");
        ResponseEntity<Map<String, Object>> otpResponse = authController.sendForgotPasswordOtp(otpRequest);

        assertEquals(HttpStatus.OK, otpResponse.getStatusCode());
        String otp = (String) otpResponse.getBody().get("devCode");
        assertNotNull(otp);

        // Step 2: Reset Password with OTP
        Map<String, String> resetRequest = Map.of(
                "identifier", "admin@university.edu",
                "otp", otp,
                "newPassword", "newSecret123"
        );
        ResponseEntity<Map<String, Object>> resetResponse = authController.resetPassword(resetRequest);

        assertEquals(HttpStatus.OK, resetResponse.getStatusCode());
        assertTrue((Boolean) resetResponse.getBody().get("success"));
        assertEquals("newSecret123", sampleUser.getPassword());
    }

    @Test
    void testForgotPasswordOtpViaMobile() {
        Map<String, String> otpRequest = Map.of("identifier", "+919876543210", "channel", "MOBILE");
        ResponseEntity<Map<String, Object>> otpResponse = authController.sendForgotPasswordOtp(otpRequest);

        assertEquals(HttpStatus.OK, otpResponse.getStatusCode());
        assertTrue((Boolean) otpResponse.getBody().get("success"));
        assertEquals("MOBILE", otpResponse.getBody().get("channel"));
    }

    @Test
    void testRegisterUserSuccess() {
        Map<String, String> request = Map.of(
                "username", "newstudent",
                "email", "newstudent@university.edu",
                "mobileNumber", "+919876543299",
                "password", "secret123",
                "fullName", "New Student",
                "role", "STUDENT"
        );
        when(userRepository.findByUsername("newstudent")).thenReturn(Optional.empty());
        when(userRepository.findByEmail("newstudent@university.edu")).thenReturn(Optional.empty());
        when(userRepository.findByMobileNumber("+919876543299")).thenReturn(Optional.empty());

        ResponseEntity<Map<String, Object>> response = authController.registerUser(request);

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue((Boolean) response.getBody().get("success"));
        assertNotNull(response.getBody().get("user"));
    }

    @Test
    void testRegisterDuplicateUsernameFails() {
        Map<String, String> request = Map.of(
                "username", "admin",
                "email", "other@university.edu",
                "mobileNumber", "+919876543299",
                "password", "secret123"
        );
        ResponseEntity<Map<String, Object>> response = authController.registerUser(request);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertNotNull(response.getBody());
        assertFalse((Boolean) response.getBody().get("success"));
    }

    @Test
    void testSendCodeValidEmail() {
        Map<String, String> request = Map.of("email", "admin@university.edu");
        ResponseEntity<Map<String, Object>> response = authController.sendCode(request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue((Boolean) response.getBody().get("success"));
        assertEquals(6, response.getBody().get("codeLength"));
        assertNotNull(response.getBody().get("devCode"));
        assertEquals(6, ((String) response.getBody().get("devCode")).length());
    }

    @Test
    void testSendCodeInvalidEmailFails() {
        Map<String, String> request = Map.of("email", "not-an-email");
        ResponseEntity<Map<String, Object>> response = authController.sendCode(request);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertNotNull(response.getBody());
        assertFalse((Boolean) response.getBody().get("success"));
    }
}
