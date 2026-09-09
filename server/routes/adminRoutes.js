
import express from "express";
import {
  adminListBikes,
  adminCreateBike,
  adminUpdateBike,
  adminDeleteBike,
  adminSetCompatibility
} from "../controllers/bikeController.js";

import {
  dashboard,

  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  updateCategoryStatus,
  deleteCategory,

  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  updateProductStatus,

  getOrders,
  getOrder,
  updateOrderStatus,

  getCustomers,
  getCustomer
} from "../controllers/adminController.js";

import { authenticate } from "../middleware/authMiddleware.js";
import { requireAdmin } from "../middleware/adminMiddleware.js";

const router = express.Router();

router.use(
  authenticate,
  requireAdmin
);


/*
  DASHBOARD
*/

router.get(
  "/dashboard",
  dashboard
);

router.get("/bikes", adminListBikes);
router.post("/bikes", adminCreateBike);
router.put("/bikes/:id", adminUpdateBike);
router.delete("/bikes/:id", adminDeleteBike);
router.put("/bikes/:id/compatibility", adminSetCompatibility);


/*
  CATEGORIES
*/

router.get(
  "/categories",
  getCategories
);

router.get(
  "/categories/:id",
  getCategory
);

router.post(
  "/categories",
  createCategory
);

router.put(
  "/categories/:id",
  updateCategory
);

router.patch(
  "/categories/:id/status",
  updateCategoryStatus
);

router.delete(
  "/categories/:id",
  deleteCategory
);


/*
  PRODUCTS
*/

router.get(
  "/products",
  getProducts
);

router.get(
  "/products/:id",
  getProductById
);

router.post(
  "/products",
  createProduct
);

router.put(
  "/products/:id",
  updateProduct
);

router.patch(
  "/products/:id/status",
  updateProductStatus
);


/*
  ORDERS
*/

router.get(
  "/orders",
  getOrders
);

router.get(
  "/orders/:id",
  getOrder
);

router.patch(
  "/orders/:id/status",
  updateOrderStatus
);


/*
  CUSTOMERS
*/

router.get(
  "/customers",
  getCustomers
);

router.get(
  "/customers/:id",
  getCustomer
);


export default router;

