export const createOrderItem = async (
  client,
  orderId,
  productId,
  quantity,
  price
) => {
  const result = await client.query(
    `
    INSERT INTO order_items (
      order_id,
      product_id,
      quantity,
      price
    )
    VALUES ($1, $2, $3, $4)
    RETURNING id, order_id, product_id, quantity, price;
    `,
    [orderId, productId, quantity, price]
  );

  return result.rows[0];
};