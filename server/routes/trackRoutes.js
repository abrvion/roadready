import express from "express";
import { trackOrder } from "../controllers/orderController.js";

const router = express.Router();
router.get("/", trackOrder);
export default router;
