import { getProductById } from "../models/Product.js";
import { createReview, deleteReview, getProductReviewSummary, getUserReview, hasDeliveredPurchase, listProductReviews, updateReview } from "../models/Review.js";

const validate = (body) => {
  const rating = Number(body?.rating);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) throw new Error("Rating must be between 1 and 5");
  const title = String(body?.title || "").trim();
  const text = String(body?.body || "").trim();
  if (title.length > 120) throw new Error("Review title is too long");
  if (text.length > 2000) throw new Error("Review is too long");
  if (!title && !text) throw new Error("Please write a review");
  return { rating, title, body: text };
};

export const getReviews = async (req, res) => {
  try {
    const product = await getProductById(req.params.productId);
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });
    const [reviews, summary] = await Promise.all([listProductReviews(product.id), getProductReviewSummary(product.id)]);
    res.json({ success: true, reviews, summary });
  } catch (error) {
    console.error("Failed to load reviews:", error);
    res.status(500).json({ success: false, message: "Failed to load reviews" });
  }
};

export const create = async (req, res) => {
  try {
    const product = await getProductById(req.params.productId);
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });
    const purchased = await hasDeliveredPurchase(req.user.id, product.id);
    if (!purchased) return res.status(403).json({ success: false, message: "You can review this product after a delivered purchase." });
    if (await getUserReview(req.user.id, product.id)) return res.status(409).json({ success: false, message: "You have already reviewed this product." });
    const data = validate(req.body);
    const review = await createReview({ userId: req.user.id, productId: product.id, ...data });
    res.status(201).json({ success: true, review });
  } catch (error) {
    const status = error.code === "23505" ? 409 : 400;
    if (status === 400 && !error.message.startsWith("Rating") && !error.message.startsWith("Review") && !error.message.startsWith("Please")) console.error("Failed to create review:", error);
    res.status(status).json({ success: false, message: error.message || "Failed to create review" });
  }
};

export const update = async (req, res) => {
  try {
    const data = validate(req.body);
    const review = await updateReview({ id: req.params.id, userId: req.user.id, ...data });
    if (!review) return res.status(404).json({ success: false, message: "Review not found" });
    res.json({ success: true, review });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message || "Failed to update review" });
  }
};

export const remove = async (req, res) => {
  try {
    const review = await deleteReview(req.params.id, req.user.id);
    if (!review) return res.status(404).json({ success: false, message: "Review not found" });
    res.json({ success: true, message: "Review deleted" });
  } catch (error) {
    console.error("Failed to delete review:", error);
    res.status(500).json({ success: false, message: "Failed to delete review" });
  }
};
