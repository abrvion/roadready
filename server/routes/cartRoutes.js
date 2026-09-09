// Cart API routes.

import express from "express";

import {
  addProductToCart,
  getCart,
  updateCartItemQuantity,
  deleteCartItem
} from "../controllers/cartController.js";

import { authenticate } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", authenticate, addProductToCart);

router.put(
  "/items/:id",
  authenticate,
  updateCartItemQuantity
);

router.delete(
  "/items/:id",
  authenticate,
  deleteCartItem
);

router.get("/", authenticate, getCart);

export default router;