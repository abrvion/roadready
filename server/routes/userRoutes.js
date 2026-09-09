import express from "express";
import { authenticate } from "../middleware/authMiddleware.js";
import { getProfile, updateProfile } from "../controllers/userController.js";

const router = express.Router();
router.use(authenticate);
router.get("/me", getProfile);
router.put("/me", updateProfile);
export default router;
