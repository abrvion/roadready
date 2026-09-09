
import {
  createOrderFromCart
} from "../services/orderService.js";

import {
  getOrderById,
  getOrdersByUserId,
  findOrderForTracking
} from "../models/Order.js";

export const createOrder = async (req, res) => {
  try {
    const { addressId } = req.body;

    const userId = req.user.id;

    if (!addressId) {
      return res.status(400).json({
        success: false,
        message: "addressId is required"
      });
    }

    const result = await createOrderFromCart(
      userId,
      addressId
    );

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      order: result.order,
      items: result.items
    });
  } catch (error) {
    console.error("Failed to create order:", error);

    if (
      error.message === "Address not found" ||
      error.message === "Cart is empty"
    ) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    if (
      error.message.startsWith("Not enough stock")
    ) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to create order"
    });
  }
};

export const getOrder = async (req, res) => {
  try {
    const userId = req.user.id;

    const items = await getOrderById(
      req.params.id,
      userId
    );

    if (items.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    const firstItem = items[0];

    const order = {
      id: firstItem.id,
      orderNumber: firstItem.order_number,
      userId: firstItem.user_id,
      addressId: firstItem.address_id,
      total: firstItem.total,

      // Historical shipping address snapshot
      shippingName: firstItem.shipping_name,
      shippingPhone: firstItem.shipping_phone,
      shippingAddressLine:
        firstItem.shipping_address_line,
      shippingCity: firstItem.shipping_city,
      shippingPostalCode:
        firstItem.shipping_postal_code,

      status: firstItem.status,
      paymentStatus: firstItem.payment_status,
      createdAt: firstItem.created_at,

      items: items.map((item) => ({
        productId: item.product_id,
        name: item.name,
        image: item.image,
        quantity: item.quantity,
        price: item.price
      }))
    };

    res.json({
      success: true,
      order
    });
  } catch (error) {
    console.error(
      "Failed to fetch order:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to fetch order"
    });
  }
};

export const getUserOrders = async (req, res) => {
  try {
    const userId = req.user.id;

    const orders = await getOrdersByUserId(
      userId
    );

    res.json({
      success: true,
      orders
    });
  } catch (error) {
    console.error(
      "Failed to fetch user orders:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to fetch user orders"
    });
  }
};



export const trackOrder = async (req, res) => {
  const orderNumber = String(req.query.orderNumber || "").trim().toUpperCase();
  const email = String(req.query.email || "").trim().toLowerCase();

  if (!/^RR-[0-9]{6,}$/.test(orderNumber) || !email) {
    return res.status(400).json({ success: false, message: "Valid order number and email are required" });
  }

  try {
    const order = await findOrderForTracking(orderNumber, email);
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });
    res.json({ success: true, order });
  } catch (error) {
    console.error("Failed to track order:", error);
    res.status(500).json({ success: false, message: "Unable to track order" });
  }
};
