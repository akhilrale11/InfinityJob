package com.example.studentmanagement.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class VerificationCodeServiceTest {

    private VerificationCodeService verificationCodeService;

    @BeforeEach
    void setUp() {
        verificationCodeService = new VerificationCodeService();
    }

    @Test
    void testGenerateCodeIs6Digits() {
        String email = "student@university.edu";
        String code = verificationCodeService.generateVerificationCode(email);

        assertNotNull(code);
        assertEquals(6, code.length(), "Generated OTP must be exactly 6 digits");
        assertTrue(code.matches("^[0-9]{6}$"), "OTP must be numeric digits only");
    }

    @Test
    void testFormatCodeProducesThreeDigitSegments() {
        String code = "123456";
        String formatted = VerificationCodeService.formatCode(code);

        assertEquals("123-456", formatted);
    }

    @Test
    void testSuccessfulVerificationExactMatch() {
        String email = "test@example.com";
        String code = verificationCodeService.generateVerificationCode(email);

        boolean verified = verificationCodeService.verifyCode(email, code);
        assertTrue(verified, "Code should be successfully verified");
    }

    @Test
    void testVerificationWithHyphensAndSpaces() {
        String email = "test2@example.com";
        String rawCode = verificationCodeService.generateVerificationCode(email);
        String formattedCode = VerificationCodeService.formatCode(rawCode);

        // Verify with 123-456 format
        boolean verified = verificationCodeService.verifyCode(email, formattedCode);
        assertTrue(verified, "Formatted code with hyphens should be accepted");
    }

    @Test
    void testInvalidCodeFails() {
        String email = "test4@example.com";
        verificationCodeService.generateVerificationCode(email);

        boolean verified = verificationCodeService.verifyCode(email, "999999");
        assertFalse(verified, "Incorrect code should not verify");
    }

    @Test
    void testCodeIsSingleUse() {
        String email = "singleuse@example.com";
        String code = verificationCodeService.generateVerificationCode(email);

        boolean firstAttempt = verificationCodeService.verifyCode(email, code);
        assertTrue(firstAttempt, "First verification attempt should succeed");

        boolean secondAttempt = verificationCodeService.verifyCode(email, code);
        assertFalse(secondAttempt, "Second attempt with same code must fail (single-use OTP)");
    }
}

