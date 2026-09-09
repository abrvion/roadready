
// Cart service logic.

import pool from "../config/database.js";


/* =========================================================
   ADD PRODUCT TO CART
   ========================================================= */

export const addToCart = async (
  userId,
  productId,
  quantity
) => {

  const client = await pool.connect();

  try {

    await client.query("BEGIN");


    /* -------------------------------------------------------
       VALIDATE QUANTITY
       ------------------------------------------------------- */

    if (quantity <= 0) {

      throw new Error(
        "Quantity must be greater than 0"
      );

    }


    /* -------------------------------------------------------
       CHECK PRODUCT
       ------------------------------------------------------- */

    const productResult = await client.query(
      `
      SELECT id, stock
      FROM products
      WHERE id = $1
        AND status = 'active'
      FOR UPDATE;
      `,
      [productId]
    );


    if (productResult.rows.length === 0) {

      throw new Error("Product not found");

    }


    const product =
      productResult.rows[0];


    /* -------------------------------------------------------
       FIND OR CREATE USER CART
       ------------------------------------------------------- */

    const cartResult = await client.query(
      `INSERT INTO carts (user_id)
       VALUES ($1)
       ON CONFLICT (user_id)
       DO UPDATE SET updated_at = CURRENT_TIMESTAMP
       RETURNING id;`,
      [userId]
    );

    const cartId = cartResult.rows[0].id;

    /* -------------------------------------------------------
       CHECK EXISTING CART ITEM
       ------------------------------------------------------- */

    const cartItemResult =
      await client.query(
        `
        SELECT id, quantity
        FROM cart_items
        WHERE cart_id = $1
          AND product_id = $2;
        `,
        [cartId, productId]
      );


    if (cartItemResult.rows.length > 0) {

      const existingItem =
        cartItemResult.rows[0];


      const newQuantity =
        existingItem.quantity + quantity;


      if (newQuantity > product.stock) {

        throw new Error(
          "Not enough stock available"
        );

      }


      await client.query(
        `
        UPDATE cart_items
        SET quantity = $1
        WHERE id = $2;
        `,
        [
          newQuantity,
          existingItem.id
        ]
      );

    } else {


      if (quantity > product.stock) {

        throw new Error(
          "Not enough stock available"
        );

      }


      await client.query(
        `
        INSERT INTO cart_items (
          cart_id,
          product_id,
          quantity
        )
        VALUES ($1, $2, $3);
        `,
        [
          cartId,
          productId,
          quantity
        ]
      );

    }


    await client.query(
      `UPDATE carts SET updated_at = CURRENT_TIMESTAMP WHERE id = $1;`,
      [cartId]
    );

    await client.query("COMMIT");


    return {
      cartId
    };


  } catch (error) {

    await client.query("ROLLBACK");

    throw error;

  } finally {

    client.release();

  }

};


/* =========================================================
   UPDATE CART ITEM
   ========================================================= */

export const updateCartItem = async (userId, cartItemId, quantity) => {
  if (!Number.isInteger(Number(quantity)) || Number(quantity) <= 0) {
    throw new Error("Quantity must be greater than 0");
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const result = await client.query(
      `SELECT cart_items.id, products.stock
       FROM cart_items
       JOIN carts ON cart_items.cart_id = carts.id
       JOIN products ON cart_items.product_id = products.id
       WHERE cart_items.id = $1
         AND carts.user_id = $2
         AND products.status = 'active'
       FOR UPDATE OF products, cart_items;`,
      [cartItemId, userId]
    );

    if (result.rows.length === 0) throw new Error("Cart item not found");
    const item = result.rows[0];
    const parsedQuantity = Number(quantity);
    if (parsedQuantity > item.stock) throw new Error("Not enough stock available");

    await client.query(
      `UPDATE cart_items SET quantity = $1 WHERE id = $2;`,
      [parsedQuantity, item.id]
    );
    await client.query(
      `UPDATE carts SET updated_at = CURRENT_TIMESTAMP
       WHERE id = (SELECT cart_id FROM cart_items WHERE id = $1);`,
      [item.id]
    );
    await client.query("COMMIT");
    return { cartItemId: item.id, quantity: parsedQuantity };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};


/* =========================================================
   REMOVE CART ITEM
   ========================================================= */

export const removeCartItem = async (
  userId,
  cartItemId
) => {

  const result =
    await pool.query(
      `
      DELETE FROM cart_items

      USING carts

      WHERE cart_items.cart_id = carts.id
        AND cart_items.id = $1
        AND carts.user_id = $2

      RETURNING cart_items.id;
      `,
      [
        cartItemId,
        userId
      ]
    );


  if (result.rows.length === 0) {

    throw new Error(
      "Cart item not found"
    );

  }


  return {
    cartItemId:
      result.rows[0].id
  };

};

