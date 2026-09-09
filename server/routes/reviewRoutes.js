import express from "express";
import { authenticate } from "../middleware/authMiddleware.js";
import { getReviews, create, update, remove } from "../controllers/reviewController.js";

const router = express.Router();
router.get("/product/:productId", getReviews);
router.post("/product/:productId", authenticate, create);
router.put("/:id", authenticate, update);
router.delete("/:id", authenticate, remove);
export default router;
