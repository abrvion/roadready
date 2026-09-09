// Category model.
import pool from "../config/database.js";

export const getAllCategories = async () => {
  const result = await pool.query(`
    SELECT
      id,
      name,
      description,
      image
    FROM categories
    WHERE status = 'active'
    ORDER BY id;
  `);

  return result.rows;
};