import { getUserById, updateUserProfile } from "../models/User.js";
import { isValidEmail, normalizeEmail, cleanText } from "../utils/validators.js";
import { issueEmailVerification } from "../services/authService.js";
import { sendVerificationEmail } from "../services/emailService.js";
import { env } from "../config/environment.js";

const publicUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: user.role,
  email_verified: user.email_verified !== false
});

export const getProfile = async (req, res) => {
  try {
    const user = await getUserById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    res.json({ success: true, user: publicUser(user) });
  } catch (error) {
    console.error("Failed to fetch profile:", error);
    res.status(500).json({ success: false, message: "Failed to fetch profile" });
  }
};

export const updateProfile = async (req, res) => {
  const name = cleanText(req.body.name, 100);
  const email = normalizeEmail(req.body.email);
  const phone = cleanText(req.body.phone, 30) || null;

  if (!name || name.length < 2) return res.status(400).json({ success: false, message: "Name must be at least 2 characters" });
  if (!isValidEmail(email)) return res.status(400).json({ success: false, message: "A valid email address is required" });

  try {
    const current = await getUserById(req.user.id);
    const emailChanged = current?.email?.toLowerCase() !== email.toLowerCase();
    const user = await updateUserProfile(req.user.id, name, email, phone);
    if (emailChanged) {
      const verification = await issueEmailVerification(user.id);
      const verificationUrl = `${env.appUrl.replace(/\/$/, "")}/verify-email?token=${encodeURIComponent(verification.verificationToken)}`;
      await sendVerificationEmail({ to: user.email, name: user.name, verificationUrl });
      return res.json({ success: true, message: "Profile updated. Please verify your new email address.", user: publicUser(user), verificationRequired: true });
    }
    res.json({ success: true, message: "Profile updated successfully", user: publicUser(user) });
  } catch (error) {
    if (error.code === "23505") return res.status(409).json({ success: false, message: "Email is already registered" });
    console.error("Failed to update profile:", error);
    res.status(500).json({ success: false, message: "Failed to update profile" });
  }
};
