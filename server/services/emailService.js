import { env } from "../config/environment.js";

const escapeHtml = (value) => String(value ?? "")
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#039;");

const sendEmail = async ({ to, subject, html }) => {
  if (!env.resendApiKey || !env.emailFrom) {
    if (env.nodeEnv !== "production") {
      console.warn(`Email service not configured. Development email recipient: ${to}`);
      console.warn(`Development email subject: ${subject}`);
      return { delivered: false, developmentOnly: true };
    }
    throw new Error("Email service is not configured");
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.resendApiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ from: env.emailFrom, to: [to], subject, html })
  });

  if (!response.ok) {
    const detail = await response.text();
    let parsed = null;
    try { parsed = JSON.parse(detail); } catch {}
    const providerMessage = parsed?.message || parsed?.error?.message || detail || `HTTP ${response.status}`;
    const error = new Error(`Email provider rejected the request: ${providerMessage}`);
    error.providerStatus = response.status;
    error.providerMessage = providerMessage;
    throw error;
  }

  const result = await response.json().catch(() => ({}));
  return { delivered: true, id: result?.id || null };
};

export const sendVerificationEmail = ({ to, name, verificationUrl }) =>
  sendEmail({
    to,
    subject: "Verify your RoadReady email",
    html: `<div style="font-family:Arial,sans-serif;line-height:1.6;color:#172033"><h2>Welcome to RoadReady, ${escapeHtml(name)}.</h2><p>Please verify your email address to activate your account.</p><p><a href="${escapeHtml(verificationUrl)}" style="display:inline-block;padding:12px 18px;background:#111827;color:#fff;text-decoration:none;border-radius:8px">Verify email</a></p><p>This link expires in 24 hours. If you did not create this account, you can ignore this email.</p></div>`
  });

export const sendPasswordResetEmail = ({ to, resetUrl }) =>
  sendEmail({
    to,
    subject: "Reset your RoadReady password",
    html: `<div style="font-family:Arial,sans-serif;line-height:1.6;color:#172033"><h2>Reset your RoadReady password</h2><p>We received a request to reset your RoadReady password.</p><p><a href="${escapeHtml(resetUrl)}" style="display:inline-block;padding:12px 18px;background:#111827;color:#fff;text-decoration:none;border-radius:8px">Reset password</a></p><p>This link expires in 30 minutes. If you did not request this, you can ignore this email.</p></div>`
  });
