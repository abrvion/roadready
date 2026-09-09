import pool from "../config/database.js";
import { isValidEmail, normalizeEmail } from "../utils/validators.js";

export const subscribe = async (req, res) => {
  const email = normalizeEmail(req.body?.email);
  if (!isValidEmail(email)) return res.status(400).json({ success: false, message: "A valid email address is required" });
  try {
    await pool.query(`INSERT INTO newsletter_subscribers (email) VALUES ($1) ON CONFLICT (email) DO UPDATE SET updated_at = CURRENT_TIMESTAMP;`, [email]);
    res.status(201).json({ success: true, message: "You're subscribed to RoadReady updates." });
  } catch (error) {
    console.error("Newsletter subscription failed:", error);
    res.status(500).json({ success: false, message: "Unable to subscribe right now" });
  }
};
