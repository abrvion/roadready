// Product controller logic.
import {
  getAllProducts,
  getProductById
} from "../models/Product.js";

export const getProducts = async (req, res) => {
  try {
    const products = await getAllProducts();

    res.json({
      success: true,
      products
    });
  } catch (error) {
    console.error("Failed to fetch products:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch products"
    });
  }
};

export const getProduct = async (req, res) => {
  try {
    const product = await getProductById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    res.json({
      success: true,
      product
    });
  } catch (error) {
    console.error("Failed to fetch product:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch product"
    });
  }
};