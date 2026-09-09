import express from "express";
import {
  getBikes,
  getBikeProducts
} from "../controllers/bikeController.js";

const router = express.Router();

router.get("/", getBikes);
router.get("/:id/products", getBikeProducts);

export default router;
