import axios from 'axios';

const AUTH_BASE_URL = 'http://localhost:8080/api/auth';

export const registerUser = async (userData) => {
  const response = await axios.post(`${AUTH_BASE_URL}/register`, userData);
  return response.data;
};

export const loginWithCredentials = async (usernameOrEmail, password) => {
  const response = await axios.post(`${AUTH_BASE_URL}/login`, {
    username: usernameOrEmail,
    password: password,
  });
  return response.data;
};

export const sendForgotPasswordOtp = async (identifier, channel = 'EMAIL') => {
  const response = await axios.post(`${AUTH_BASE_URL}/forgot-password/send-otp`, {
    identifier,
    channel,
  });
  return response.data;
};

export const resetPasswordWithOtp = async (identifier, otp, newPassword) => {
  const response = await axios.post(`${AUTH_BASE_URL}/forgot-password/reset`, {
    identifier,
    otp,
    newPassword,
  });
  return response.data;
};

export const sendAuthCode = async (email, purpose = 'Portal 2FA Verification') => {
  const response = await axios.post(`${AUTH_BASE_URL}/send-code`, { email, purpose });
  return response.data;
};

export const verifyAuthCode = async (email, code) => {
  const response = await axios.post(`${AUTH_BASE_URL}/verify-code`, { email, code });
  return response.data;
};

export const getAuthStatus = async () => {
  const response = await axios.get(`${AUTH_BASE_URL}/status`);
  return response.data;
};
