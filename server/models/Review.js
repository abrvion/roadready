import pool from "../config/database.js";

export const listProductReviews = async (productId) => {
  const result = await pool.query(`
    SELECT r.id, r.rating, r.title, r.body, r.created_at, r.updated_at,
           u.id AS user_id, u.name AS user_name
    FROM reviews r
    JOIN users u ON u.id = r.user_id
    WHERE r.product_id = $1 AND r.status = 'published'
    ORDER BY r.created_at DESC;
  `, [productId]);
  return result.rows;
};

export const getProductReviewSummary = async (productId) => {
  const result = await pool.query(`
    SELECT COALESCE(ROUND(AVG(rating)::numeric, 1), 0) AS average_rating,
           COUNT(*)::integer AS review_count
    FROM reviews
    WHERE product_id = $1 AND status = 'published';
  `, [productId]);
  return result.rows[0];
};

export const getUserReview = async (userId, productId) => {
  const result = await pool.query(`SELECT id, rating, title, body, status, created_at, updated_at FROM reviews WHERE user_id = $1 AND product_id = $2`, [userId, productId]);
  return result.rows[0] || null;
};

export const hasDeliveredPurchase = async (userId, productId) => {
  const result = await pool.query(`
    SELECT EXISTS(
      SELECT 1 FROM order_items oi
      JOIN orders o ON o.id = oi.order_id
      WHERE o.user_id = $1 AND oi.product_id = $2 AND o.status = 'delivered'
    ) AS purchased;
  `, [userId, productId]);
  return result.rows[0].purchased;
};

export const createReview = async ({ userId, productId, rating, title, body }) => {
  const result = await pool.query(`
    INSERT INTO reviews (user_id, product_id, rating, title, body)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id, rating, title, body, status, created_at, updated_at;
  `, [userId, productId, rating, title || null, body || null]);
  return result.rows[0];
};

export const updateReview = async ({ id, userId, rating, title, body }) => {
  const result = await pool.query(`
    UPDATE reviews SET rating = $1, title = $2, body = $3, updated_at = CURRENT_TIMESTAMP
    WHERE id = $4 AND user_id = $5
    RETURNING id, rating, title, body, status, created_at, updated_at;
  `, [rating, title || null, body || null, id, userId]);
  return result.rows[0] || null;
};

export const deleteReview = async (id, userId) => {
  const result = await pool.query(`DELETE FROM reviews WHERE id = $1 AND user_id = $2 RETURNING id`, [id, userId]);
  return result.rows[0] || null;
};
