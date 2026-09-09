
// Cart model.

import pool from "../config/database.js";


/* =========================================================
   GET CART BY USER ID
   ========================================================= */

export const getCartByUserId = async (userId) => {

  const result =
    await pool.query(
      `
      SELECT

        cart_items.id AS id,

        carts.id AS cart_id,

        cart_items.product_id,

        cart_items.quantity,

        products.name,

        products.category_id,

        categories.name AS category,

        products.price,

        products.image

      FROM carts

      JOIN cart_items
        ON carts.id = cart_items.cart_id

      JOIN products
        ON cart_items.product_id = products.id

      LEFT JOIN categories
        ON products.category_id = categories.id

      WHERE carts.user_id = $1

      ORDER BY cart_items.id;
      `,
      [userId]
    );


  return result.rows;

};
