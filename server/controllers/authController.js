import {
  registerUser,
  loginUser,
  requestPasswordReset,
  resetPassword,
  verifyEmail,
  issueEmailVerification
} from "../services/authService.js";
import { sendPasswordResetEmail, sendVerificationEmail } from "../services/emailService.js";
import { env } from "../config/environment.js";
import { isValidEmail, normalizeEmail } from "../utils/validators.js";

const setSessionCookie = (res, token) => {
  const secure = env.nodeEnv === "production";
  res.setHeader(
    "Set-Cookie",
    `roadready_token=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${7 * 24 * 60 * 60}${secure ? "; Secure" : ""}`
  );
};

const clearSessionCookie = (res) => {
  res.setHeader(
    "Set-Cookie",
    "roadready_token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0"
  );
};

export const register = async (req, res) => {
  try {
    const name = String(req.body?.name || "").trim();
    const email = normalizeEmail(req.body?.email);
    const password = String(req.body?.password || "");
    const phone = String(req.body?.phone || "").trim() || null;

    if (name.length < 2 || name.length > 100) {
      return res.status(400).json({ success: false, message: "Name must be between 2 and 100 characters" });
    }
    if (!isValidEmail(email)) {
      return res.status(400).json({ success: false, message: "A valid email address is required" });
    }
    if (password.length < 8 || password.length > 128) {
      return res.status(400).json({ success: false, message: "Password must be between 8 and 128 characters" });
    }

    const result = await registerUser(name, email, password, phone);
    const verificationUrl = `${env.appUrl.replace(/\/$/, "")}/verify-email?token=${encodeURIComponent(result.verificationToken)}`;
    await sendVerificationEmail({ to: result.user.email, name: result.user.name, verificationUrl });
    return res.status(201).json({ success: true, message: "Account created. Please check your email to verify your account.", user: result.user, verificationRequired: true });
  } catch (error) {
    if (error.message === "Email already registered") {
      return res.status(409).json({ success: false, message: error.message });
    }
    console.error("Registration failed:", error);
    return res.status(500).json({ success: false, message: "Registration failed" });
  }
};

export const login = async (req, res) => {
  try {
    const email = normalizeEmail(req.body?.email);
    const password = String(req.body?.password || "");
    if (!isValidEmail(email) || !password) {
      return res.status(400).json({ success: false, message: "A valid email and password are required" });
    }

    const result = await loginUser(email, password);
    setSessionCookie(res, result.token);
    return res.json({ success: true, message: "Login successful", user: result.user, token: result.token });
  } catch (error) {
    if (error.message === "Invalid email or password" || error.message === "Please verify your email address before signing in") {
      return res.status(401).json({ success: false, message: error.message });
    }
    console.error("Login failed:", error);
    return res.status(500).json({ success: false, message: "Login failed" });
  }
};

export const forgotPassword = async (req, res) => {
  const email = normalizeEmail(req.body?.email);
  if (!isValidEmail(email)) {
    return res.status(400).json({ success: false, message: "A valid email address is required" });
  }

  try {
    const result = await requestPasswordReset(email);
    const resetUrl = `${env.appUrl.replace(/\/$/, "")}/reset-password?token=${encodeURIComponent(result.resetToken)}`;
    await sendPasswordResetEmail({ to: result.email, resetUrl });
    return res.json({ success: true, message: "If an account exists for that email, password reset instructions have been sent." });
  } catch (error) {
    if (error.message === "User not found") {
      return res.json({ success: true, message: "If an account exists for that email, password reset instructions have been sent." });
    }
    console.error("Forgot password failed:", error);

    // Give local developers an actionable configuration error while keeping
    // production responses generic so we never leak provider details.
    if (env.nodeEnv !== "production" && error.providerStatus === 403) {
      return res.status(503).json({
        success: false,
        message: "Resend rejected the sender or recipient. For local testing, use EMAIL_FROM=onboarding@resend.dev and send to the email address associated with your Resend account, or verify a domain in Resend before sending to other recipients."
      });
    }

    console.error("Forgot password failed:", error);
    return res.status(503).json({ success: false, message: "Password reset email service is temporarily unavailable. Check the email provider configuration." });
  }
};

export const resetPasswordController = async (req, res) => {
  try {
    const token = String(req.body?.token || "").trim();
    const newPassword = String(req.body?.newPassword || "");
    if (!token || !newPassword) {
      return res.status(400).json({ success: false, message: "Reset token and new password are required" });
    }
    if (newPassword.length < 8 || newPassword.length > 128) {
      return res.status(400).json({ success: false, message: "Password must be between 8 and 128 characters" });
    }

    await resetPassword(token, newPassword);
    return res.json({ success: true, message: "Password reset successful" });
  } catch (error) {
    if (error.message === "Invalid or expired reset token") {
      return res.status(400).json({ success: false, message: error.message });
    }
    console.error("Reset password failed:", error);
    return res.status(500).json({ success: false, message: "Unable to reset password" });
  }
};

export const resendVerification = async (req, res) => {
  const email = normalizeEmail(req.body?.email);
  if (!isValidEmail(email)) return res.status(400).json({ success: false, message: "A valid email address is required" });
  try {
    const user = await (await import("../models/User.js")).findUserByEmail(email);
    if (user && user.email_verified === false) {
      const verification = await issueEmailVerification(user.id);
      const verificationUrl = `${env.appUrl.replace(/\/$/, "")}/verify-email?token=${encodeURIComponent(verification.verificationToken)}`;
      await sendVerificationEmail({ to: user.email, name: user.name, verificationUrl });
    }
    return res.json({ success: true, message: "If that account is awaiting verification, a new verification email has been sent." });
  } catch (error) {
    console.error("Resend verification failed:", error);
    if (env.nodeEnv !== "production" && error.providerStatus === 403) {
      return res.status(503).json({
        success: false,
        message: "Resend rejected the sender or recipient. For local testing, use EMAIL_FROM=onboarding@resend.dev and send to the email address associated with your Resend account, or verify a domain in Resend before sending to other recipients."
      });
    }
    return res.status(503).json({ success: false, message: "Verification email service is temporarily unavailable. Check the email provider configuration." });
  }
};

export const verifyEmailController = async (req, res) => {
  try {
    const token = String(req.query?.token || "").trim();
    if (!token) return res.status(400).json({ success: false, message: "Verification token is required" });
    const user = await verifyEmail(token);
    return res.json({ success: true, message: "Email verified successfully. You can now sign in.", user });
  } catch (error) {
    if (error.message === "Invalid or expired verification link") return res.status(400).json({ success: false, message: error.message });
    console.error("Email verification failed:", error);
    return res.status(500).json({ success: false, message: "Unable to verify email" });
  }
};

export const logout = async (req, res) => {
  clearSessionCookie(res);
  return res.json({ success: true, message: "Signed out successfully" });
};
