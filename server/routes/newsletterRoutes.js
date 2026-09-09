import express from "express";
import { subscribe } from "../controllers/newsletterController.js";
import { rateLimit } from "../middleware/rateLimitMiddleware.js";
const router = express.Router();
router.post("/", rateLimit({ windowMs: 15 * 60 * 1000, max: 10 }), subscribe);
export default router;
