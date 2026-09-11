import React, { useState, useRef } from "react";
import {
  registerUser,
  loginWithCredentials,
  sendForgotPasswordOtp,
  resetPasswordWithOtp,
  sendAuthCode,
  verifyAuthCode,
} from "./services/authService";

// Helper component for 6-digit OTP input with auto-focus & paste handling
function SixDigitOtpInput({ value, onChange, disabled }) {
  const inputRefs = useRef([]);
  const digits = value.padEnd(6, "").slice(0, 6).split("");

  const handleChange = (e, index) => {
    const char = e.target.value.replace(/[^0-9]/g, "").slice(-1);
    const newDigits = [...digits];
    newDigits[index] = char;
    const newVal = newDigits.join("").trim();
    onChange(newVal);

    if (char && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !digits[index] && index > 0 && inputRefs.current[index - 1]) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text").replace(/[^0-9]/g, "").slice(0, 6);
    onChange(pasteData);
    if (pasteData.length === 6 && inputRefs.current[5]) {
      inputRefs.current[5].focus();
    }
  };

  return (
    <div className="otp-6-box-container" onPaste={handlePaste}>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <input
          key={i}
          ref={(el) => (inputRefs.current[i] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          className={`otp-digit-box ${digits[i] ? "filled" : ""}`}
          value={digits[i] || ""}
          onChange={(e) => handleChange(e, i)}
          onKeyDown={(e) => handleKeyDown(e, i)}
          disabled={disabled}
          autoFocus={i === 0}
        />
      ))}
    </div>
  );
}

export default function TwoFactorLoginModal({ onLoginSuccess, showToast }) {
  // Modes: "LOGIN", "REGISTER", "FORGOT_STEP1", "FORGOT_STEP2", "FORGOT_SUCCESS", "TWO_FACTOR"
  const [mode, setMode] = useState("LOGIN");

  // Registration state
  const [regFullName, setRegFullName] = useState("");
  const [regUsername, setRegUsername] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regMobile, setRegMobile] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");
  const [regRole, setRegRole] = useState("STUDENT");

  // Login form state
  const [loginUsername, setLoginUsername] = useState("student");
  const [loginPassword, setLoginPassword] = useState("student123");
  const [showPassword, setShowPassword] = useState(false);

  // Forgot Password state
  const [fpIdentifier, setFpIdentifier] = useState("student@infinityjob.in");
  const [fpOtp, setFpOtp] = useState("");
  const [fpNewPassword, setFpNewPassword] = useState("");
  const [fpConfirmPassword, setFpConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);

  // 2FA state (6-digit OTP)
  const [twoFaStep, setTwoFaStep] = useState(1);
  const [twoFaEmail, setTwoFaEmail] = useState("student@infinityjob.in");
  const [twoFaOtp, setTwoFaOtp] = useState("");

  // Shared state
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [devCodePreview, setDevCodePreview] = useState(null);
  const [formattedPreview, setFormattedPreview] = useState(null);

  // Quick Demo Autofills
  const fillDemo = (type) => {
    setErrorMessage("");
    setMode("LOGIN");
    if (type === "student") {
      setLoginUsername("student");
      setLoginPassword("student123");
    } else {
      setLoginUsername("admin");
      setLoginPassword("admin123");
    }
  };

  // --- Handlers ---

  // 1. Password Login
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setLoading(true);

    try {
      const data = await loginWithCredentials(loginUsername, loginPassword);
      if (data.success) {
        showToast("success", "Welcome Back", data.message || "Signed in successfully.");
        onLoginSuccess(data);
      } else {
        setErrorMessage(data.message || "Invalid credentials.");
      }
    } catch (err) {
      console.error(err);
      setErrorMessage(err.response?.data?.message || err.message || "Failed to sign in.");
    } finally {
      setLoading(false);
    }
  };

  // 2. User Registration
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (regPassword !== regConfirmPassword) {
      setErrorMessage("Passwords do not match. Please verify.");
      return;
    }

    setLoading(true);
    try {
      const data = await registerUser({
        fullName: regFullName,
        username: regUsername,
        email: regEmail,
        mobileNumber: regMobile || null,
        password: regPassword,
        role: regRole,
      });

      if (data.success) {
        showToast("success", "Registration Successful!", "Your account has been created. Logging you in...");
        const loginData = await loginWithCredentials(regUsername, regPassword);
        if (loginData.success) {
          onLoginSuccess(loginData);
        } else {
          setMode("LOGIN");
          setLoginUsername(regUsername);
        }
      } else {
        setErrorMessage(data.message || "Registration failed.");
      }
    } catch (err) {
      console.error(err);
      setErrorMessage(err.response?.data?.message || err.message || "Registration error.");
    } finally {
      setLoading(false);
    }
  };

  // 3. Forgot Password - Send Email OTP
  const handleSendFpOtp = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setLoading(true);

    try {
      const data = await sendForgotPasswordOtp(fpIdentifier, "EMAIL");
      if (data.success) {
        setMode("FORGOT_STEP2");
        if (data.devCode) {
          setDevCodePreview(data.devCode);
          setFormattedPreview(data.formattedPreview);
        }
        showToast("info", "OTP Sent", data.message || "6-digit OTP dispatched to your email.");
      } else {
        setErrorMessage(data.message || "Could not find registered account.");
      }
    } catch (err) {
      console.error(err);
      setErrorMessage(err.response?.data?.message || err.message || "Failed to send reset OTP.");
    } finally {
      setLoading(false);
    }
  };

  // 4. Forgot Password - Verify OTP & Reset
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (fpNewPassword !== fpConfirmPassword) {
      setErrorMessage("New passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const data = await resetPasswordWithOtp(fpIdentifier, fpOtp, fpNewPassword);
      if (data.success) {
        setMode("FORGOT_SUCCESS");
        showToast("success", "Password Reset", "Your password has been changed. You can now sign in.");
      } else {
        setErrorMessage(data.message || "Failed to reset password.");
      }
    } catch (err) {
      console.error(err);
      setErrorMessage(err.response?.data?.message || err.message || "Password reset failed.");
    } finally {
      setLoading(false);
    }
  };

  // 5. 2FA - Send Code
  const handleSend2FaCode = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setLoading(true);

    try {
      const data = await sendAuthCode(twoFaEmail, "Two-Factor Authentication");
      if (data.success) {
        setTwoFaStep(2);
        if (data.devCode) {
          setDevCodePreview(data.devCode);
          setFormattedPreview(data.formattedPreview);
        }
        showToast("info", "2FA Code Sent", `A 6-digit code was sent to ${twoFaEmail}`);
      } else {
        setErrorMessage(data.message || "Failed to send 2FA code.");
      }
    } catch (err) {
      console.error(err);
      setErrorMessage(err.response?.data?.message || err.message || "Connection error.");
    } finally {
      setLoading(false);
    }
  };

  // 6. 2FA - Verify Code
  const handleVerify2FaCode = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setLoading(true);

    try {
      const data = await verifyAuthCode(twoFaEmail, twoFaOtp);
      if (data.success) {
        showToast("success", "2FA Verified!", "Welcome back to InfinityJob Portal.");
        onLoginSuccess({
          success: true,
          token: data.token,
          user: {
            username: twoFaEmail.split("@")[0],
            email: twoFaEmail,
            role: twoFaEmail.includes("admin") ? "ADMIN" : "STUDENT",
            fullName: twoFaEmail.split("@")[0].toUpperCase(),
          },
        });
      } else {
        setErrorMessage(data.message || "Invalid or expired 6-digit OTP.");
      }
    } catch (err) {
      console.error(err);
      setErrorMessage(err.response?.data?.message || err.message || "Verification error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-fullpage-backdrop">
      <div className="login-master-container" style={{ maxWidth: "620px", gridTemplateColumns: "1fr" }}>
        <div className="login-form-area" style={{ padding: "36px 32px" }}>
          {/* Top Brand Header */}
          <div className="auth-card-topbar" style={{ textAlign: "center", marginBottom: "20px" }}>
            <div className="brand-badge-logo" style={{ margin: "0 auto 12px auto" }}>♾️</div>
            <h2 style={{ fontSize: "24px", fontWeight: "800", color: "#fff" }}>InfinityJob Management Portal</h2>
            <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
              {mode === "LOGIN" && "Sign in with Credentials or 2-Step Email Verification"}
              {mode === "REGISTER" && "Create a new Student or Admin account"}
              {mode === "FORGOT_STEP1" && "Reset your password via Email OTP"}
              {mode === "FORGOT_STEP2" && "Enter 6-digit OTP to set new password"}
              {mode === "FORGOT_SUCCESS" && "Password reset successfully completed"}
              {mode === "TWO_FACTOR" && "Secure 2-Factor Authentication via Email OTP"}
            </p>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="auth-alert-error">
              <span className="alert-icon">⚠️</span>
              <div className="alert-text">{errorMessage}</div>
            </div>
          )}

          {/* Dev Mode OTP Preview Banner */}
          {devCodePreview && (
            <div className="dev-code-banner">
              <div className="dev-code-label">🛠️ Dev Mode 6-Digit Email OTP:</div>
              <div className="dev-code-digits">{formattedPreview || devCodePreview}</div>
              <button
                type="button"
                className="btn-copy-code"
                onClick={() => {
                  if (mode === "FORGOT_STEP2") setFpOtp(devCodePreview);
                  if (mode === "TWO_FACTOR") setTwoFaOtp(devCodePreview);
                  showToast("info", "Autofilled", "6-digit OTP copied into input.");
                }}
              >
                Autofill OTP 📋
              </button>
            </div>
          )}

          {/* --- MODE 1: PASSWORD LOGIN --- */}
          {mode === "LOGIN" && (
            <form onSubmit={handleLoginSubmit} className="auth-form">
              <div className="form-group-custom">
                <label>Username or Registered Email *</label>
                <input
                  type="text"
                  required
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  placeholder="e.g. student or student@infinityjob.in"
                  disabled={loading}
                />
              </div>

              <div className="form-group-custom">
                <div className="label-with-action">
                  <label>Password *</label>
                  <button
                    type="button"
                    className="btn-link-sm"
                    onClick={() => {
                      setErrorMessage("");
                      setMode("FORGOT_STEP1");
                      setFpIdentifier(loginUsername.includes("@") ? loginUsername : "student@infinityjob.in");
                    }}
                  >
                    Forgot Password? (Email OTP)
                  </button>
                </div>
                <div className="password-input-wrap">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter account password"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="btn-toggle-eye"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    {showPassword ? "👁️" : "🔒"}
                  </button>
                </div>
              </div>

              {/* Demo Credentials Quick Fill */}
              <div className="demo-credentials-row">
                <span className="demo-label">Demo Logins:</span>
                <button
                  type="button"
                  className="btn-demo-fill"
                  onClick={() => fillDemo("student")}
                >
                  🎓 Student (student / student123)
                </button>
                <button
                  type="button"
                  className="btn-demo-fill"
                  onClick={() => fillDemo("admin")}
                >
                  🛡️ Admin (admin / admin123)
                </button>
              </div>

              <button type="submit" className="btn-auth-primary" disabled={loading}>
                {loading ? "Signing In..." : "Sign In to Portal 🚀"}
              </button>

              <div className="auth-secondary-actions">
                <button
                  type="button"
                  className="btn-switch-mode"
                  onClick={() => {
                    setErrorMessage("");
                    setMode("TWO_FACTOR");
                    setTwoFaEmail("student@infinityjob.in");
                  }}
                >
                  🔐 Login with 6-Digit Email 2FA OTP instead
                </button>

                <div className="register-prompt-line">
                  <span>Don't have an account? </span>
                  <button
                    type="button"
                    className="btn-link-highlight"
                    onClick={() => {
                      setErrorMessage("");
                      setMode("REGISTER");
                    }}
                  >
                    Register New Account
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* --- MODE 2: REGISTER --- */}
          {mode === "REGISTER" && (
            <form onSubmit={handleRegisterSubmit} className="auth-form">
              <div className="form-group-custom">
                <label>Full Legal Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Akhil Rale"
                  value={regFullName}
                  onChange={(e) => setRegFullName(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className="form-row-2">
                <div className="form-group-custom">
                  <label>Username *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. akhil123"
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value)}
                    disabled={loading}
                  />
                </div>
                <div className="form-group-custom">
                  <label>Account Role</label>
                  <select
                    value={regRole}
                    onChange={(e) => setRegRole(e.target.value)}
                    disabled={loading}
                  >
                    <option value="STUDENT">🎓 Student / Candidate</option>
                    <option value="ADMIN">🛡️ Admin / Faculty</option>
                  </select>
                </div>
              </div>

              <div className="form-row-2">
                <div className="form-group-custom">
                  <label>Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="akhil@example.com"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    disabled={loading}
                  />
                </div>
                <div className="form-group-custom">
                  <label>Mobile Number</label>
                  <input
                    type="text"
                    placeholder="+91 98765 43210"
                    value={regMobile}
                    onChange={(e) => setRegMobile(e.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="form-row-2">
                <div className="form-group-custom">
                  <label>Password *</label>
                  <input
                    type="password"
                    required
                    placeholder="Min 4 characters"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    disabled={loading}
                  />
                </div>
                <div className="form-group-custom">
                  <label>Confirm Password *</label>
                  <input
                    type="password"
                    required
                    placeholder="Re-enter password"
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>

              <button type="submit" className="btn-auth-primary" disabled={loading}>
                {loading ? "Creating Account..." : "Complete Registration & Sign In 🚀"}
              </button>

              <div className="auth-secondary-actions text-center">
                <span>Already registered? </span>
                <button
                  type="button"
                  className="btn-link-highlight"
                  onClick={() => {
                    setErrorMessage("");
                    setMode("LOGIN");
                  }}
                >
                  Sign In
                </button>
              </div>
            </form>
          )}

          {/* --- MODE 3: FORGOT PASSWORD STEP 1 --- */}
          {mode === "FORGOT_STEP1" && (
            <form onSubmit={handleSendFpOtp} className="auth-form">
              <p className="form-explainer">
                Enter your registered Email Address. We will send a secure 6-digit OTP code to verify your identity.
              </p>

              <div className="form-group-custom">
                <label>Registered Email Address *</label>
                <input
                  type="email"
                  required
                  value={fpIdentifier}
                  onChange={(e) => setFpIdentifier(e.target.value)}
                  placeholder="student@infinityjob.in"
                  disabled={loading}
                />
              </div>

              <button type="submit" className="btn-auth-primary" disabled={loading}>
                {loading ? "Sending Email OTP..." : "Send 6-Digit Email OTP 📩"}
              </button>

              <div className="auth-secondary-actions text-center">
                <button
                  type="button"
                  className="btn-link-highlight"
                  onClick={() => {
                    setErrorMessage("");
                    setMode("LOGIN");
                  }}
                >
                  ← Back to Login
                </button>
              </div>
            </form>
          )}

          {/* --- MODE 4: FORGOT PASSWORD STEP 2 --- */}
          {mode === "FORGOT_STEP2" && (
            <form onSubmit={handleResetPassword} className="auth-form">
              <p className="form-explainer">
                Enter the 6-digit verification code sent to <strong>{fpIdentifier}</strong> and create your new password.
              </p>

              <div className="form-group-custom">
                <label>6-Digit Email Verification OTP *</label>
                <SixDigitOtpInput value={fpOtp} onChange={setFpOtp} disabled={loading} />
              </div>

              <div className="form-row-2">
                <div className="form-group-custom">
                  <label>New Password *</label>
                  <input
                    type="password"
                    required
                    placeholder="Min 4 characters"
                    value={fpNewPassword}
                    onChange={(e) => setFpNewPassword(e.target.value)}
                    disabled={loading}
                  />
                </div>
                <div className="form-group-custom">
                  <label>Confirm New Password *</label>
                  <input
                    type="password"
                    required
                    placeholder="Re-enter password"
                    value={fpConfirmPassword}
                    onChange={(e) => setFpConfirmPassword(e.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>

              <button type="submit" className="btn-auth-primary" disabled={loading}>
                {loading ? "Resetting Password..." : "Update Password & Secure Account 🔒"}
              </button>

              <div className="auth-secondary-actions text-center">
                <button
                  type="button"
                  className="btn-link-highlight"
                  onClick={() => setMode("FORGOT_STEP1")}
                >
                  ← Request New OTP
                </button>
              </div>
            </form>
          )}

          {/* --- MODE 5: FORGOT SUCCESS --- */}
          {mode === "FORGOT_SUCCESS" && (
            <div className="auth-success-box">
              <div className="success-check-circle">✓</div>
              <h4>Password Reset Successful!</h4>
              <p>Your password has been updated. You can now sign in with your new credentials.</p>
              <button
                type="button"
                className="btn-auth-primary"
                onClick={() => {
                  setErrorMessage("");
                  setMode("LOGIN");
                }}
              >
                Proceed to Sign In 🚀
              </button>
            </div>
          )}

          {/* --- MODE 6: 2FA OTP LOGIN --- */}
          {mode === "TWO_FACTOR" && (
            <div className="auth-form">
              {twoFaStep === 1 ? (
                <form onSubmit={handleSend2FaCode}>
                  <p className="form-explainer">
                    Enter your registered email address to receive a secure 6-digit OTP for passwordless 2-factor authentication.
                  </p>

                  <div className="form-group-custom">
                    <label>Account Email Address *</label>
                    <input
                      type="email"
                      required
                      value={twoFaEmail}
                      onChange={(e) => setTwoFaEmail(e.target.value)}
                      placeholder="student@infinityjob.in"
                      disabled={loading}
                    />
                  </div>

                  <button type="submit" className="btn-auth-primary" disabled={loading}>
                    {loading ? "Generating Code..." : "Send 6-Digit 2FA Code 📲"}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerify2FaCode}>
                  <p className="form-explainer">
                    Enter the 6-digit 2FA code sent to <strong>{twoFaEmail}</strong>.
                  </p>

                  <div className="form-group-custom">
                    <label>6-Digit 2FA OTP *</label>
                    <SixDigitOtpInput value={twoFaOtp} onChange={setTwoFaOtp} disabled={loading} />
                  </div>

                  <button type="submit" className="btn-auth-primary" disabled={loading}>
                    {loading ? "Verifying..." : "Verify & Sign In 🔐"}
                  </button>

                  <div className="auth-secondary-actions text-center">
                    <button
                      type="button"
                      className="btn-link-highlight"
                      onClick={() => setTwoFaStep(1)}
                    >
                      ← Re-enter Email
                    </button>
                  </div>
                </form>
              )}

              <div className="auth-secondary-actions text-center">
                <button
                  type="button"
                  className="btn-link-highlight"
                  onClick={() => {
                    setErrorMessage("");
                    setMode("LOGIN");
                  }}
                >
                  ← Return to Password Login
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
