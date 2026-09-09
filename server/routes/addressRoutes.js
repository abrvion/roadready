// Address API routes.

import express from "express";

import {
  createAddress,
  getAddresses,
  getAddress,
  updateAddressController,
  deleteAddressController
} from "../controllers/addressController.js";

import { authenticate } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post(
  "/",
  authenticate,
  createAddress
);

router.get(
  "/",
  authenticate,
  getAddresses
);

router.get(
  "/:id",
  authenticate,
  getAddress
);

router.put(
  "/:id",
  authenticate,
  updateAddressController
);

router.delete(
  "/:id",
  authenticate,
  deleteAddressController
);

export default router;