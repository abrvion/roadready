import pool from "../config/database.js";

export const listWishlistItems = async (userId) => {
  const result = await pool.query(
    `SELECT wishlist_items.product_id, products.name, products.price, products.stock,
            products.image, categories.name AS category
     FROM wishlist_items
     JOIN products ON products.id = wishlist_items.product_id
     LEFT JOIN categories ON categories.id = products.category_id
     WHERE wishlist_items.user_id = $1
     ORDER BY wishlist_items.created_at DESC;`,
    [userId]
  );
  return result.rows;
};

export const addWishlistItem = async (userId, productId) => {
  const result = await pool.query(
    `INSERT INTO wishlist_items (user_id, product_id)
     SELECT $1, id FROM products WHERE id = $2 AND status = 'active'
     ON CONFLICT (user_id, product_id) DO UPDATE SET created_at = wishlist_items.created_at
     RETURNING product_id;`,
    [userId, productId]
  );
  return result.rows[0] || null;
};

export const removeWishlistItem = async (userId, productId) => {
  const result = await pool.query(
    `DELETE FROM wishlist_items WHERE user_id = $1 AND product_id = $2 RETURNING product_id;`,
    [userId, productId]
  );
  return result.rows[0] || null;
};

export const getWishlistProductIds = async (userId) => {
  const result = await pool.query(
    `SELECT product_id FROM wishlist_items WHERE user_id = $1;`,
    [userId]
  );
  return result.rows.map((row) => row.product_id);
};
