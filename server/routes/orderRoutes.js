import express from "express";

import {
  createOrder,
  getOrder,
  getUserOrders
} from "../controllers/orderController.js";

import { authenticate } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post(
  "/",
  authenticate,
  createOrder
);

router.get(
  "/",
  authenticate,
  getUserOrders
);

router.get(
  "/:id",
  authenticate,
  getOrder
);

export default router;