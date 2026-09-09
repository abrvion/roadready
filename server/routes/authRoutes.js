import express from "express";

import {
  register,
  login,
  forgotPassword,
  resetPasswordController,
  verifyEmailController,
  resendVerification,
  logout
} from "../controllers/authController.js";

import { authenticate } from "../middleware/authMiddleware.js";
import { getUserById } from "../models/User.js";
import { rateLimit } from "../middleware/rateLimitMiddleware.js";

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 30 });
const sensitiveAuthLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10 });

const router = express.Router();

router.post("/register", authLimiter, register);

router.post("/login", sensitiveAuthLimiter, login);

router.post("/forgot-password", sensitiveAuthLimiter, forgotPassword);

router.post("/reset-password", sensitiveAuthLimiter, resetPasswordController);
router.get("/verify-email", sensitiveAuthLimiter, verifyEmailController);
router.post("/resend-verification", sensitiveAuthLimiter, resendVerification);

router.post("/logout", logout);

router.get("/me", authenticate, async (req, res) => {
  try {
    const user = await getUserById(req.user.id);
    if (!user) return res.status(401).json({ success: false, message: "User account no longer exists" });
    res.json({ success: true, user });
  } catch (error) {
    console.error("Failed to load current user:", error);
    res.status(500).json({ success: false, message: "Failed to load current user" });
  }
});

export default router;