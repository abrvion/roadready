import { addWishlistItem, listWishlistItems, removeWishlistItem } from "../models/Wishlist.js";

export const getWishlist = async (req, res) => {
  try {
    res.json({ success: true, items: await listWishlistItems(req.user.id) });
  } catch (error) {
    console.error("Failed to fetch wishlist:", error);
    res.status(500).json({ success: false, message: "Failed to fetch wishlist" });
  }
};

export const addToWishlist = async (req, res) => {
  const productId = Number(req.body?.productId);
  if (!Number.isInteger(productId) || productId <= 0) {
    return res.status(400).json({ success: false, message: "A valid productId is required" });
  }
  try {
    const item = await addWishlistItem(req.user.id, productId);
    if (!item) return res.status(404).json({ success: false, message: "Product not found" });
    return res.status(201).json({ success: true, item });
  } catch (error) {
    console.error("Failed to add wishlist item:", error);
    return res.status(500).json({ success: false, message: "Failed to update wishlist" });
  }
};

export const removeFromWishlist = async (req, res) => {
  const productId = Number(req.params.productId);
  if (!Number.isInteger(productId) || productId <= 0) {
    return res.status(400).json({ success: false, message: "A valid productId is required" });
  }
  try {
    const item = await removeWishlistItem(req.user.id, productId);
    if (!item) return res.status(404).json({ success: false, message: "Wishlist item not found" });
    return res.json({ success: true, item });
  } catch (error) {
    console.error("Failed to remove wishlist item:", error);
    return res.status(500).json({ success: false, message: "Failed to update wishlist" });
  }
};
