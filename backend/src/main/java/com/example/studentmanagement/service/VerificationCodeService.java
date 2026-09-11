package com.example.studentmanagement.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class VerificationCodeService {

    // Numeric character set for generating 6-digit 2FA OTP codes
    private static final String OTP_CHARS = "0123456789";
    private static final int DEFAULT_OTP_LENGTH = 6;
    private static final SecureRandom RANDOM = new SecureRandom();

    @Value("${app.verification.code-length:6}")
    private int codeLength = 6;

    @Value("${app.verification.code-expiry-minutes:10}")
    private long expiryMinutes = 10;

    public void setCodeLength(int codeLength) {
        this.codeLength = codeLength;
    }

    private static class VerificationRecord {
        final String code;
        final Instant createdAt;
        final Instant expiresAt;
        int attempts;

        VerificationRecord(String code, Duration validity) {
            this.code = code;
            this.createdAt = Instant.now();
            this.expiresAt = this.createdAt.plus(validity);
            this.attempts = 0;
        }

        boolean isExpired() {
            return Instant.now().isAfter(expiresAt);
        }
    }

    // Thread-safe code storage by normalized identifier (email or phone)
    private final Map<String, VerificationRecord> codeStore = new ConcurrentHashMap<>();

    /**
     * Generates a 6-digit numeric OTP for the specified identifier (email / phone).
     */
    public String generateVerificationCode(String identifier) {
        if (identifier == null || identifier.isBlank()) {
            throw new IllegalArgumentException("Identifier cannot be empty");
        }

        int length = codeLength > 0 ? codeLength : DEFAULT_OTP_LENGTH;
        StringBuilder sb = new StringBuilder(length);
        for (int i = 0; i < length; i++) {
            int idx = RANDOM.nextInt(OTP_CHARS.length());
            sb.append(OTP_CHARS.charAt(idx));
        }

        String rawCode = sb.toString();
        String normalizedId = identifier.trim().toLowerCase();

        Duration validity = Duration.ofMinutes(expiryMinutes > 0 ? expiryMinutes : 10);
        codeStore.put(normalizedId, new VerificationRecord(rawCode, validity));

        return rawCode;
    }

    /**
     * Verifies the 6-digit OTP submitted by the user.
     * Code matching strips hyphens and whitespace.
     */
    public boolean verifyCode(String identifier, String inputCode) {
        if (identifier == null || inputCode == null) {
            return false;
        }

        String normalizedId = identifier.trim().toLowerCase();
        VerificationRecord record = codeStore.get(normalizedId);

        if (record == null) {
            return false;
        }

        if (record.isExpired()) {
            codeStore.remove(normalizedId);
            return false;
        }

        record.attempts++;
        if (record.attempts > 5) {
            codeStore.remove(normalizedId);
            return false;
        }

        // Clean user input: remove spaces, dashes, convert to uppercase
        String cleanInput = inputCode.replaceAll("[\\s\\-_]+", "").toUpperCase();
        String cleanRecordCode = record.code.replaceAll("[\\s\\-_]+", "").toUpperCase();

        if (cleanRecordCode.equals(cleanInput)) {
            // Invalidate after successful verification (single-use OTP)
            codeStore.remove(normalizedId);
            return true;
        }

        return false;
    }

    /**
     * Formats a code for display. If 6 digits, formats as XXX-XXX or returns raw.
     */
    public static String formatCode(String rawCode) {
        if (rawCode == null) return "";
        String clean = rawCode.replaceAll("[^A-Za-z0-9]", "");
        if (clean.length() == 6) {
            return clean.substring(0, 3) + "-" + clean.substring(3, 6);
        }
        if (clean.length() == 16) {
            return clean.substring(0, 4) + "-" +
                   clean.substring(4, 8) + "-" +
                   clean.substring(8, 12) + "-" +
                   clean.substring(12, 16);
        }
        return rawCode;
    }

    /**
     * Retrieves the active code for dev mode / testing previews.
     */
    public String getActiveCode(String identifier) {
        if (identifier == null) return null;
        VerificationRecord record = codeStore.get(identifier.trim().toLowerCase());
        if (record != null && !record.isExpired()) {
            return record.code;
        }
        return null;
    }
}
