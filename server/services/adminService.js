
import {
  getDashboardStats,
  getRecentOrders,
  getBestSellingProducts,

  getCategories,
  getCategoryById,
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
  getOrderDetailsForAdmin,
  updateOrderStatus,

  getCustomers,
  getCustomerSummary,
  getCustomerDetails
} from "../models/Admin.js";


export const getDashboardData = async () => {
  const [stats, recentOrders, bestSellers] = await Promise.all([
    getDashboardStats(),
    getRecentOrders(),
    getBestSellingProducts()
  ]);

  return { stats, recentOrders, bestSellers };
};


/*
  CATEGORIES
*/

export const listCategories = async (options) => {
  return getCategories(options);
};

export const getCategory = async (id) => {
  const category =
    await getCategoryById(id);

  if (!category) {
    throw new Error("Category not found");
  }

  return category;
};

export const addCategory = async (
  name,
  description,
  image
) => {
  if (!name?.trim()) {
    throw new Error(
      "Category name is required"
    );
  }

  return createCategory(
    name.trim(),
    description,
    image
  );
};

export const editCategory = async (
  id,
  name,
  description,
  image
) => {
  if (!name?.trim()) {
    throw new Error(
      "Category name is required"
    );
  }

  const category =
    await updateCategory(
      id,
      name.trim(),
      description,
      image
    );

  if (!category) {
    throw new Error(
      "Category not found"
    );
  }

  return category;
};

export const changeCategoryStatus = async (
  id,
  status
) => {
  if (
    !["active", "inactive"].includes(status)
  ) {
    throw new Error(
      "Invalid category status"
    );
  }

  const category =
    await updateCategoryStatus(
      id,
      status
    );

  if (!category) {
    throw new Error(
      "Category not found"
    );
  }

  return category;
};

export const removeCategory = async (id) => {
  const category =
    await deleteCategory(id);

  if (!category) {
    throw new Error(
      "Category not found"
    );
  }

  return category;
};


/*
  PRODUCTS
*/

export const listProducts = async (options) => {
  return getProducts(options);
};

export const getProduct = async (id) => {
  const product =
    await getProductById(id);

  if (!product) {
    throw new Error(
      "Product not found"
    );
  }

  return product;
};

const validateProduct = ({
  name,
  price,
  stock,
  categoryId
}) => {
  if (!name?.trim()) {
    throw new Error(
      "Product name is required"
    );
  }

  if (
    price === undefined ||
    Number.isNaN(Number(price)) ||
    Number(price) < 0
  ) {
    throw new Error(
      "Valid product price is required"
    );
  }

  if (
    stock === undefined ||
    Number.isNaN(Number(stock)) ||
    Number(stock) < 0 ||
    !Number.isInteger(Number(stock))
  ) {
    throw new Error(
      "Valid stock quantity is required"
    );
  }

  if (
    categoryId === undefined ||
    Number.isNaN(Number(categoryId))
  ) {
    throw new Error(
      "Valid category is required"
    );
  }
};

export const addProduct = async (data) => {
  validateProduct(data);

  return createProduct({
    name: data.name.trim(),
    description: data.description,
    price: Number(data.price),
    stock: Number(data.stock),
    brand: data.brand,
    categoryId: Number(data.categoryId),
    image: data.image
  });
};

export const editProduct = async (
  id,
  data
) => {
  validateProduct(data);

  const product =
    await updateProduct(
      id,
      {
        name: data.name.trim(),
        description: data.description,
        price: Number(data.price),
        stock: Number(data.stock),
        brand: data.brand,
        categoryId: Number(data.categoryId),
        image: data.image
      }
    );

  if (!product) {
    throw new Error(
      "Product not found"
    );
  }

  return product;
};

export const changeProductStatus = async (
  id,
  status
) => {
  if (
    !["active", "inactive"].includes(status)
  ) {
    throw new Error(
      "Invalid product status"
    );
  }

  const product =
    await updateProductStatus(
      id,
      status
    );

  if (!product) {
    throw new Error(
      "Product not found"
    );
  }

  return product;
};


/*
  ORDERS
*/

export const listOrders = async (options) => {
  return getOrders(options);
};

export const getAdminOrder = async (id) => {
  const result =
    await getOrderDetailsForAdmin(id);

  if (!result) {
    throw new Error(
      "Order not found"
    );
  }

  return result;
};

export const changeOrderStatus = async (
  id,
  status
) => {
  return updateOrderStatus(
    id,
    status
  );
};


/*
  CUSTOMERS
*/

export const listCustomers = async (options) => {
  const [data, summary] = await Promise.all([getCustomers(options), getCustomerSummary()]);
  return { ...data, summary };
};

export const getAdminCustomer = async (id) => {
  const result =
    await getCustomerDetails(id);

  if (!result) {
    throw new Error(
      "Customer not found"
    );
  }

  return result;
};

