// Cart controller logic.

import {
  addToCart,
  updateCartItem,
  removeCartItem
} from "../services/cartService.js";

import { getCartByUserId } from "../models/Cart.js";

export const addProductToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    const userId = req.user.id;

    const parsedProductId = Number(productId);
    const parsedQuantity = Number(quantity);

    if (!Number.isInteger(parsedProductId) || parsedProductId <= 0 || !Number.isInteger(parsedQuantity) || parsedQuantity <= 0) {
      return res.status(400).json({
        success: false,
        message: "productId and quantity are required"
      });
    }

    const result = await addToCart(
      userId,
      parsedProductId,
      parsedQuantity
    );

    res.status(201).json({
      success: true,
      message: "Product added to cart",
      cartId: result.cartId
    });
  } catch (error) {
    console.error("Failed to add product to cart:", error);

    if (error.message === "Product not found") {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    if (
      error.message === "Quantity must be greater than 0" ||
      error.message === "Not enough stock available"
    ) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to add product to cart"
    });
  }
};

export const getCart = async (req, res) => {
  try {
    const userId = req.user.id;

    const cart = await getCartByUserId(userId);

    res.json({
      success: true,
      cart
    });
  } catch (error) {
    console.error("Failed to fetch cart:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch cart"
    });
  }
};

export const updateCartItemQuantity = async (req, res) => {
  try {
    const { quantity } = req.body;

    const userId = req.user.id;

    const parsedQuantity = Number(quantity);

    if (!Number.isInteger(parsedQuantity) || parsedQuantity <= 0) {
      return res.status(400).json({
        success: false,
        message: "quantity is required"
      });
    }

    const result = await updateCartItem(
      userId,
      req.params.id,
      parsedQuantity
    );

    res.json({
      success: true,
      message: "Cart item updated",
      cartItem: result
    });
  } catch (error) {
    console.error("Failed to update cart item:", error);

    if (error.message === "Cart item not found") {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    if (
      error.message === "Quantity must be greater than 0" ||
      error.message === "Not enough stock available"
    ) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to update cart item"
    });
  }
};

export const deleteCartItem = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await removeCartItem(
      userId,
      req.params.id
    );

    res.json({
      success: true,
      message: "Cart item removed",
      cartItem: result
    });
  } catch (error) {
    console.error("Failed to remove cart item:", error);

    if (error.message === "Cart item not found") {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to remove cart item"
    });
  }
};