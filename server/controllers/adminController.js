
// Admin controller logic.

import {
  getDashboardData,

  listCategories,
  getCategory as getCategoryById,
  addCategory,
  editCategory,
  changeCategoryStatus,
  removeCategory,

  listProducts,
  getProduct,
  addProduct,
  editProduct,
  changeProductStatus,

  listOrders,
  getAdminOrder,
  changeOrderStatus,

  listCustomers,
  getAdminCustomer
} from "../services/adminService.js";


const sendError = (res, error) => {
  console.error("Admin API error:", error);

  const clientErrors = [
    "Category name is required",
    "Category not found",
    "Product not found",
    "Product name is required",
    "Valid product price is required",
    "Valid stock quantity is required",
    "Valid category is required",
    "Customer not found",
    "Order not found",
    "Invalid category status",
    "Invalid product status",
    "Invalid order status",
    "Cannot delete a category that contains products",
    "Cancelled orders cannot be changed",
    "Delivered orders cannot be changed"
  ];

  if (clientErrors.includes(error.message)) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }

  return res.status(500).json({
    success: false,
    message: "Admin operation failed"
  });
};


/*
  DASHBOARD
*/

export const dashboard = async (req, res) => {
  try {
    const data =
      await getDashboardData();

    res.json({
      success: true,
      ...data
    });
  } catch (error) {
    sendError(res, error);
  }
};


/*
  CATEGORIES
*/

export const getCategories = async (
  req,
  res
) => {
  try {
    const categories =
      await listCategories({
        search: req.query.search || "",
        status: req.query.status || "all"
      });

    res.json({
      success: true,
      categories
    });
  } catch (error) {
    sendError(res, error);
  }
};


/*
  GET ONE CATEGORY
*/

export const getCategory = async (
  req,
  res
) => {
  try {
    const category =
      await getCategoryById(
        req.params.id
      );

    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }
    res.json({ success: true, category });
  } catch (error) {
    sendError(res, error);
  }
};


export const createCategory = async (
  req,
  res
) => {
  try {
    const category =
      await addCategory(
        req.body.name,
        req.body.description,
        req.body.image
      );

    res.status(201).json({
      success: true,
      message: "Category created successfully",
      category
    });
  } catch (error) {
    sendError(res, error);
  }
};


export const updateCategory = async (
  req,
  res
) => {
  try {
    const category =
      await editCategory(
        req.params.id,
        req.body.name,
        req.body.description,
        req.body.image
      );

    res.json({
      success: true,
      message: "Category updated successfully",
      category
    });
  } catch (error) {
    sendError(res, error);
  }
};


export const updateCategoryStatus = async (
  req,
  res
) => {
  try {
    const category =
      await changeCategoryStatus(
        req.params.id,
        req.body.status
      );

    res.json({
      success: true,
      message: "Category status updated",
      category
    });
  } catch (error) {
    sendError(res, error);
  }
};


export const deleteCategory = async (
  req,
  res
) => {
  try {
    await removeCategory(
      req.params.id
    );

    res.json({
      success: true,
      message: "Category deleted successfully"
    });
  } catch (error) {
    sendError(res, error);
  }
};


/*
  PRODUCTS
*/

export const getProducts = async (
  req,
  res
) => {
  try {
    const page = Math.max(1, Math.min(10000, Number(req.query.page) || 1));
    const limit = Math.max(1, Math.min(100, Number(req.query.limit) || 20));
    const data =
      await listProducts({
        search: req.query.search || "",
        categoryId:
          req.query.categoryId || "all",
        stockFilter:
          req.query.stockFilter || "all",
        status:
          req.query.status || "all",
        page,
        limit
      });

    res.json({
      success: true,
      ...data
    });
  } catch (error) {
    sendError(res, error);
  }
};


export const getProductById = async (
  req,
  res
) => {
  try {
    const product =
      await getProduct(
        req.params.id
      );

    res.json({
      success: true,
      product
    });
  } catch (error) {
    sendError(res, error);
  }
};


export const createProduct = async (
  req,
  res
) => {
  try {
    const product =
      await addProduct(
        req.body
      );

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      product
    });
  } catch (error) {
    sendError(res, error);
  }
};


export const updateProduct = async (
  req,
  res
) => {
  try {
    const product =
      await editProduct(
        req.params.id,
        req.body
      );

    res.json({
      success: true,
      message: "Product updated successfully",
      product
    });
  } catch (error) {
    sendError(res, error);
  }
};


export const updateProductStatus = async (
  req,
  res
) => {
  try {
    const product =
      await changeProductStatus(
        req.params.id,
        req.body.status
      );

    res.json({
      success: true,
      message: "Product status updated",
      product
    });
  } catch (error) {
    sendError(res, error);
  }
};


/*
  ORDERS
*/

export const getOrders = async (
  req,
  res
) => {
  try {
    const page = Math.max(1, Math.min(10000, Number(req.query.page) || 1));
    const limit = Math.max(1, Math.min(100, Number(req.query.limit) || 20));
    const data =
      await listOrders({
        search:
          req.query.search || "",
        status:
          req.query.status || "all",
        page,
        limit
      });

    res.json({
      success: true,
      ...data
    });
  } catch (error) {
    sendError(res, error);
  }
};


export const getOrder = async (
  req,
  res
) => {
  try {
    const data =
      await getAdminOrder(
        req.params.id
      );

    res.json({
      success: true,
      ...data
    });
  } catch (error) {
    sendError(res, error);
  }
};


export const updateOrderStatus = async (
  req,
  res
) => {
  try {
    const order =
      await changeOrderStatus(
        req.params.id,
        req.body.status
      );

    res.json({
      success: true,
      message: "Order status updated",
      order
    });
  } catch (error) {
    sendError(res, error);
  }
};


/*
  CUSTOMERS
*/

export const getCustomers = async (
  req,
  res
) => {
  try {
    const page = Math.max(1, Math.min(10000, Number(req.query.page) || 1));
    const limit = Math.max(1, Math.min(100, Number(req.query.limit) || 20));
    const data =
      await listCustomers({
        search:
          req.query.search || "",
        page,
        limit
      });

    res.json({
      success: true,
      ...data
    });
  } catch (error) {
    sendError(res, error);
  }
};


export const getCustomer = async (
  req,
  res
) => {
  try {
    const data =
      await getAdminCustomer(
        req.params.id
      );

    res.json({
      success: true,
      ...data
    });
  } catch (error) {
    sendError(res, error);
  }
};

