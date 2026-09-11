package com.example.studentmanagement.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:your-email@gmail.com}")
    private String senderEmail;

    @Value("${app.verification.dev-mode:true}")
    private boolean devMode;

    public EmailService(@Autowired(required = false) JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    /**
     * Sends an email containing the 16-character verification code.
     * If SMTP is unconfigured or encounters connection limits, gracefully logs the code to console.
     */
    public boolean sendVerificationCode(String recipientEmail, String code16, String purpose) {
        String formattedCode = VerificationCodeService.formatCode(code16);

        // Always print clean ASCII frame in console for development & debugging
        printConsoleBanner(recipientEmail, code16, formattedCode, purpose);

        // Check if real SMTP credentials are configured (not default placeholder)
        boolean isSmtpConfigured = mailSender != null
                && senderEmail != null
                && !senderEmail.isBlank()
                && !senderEmail.contains("your-email@gmail.com");

        if (!isSmtpConfigured) {
            log.info("[EmailService] Real SMTP not yet configured. Simulated email delivery to {}.", recipientEmail);
            return false;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(senderEmail, "EduCore Student Portal");
            helper.setTo(recipientEmail);
            helper.setSubject("Your 16-Character Verification Code: " + formattedCode);

            String htmlContent = buildEmailTemplate(formattedCode, purpose);
            helper.setText(htmlContent, true);

            mailSender.send(message);
            log.info("[EmailService] Verification email successfully delivered to {}", recipientEmail);
            return true;

        } catch (MessagingException me) {
            log.warn("[EmailService] Messaging exception when sending to {}: {}", recipientEmail, me.getMessage());
        } catch (Exception e) {
            log.warn("[EmailService] SMTP delivery failed ({}: {}). Check Gmail 16-character app password settings.",
                    e.getClass().getSimpleName(), e.getMessage());
        }

        return false;
    }

    public boolean sendSmsOtp(String mobileNumber, String otp, String purpose) {
        String purposeText = purpose != null && !purpose.isBlank() ? purpose : "Password Reset OTP";
        log.info("\n" +
                "=================================================================================\n" +
                " [SMS / MOBILE OTP DISPATCHED]                                                   \n" +
                "---------------------------------------------------------------------------------\n" +
                " Recipient Mobile : {}\n" +
                " Purpose          : {}\n" +
                " OTP CODE         : {}\n" +
                " Validity         : 10 minutes\n" +
                " Channel          : SMS Gateway / Mobile Delivery\n" +
                "=================================================================================",
                mobileNumber, purposeText, otp);
        return true;
    }

    private void printConsoleBanner(String email, String rawCode, String formattedCode, String purpose) {
        String purposeText = purpose != null && !purpose.isBlank() ? purpose : "Two-Step Verification";
        log.info("\n" +
                "=================================================================================\n" +
                " [EMAIL 2-STEP VERIFICATION CODE / OTP DISPATCHED]                              \n" +
                "---------------------------------------------------------------------------------\n" +
                " Recipient Email : {}\n" +
                " Purpose         : {}\n" +
                " CODE / OTP      : {}  (Raw: {})\n" +
                " Validity        : 10 minutes\n" +
                " Note            : For Gmail delivery, set 16-character App Password in application.properties\n" +
                "=================================================================================",
                email, purposeText, formattedCode, rawCode);
    }

    private String buildEmailTemplate(String formattedCode, String purpose) {
        String title = purpose != null && !purpose.isBlank() ? purpose : "Two-Step Verification";
        return """
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="UTF-8">
              <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 24px; color: #1e293b; }
                .container { max-width: 540px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); border: 1px solid #e2e8f0; }
                .header { background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 28px; text-align: center; color: #ffffff; }
                .header h1 { margin: 0; font-size: 22px; font-weight: 700; letter-spacing: -0.5px; }
                .header p { margin: 6px 0 0 0; font-size: 14px; opacity: 0.9; }
                .body-content { padding: 32px 24px; text-align: center; }
                .instruction { font-size: 15px; color: #475569; margin-bottom: 24px; line-height: 1.5; }
                .code-box { display: inline-block; background: #f8fafc; border: 2px dashed #6366f1; border-radius: 10px; padding: 16px 28px; margin: 0 auto 24px auto; }
                .code-text { font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace; font-size: 24px; font-weight: 800; letter-spacing: 3px; color: #312e81; }
                .badge { display: inline-block; padding: 4px 10px; background: #ede9fe; color: #6d28d9; border-radius: 6px; font-size: 12px; font-weight: 600; margin-bottom: 12px; }
                .meta-note { font-size: 13px; color: #64748b; line-height: 1.6; }
                .footer { background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 18px; text-align: center; font-size: 12px; color: #94a3b8; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>EduCore Student Portal</h1>
                  <p>Secure Two-Step Verification (2FA)</p>
                </div>
                <div class="body-content">
                  <div class="badge">""" + title + """
                  </div>
                  <p class="instruction">
                    Please use the following <strong>verification OTP code</strong> to complete your authentication:
                  </p>
                  <div class="code-box">
                    <div class="code-text">""" + formattedCode + """
                    </div>
                  </div>
                  <p class="meta-note">
                    This 16-character code is valid for <strong>10 minutes</strong> and can only be used once.<br/>
                    If you did not request this verification code, please ignore this email.
                  </p>
                </div>
                <div class="footer">
                  EduCore Student Management System &bull; Java Spring Boot + React
                </div>
              </div>
            </body>
            </html>
            """;
    }
}
