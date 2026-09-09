// Admin authorization middleware.
import { getUserById } from "../models/User.js";

export const requireAdmin = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required"
    });
  }

  try {
    // Read the current role from PostgreSQL instead of trusting a potentially
    // stale role claim inside a long-lived JWT.
    const user = await getUserById(req.user.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User account no longer exists"
      });
    }

    if (user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin access required"
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Admin authorization failed:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to verify admin access"
    });
  }
};
