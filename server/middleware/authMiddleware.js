// Authentication middleware.
import jwt from "jsonwebtoken";
import { env } from "../config/environment.js";

const getCookieToken = (req) => {
  const header = req.headers.cookie || "";
  const match = header.match(/(?:^|;\s*)roadready_token=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
};

export const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const bearerToken = authHeader?.startsWith("Bearer ")
      ? authHeader.slice(7).trim()
      : null;
    const token = bearerToken || getCookieToken(req);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }

    const decoded = jwt.verify(token, env.jwtSecret);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token"
    });
  }
};
