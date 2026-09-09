// Product model.
import pool from "../config/database.js";

export const getAllProducts = async () => {
  const result = await pool.query(`
    SELECT
      products.id,
      products.name,
      products.description,
      products.price,
      products.stock,
      products.brand,
      products.image,
      categories.name AS category,
      COALESCE((SELECT ROUND(AVG(r.rating)::numeric, 1) FROM reviews r WHERE r.product_id = products.id AND r.status = 'published'), 0) AS average_rating,
      COALESCE((SELECT COUNT(*)::integer FROM reviews r WHERE r.product_id = products.id AND r.status = 'published'), 0) AS review_count
    FROM products
    JOIN categories
      ON products.category_id = categories.id
    WHERE products.status = 'active'
    ORDER BY products.id;
  `);

  return result.rows;
};

export const getProductById = async (id) => {
  const result = await pool.query(
    `
    SELECT
      products.id,
      products.name,
      products.description,
      products.price,
      products.stock,
      products.brand,
      products.image,
      categories.name AS category,
      COALESCE((SELECT ROUND(AVG(r.rating)::numeric, 1) FROM reviews r WHERE r.product_id = products.id AND r.status = 'published'), 0) AS average_rating,
      COALESCE((SELECT COUNT(*)::integer FROM reviews r WHERE r.product_id = products.id AND r.status = 'published'), 0) AS review_count
    FROM products
    JOIN categories
      ON products.category_id = categories.id
    WHERE products.id = $1
      AND products.status = 'active';
    `,
    [id]
  );

  return result.rows[0];
};