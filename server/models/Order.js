
import pool from "../config/database.js";

export const createOrder = async (
  client,
  userId,
  addressId,
  total,
  shippingName,
  shippingPhone,
  shippingAddressLine,
  shippingCity,
  shippingPostalCode
) => {
  const result = await client.query(
    `
    INSERT INTO orders (
      user_id,
      address_id,
      total,
      shipping_name,
      shipping_phone,
      shipping_address_line,
      shipping_city,
      shipping_postal_code
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING
      id,
      'RR-' || LPAD(id::text, 6, '0') AS order_number,
      user_id,
      address_id,
      total,
      shipping_name,
      shipping_phone,
      shipping_address_line,
      shipping_city,
      shipping_postal_code,
      status,
      payment_status,
      created_at;
    `,
    [
      userId,
      addressId,
      total,
      shippingName,
      shippingPhone,
      shippingAddressLine,
      shippingCity,
      shippingPostalCode || null
    ]
  );

  return result.rows[0];
};

export const getOrderById = async (
  orderId,
  userId
) => {
  const result = await pool.query(
    `
    SELECT
      orders.id,
      orders.order_number,
      orders.user_id,
      orders.address_id,
      orders.total,
      orders.shipping_name,
      orders.shipping_phone,
      orders.shipping_address_line,
      orders.shipping_city,
      orders.shipping_postal_code,
      orders.status,
      orders.payment_status,
      orders.created_at,
      order_items.product_id,
      order_items.quantity,
      order_items.price,
      products.name,
      products.image
    FROM orders
    JOIN order_items
      ON orders.id = order_items.order_id
    JOIN products
      ON order_items.product_id = products.id
    WHERE orders.id = $1
      AND orders.user_id = $2
    ORDER BY order_items.id;
    `,
    [orderId, userId]
  );

  return result.rows;
};

export const getOrdersByUserId = async (
  userId
) => {
  const result = await pool.query(
    `
    SELECT
      orders.id,
      orders.order_number,
      orders.user_id,
      orders.address_id,
      orders.total,
      orders.status,
      orders.payment_status,
      orders.created_at
    FROM orders
    WHERE orders.user_id = $1
    ORDER BY orders.created_at DESC;
    `,
    [userId]
  );

  return result.rows;
};



export const findOrderForTracking = async (orderNumber, email) => {
  const result = await pool.query(
    `SELECT id, order_number, status, payment_status, created_at, updated_at
     FROM orders
     JOIN users ON users.id = orders.user_id
     WHERE orders.order_number = $1 AND LOWER(users.email) = LOWER($2)
     LIMIT 1;`,
    [orderNumber, email]
  );
  return result.rows[0];
};
