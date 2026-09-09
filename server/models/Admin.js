
import pool from "../config/database.js";

/*
  DASHBOARD
*/

export const getDashboardStats = async () => {
  const result = await pool.query(`
    SELECT
      (SELECT COUNT(*) FROM products) AS total_products,

      (SELECT COUNT(*)
       FROM products
       WHERE status = 'active') AS active_products,

      (SELECT COUNT(*)
       FROM products
       WHERE stock > 0
         AND stock <= 5
         AND status = 'active') AS low_stock_products,

      (SELECT COUNT(*)
       FROM products
       WHERE stock > 0
         AND status = 'active') AS in_stock_products,

      (SELECT COUNT(*)
       FROM products
       WHERE stock = 0
         AND status = 'active') AS out_of_stock_products,

      (SELECT COUNT(*) FROM users
       WHERE role = 'customer') AS total_customers,

      (SELECT COUNT(*) FROM orders) AS total_orders,

      COALESCE(
        (SELECT SUM(total)
         FROM orders
         WHERE status <> 'cancelled'),
        0
      ) AS total_revenue,

      (SELECT COUNT(*)
       FROM orders
       WHERE status = 'pending') AS pending_orders,

      (SELECT COUNT(*)
       FROM orders
       WHERE status = 'processing') AS processing_orders,

      (SELECT COUNT(*)
       FROM orders
       WHERE status = 'shipped') AS shipped_orders,

      (SELECT COUNT(*)
       FROM orders
       WHERE status = 'delivered') AS delivered_orders,

      (SELECT COUNT(*)
       FROM orders
       WHERE status = 'cancelled') AS cancelled_orders;
  `);

  return result.rows[0];
};

export const getBestSellingProducts = async (limit = 3) => {
  const result = await pool.query(`
    SELECT
      products.id,
      products.name,
      products.image,
      categories.name AS category_name,
      COALESCE(SUM(order_items.quantity) FILTER (WHERE orders.status <> 'cancelled'), 0)::integer AS units_sold
    FROM products
    JOIN categories ON categories.id = products.category_id
    LEFT JOIN order_items ON order_items.product_id = products.id
    LEFT JOIN orders ON orders.id = order_items.order_id
    GROUP BY products.id, categories.name
    ORDER BY units_sold DESC, products.created_at DESC
    LIMIT $1;
  `, [limit]);
  return result.rows;
};

export const getRecentOrders = async (limit = 5) => {
  const result = await pool.query(
    `
    SELECT
      orders.id,
      orders.order_number,
      orders.total,
      orders.status,
      orders.payment_status,
      orders.created_at,
      users.name AS customer_name,
      users.email AS customer_email
    FROM orders
    JOIN users
      ON orders.user_id = users.id
    ORDER BY orders.created_at DESC
    LIMIT $1;
    `,
    [limit]
  );

  return result.rows;
};


/*
  CATEGORIES
*/

export const getCategories = async ({
  search = "",
  status = "all"
} = {}) => {
  const values = [];
  const conditions = [];

  if (search.trim()) {
    values.push(`%${search.trim()}%`);

    conditions.push(`
      (
        categories.name ILIKE $${values.length}
        OR categories.description ILIKE $${values.length}
      )
    `);
  }

  if (status !== "all") {
    values.push(status);

    conditions.push(
      `categories.status = $${values.length}`
    );
  }

  const whereClause =
    conditions.length > 0
      ? `WHERE ${conditions.join(" AND ")}`
      : "";

  const result = await pool.query(
    `
    SELECT
      categories.id,
      categories.name,
      categories.description,
      categories.image,
      categories.status,
      categories.created_at,
      categories.updated_at,
      COUNT(products.id)::integer AS product_count
    FROM categories
    LEFT JOIN products
      ON products.category_id = categories.id
    ${whereClause}
    GROUP BY categories.id
    ORDER BY categories.created_at DESC;
    `,
    values
  );

  return result.rows;
};


/*
  GET ONE CATEGORY
*/

export const getCategoryById = async (id) => {
  const result = await pool.query(
    `
    SELECT
      categories.id,
      categories.name,
      categories.description,
      categories.image,
      categories.status,
      categories.created_at,
      categories.updated_at,
      COUNT(products.id)::integer AS product_count
    FROM categories
    LEFT JOIN products
      ON products.category_id = categories.id
    WHERE categories.id = $1
    GROUP BY categories.id;
    `,
    [id]
  );

  return result.rows[0];
};


export const createCategory = async (
  name,
  description,
  image
) => {
  const result = await pool.query(
    `
    INSERT INTO categories (
      name,
      description,
      image
    )
    VALUES ($1, $2, $3)
    RETURNING
      id,
      name,
      description,
      image,
      status,
      created_at,
      updated_at;
    `,
    [
      name,
      description || null,
      image || null
    ]
  );

  return result.rows[0];
};

export const updateCategory = async (
  id,
  name,
  description,
  image
) => {
  const result = await pool.query(
    `
    UPDATE categories
    SET
      name = $1,
      description = $2,
      image = $3,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $4
    RETURNING
      id,
      name,
      description,
      image,
      status,
      created_at,
      updated_at;
    `,
    [
      name,
      description || null,
      image || null,
      id
    ]
  );

  return result.rows[0];
};

export const updateCategoryStatus = async (
  id,
  status
) => {
  const result = await pool.query(
    `
    UPDATE categories
    SET
      status = $1,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $2
    RETURNING
      id,
      name,
      status,
      updated_at;
    `,
    [status, id]
  );

  return result.rows[0];
};

export const deleteCategory = async (id) => {
  const result = await pool.query(
    `
    SELECT COUNT(*)::integer AS product_count
    FROM products
    WHERE category_id = $1;
    `,
    [id]
  );

  if (result.rows[0].product_count > 0) {
    throw new Error(
      "Cannot delete a category that contains products"
    );
  }

  const deleted = await pool.query(
    `
    DELETE FROM categories
    WHERE id = $1
    RETURNING id;
    `,
    [id]
  );

  return deleted.rows[0];
};


/*
  PRODUCTS
*/

export const getProducts = async ({
  search = "",
  categoryId = "all",
  stockFilter = "all",
  status = "all",
  page = 1,
  limit = 20
} = {}) => {
  const values = [];
  const conditions = [];

  if (search.trim()) {
    values.push(`%${search.trim()}%`);

    conditions.push(`
      (
        products.name ILIKE $${values.length}
        OR products.brand ILIKE $${values.length}
      )
    `);
  }

  if (categoryId !== "all") {
    values.push(Number(categoryId));

    conditions.push(
      `products.category_id = $${values.length}`
    );
  }

  if (status !== "all") {
    values.push(status);

    conditions.push(
      `products.status = $${values.length}`
    );
  }

  if (stockFilter === "in-stock") {
    conditions.push("products.stock > 5");
  }

  if (stockFilter === "low-stock") {
    conditions.push(
      "products.stock > 0 AND products.stock <= 5"
    );
  }

  if (stockFilter === "out-of-stock") {
    conditions.push("products.stock = 0");
  }

  const whereClause =
    conditions.length > 0
      ? `WHERE ${conditions.join(" AND ")}`
      : "";

  const countResult = await pool.query(
    `
    SELECT COUNT(*)::integer AS total
    FROM products
    ${whereClause};
    `,
    values
  );

  const total = countResult.rows[0].total;

  const offset =
    (Number(page) - 1) * Number(limit);

  const dataValues = [...values];

  dataValues.push(Number(limit));

  const limitIndex = dataValues.length;

  dataValues.push(offset);

  const offsetIndex = dataValues.length;

  const result = await pool.query(
    `
    SELECT
      products.id,
      products.name,
      products.description,
      products.price,
      products.stock,
      products.brand,
      products.category_id,
      products.image,
      products.status,
      products.created_at,
      products.updated_at,
      categories.name AS category_name
    FROM products
    JOIN categories
      ON products.category_id = categories.id
    ${whereClause}
    ORDER BY products.created_at DESC
    LIMIT $${limitIndex}
    OFFSET $${offsetIndex};
    `,
    dataValues
  );

  return {
    products: result.rows,
    total,
    page: Number(page),
    limit: Number(limit),
    totalPages: Math.ceil(
      total / Number(limit)
    )
  };
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
      products.category_id,
      products.image,
      products.status,
      products.created_at,
      products.updated_at,
      categories.name AS category_name
    FROM products
    JOIN categories
      ON products.category_id = categories.id
    WHERE products.id = $1;
    `,
    [id]
  );

  return result.rows[0];
};

export const createProduct = async ({
  name,
  description,
  price,
  stock,
  brand,
  categoryId,
  image
}) => {
  const result = await pool.query(
    `
    INSERT INTO products (
      name,
      description,
      price,
      stock,
      brand,
      category_id,
      image
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING
      id,
      name,
      description,
      price,
      stock,
      brand,
      category_id,
      image,
      status,
      created_at,
      updated_at;
    `,
    [
      name,
      description || null,
      price,
      stock,
      brand || null,
      categoryId,
      image || null
    ]
  );

  return result.rows[0];
};

export const updateProduct = async (
  id,
  {
    name,
    description,
    price,
    stock,
    brand,
    categoryId,
    image
  }
) => {
  const result = await pool.query(
    `
    UPDATE products
    SET
      name = $1,
      description = $2,
      price = $3,
      stock = $4,
      brand = $5,
      category_id = $6,
      image = $7,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $8
    RETURNING
      id,
      name,
      description,
      price,
      stock,
      brand,
      category_id,
      image,
      status,
      created_at,
      updated_at;
    `,
    [
      name,
      description || null,
      price,
      stock,
      brand || null,
      categoryId,
      image || null,
      id
    ]
  );

  return result.rows[0];
};

export const updateProductStatus = async (
  id,
  status
) => {
  const result = await pool.query(
    `
    UPDATE products
    SET
      status = $1,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $2
    RETURNING
      id,
      name,
      stock,
      status,
      updated_at;
    `,
    [status, id]
  );

  return result.rows[0];
};


/*
  ORDERS
*/

export const getOrders = async ({
  search = "",
  status = "all",
  customerId = "all",
  page = 1,
  limit = 20
} = {}) => {
  const values = [];
  const conditions = [];

  if (search.trim()) {
    values.push(`%${search.trim()}%`);

    conditions.push(`
      (
        CAST(orders.id AS TEXT) ILIKE $${values.length}
        OR COALESCE(orders.order_number, '') ILIKE $${values.length}
        OR users.name ILIKE $${values.length}
        OR users.email ILIKE $${values.length}
      )
    `);
  }

  if (status !== "all") {
    values.push(status);

    conditions.push(
      `orders.status = $${values.length}`
    );
  }
  if (customerId !== "all" && Number.isInteger(Number(customerId))) {
    values.push(Number(customerId));
    conditions.push(`orders.user_id = $${values.length}`);
  }


  const whereClause =
    conditions.length > 0
      ? `WHERE ${conditions.join(" AND ")}`
      : "";

  const countResult = await pool.query(
    `
    SELECT COUNT(*)::integer AS total
    FROM orders
    JOIN users
      ON orders.user_id = users.id
    ${whereClause};
    `,
    values
  );

  const total = countResult.rows[0].total;

  const offset =
    (Number(page) - 1) * Number(limit);

  const dataValues = [...values];

  dataValues.push(Number(limit));

  const limitIndex = dataValues.length;

  dataValues.push(offset);

  const offsetIndex = dataValues.length;

  const result = await pool.query(
    `
    SELECT
      orders.id,
      orders.order_number,
      orders.user_id,
      orders.total,
      orders.status,
      orders.payment_status,
      orders.created_at,
      users.name AS customer_name,
      users.email AS customer_email
    FROM orders
    JOIN users
      ON orders.user_id = users.id
    ${whereClause}
    ORDER BY orders.created_at DESC
    LIMIT $${limitIndex}
    OFFSET $${offsetIndex};
    `,
    dataValues
  );

  return {
    orders: result.rows,
    total,
    page: Number(page),
    limit: Number(limit),
    totalPages: Math.ceil(
      total / Number(limit)
    )
  };
};

export const getOrderDetailsForAdmin = async (
  orderId
) => {
  const orderResult = await pool.query(
    `
    SELECT
      orders.id,
      orders.order_number,
      orders.user_id,
      orders.address_id,
      orders.total,
      orders.status,
      orders.payment_status,
      orders.created_at,
      orders.updated_at,

      orders.shipping_name,
      orders.shipping_phone,
      orders.shipping_address_line,
      orders.shipping_city,
      orders.shipping_postal_code,

      users.name AS customer_name,
      users.email AS customer_email,
      users.phone AS customer_phone

    FROM orders
    JOIN users
      ON orders.user_id = users.id
    WHERE orders.id = $1;
    `,
    [orderId]
  );

  if (orderResult.rows.length === 0) {
    return null;
  }

  const itemsResult = await pool.query(
    `
    SELECT
      order_items.id,
      order_items.product_id,
      order_items.quantity,
      order_items.price,
      products.name,
      products.image
    FROM order_items
    JOIN products
      ON order_items.product_id = products.id
    WHERE order_items.order_id = $1
    ORDER BY order_items.id;
    `,
    [orderId]
  );

  return {
    order: orderResult.rows[0],
    items: itemsResult.rows
  };
};

export const updateOrderStatus = async (orderId, status) => {
  const allowedStatuses = ["pending", "processing", "shipped", "delivered", "cancelled"];
  if (!allowedStatuses.includes(status)) throw new Error("Invalid order status");

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const currentResult = await client.query(
      `SELECT id, status, payment_status FROM orders WHERE id = $1 FOR UPDATE;`,
      [orderId]
    );
    if (!currentResult.rows.length) throw new Error("Order not found");

    const current = currentResult.rows[0];
    if (current.status === "cancelled") throw new Error("Cancelled orders cannot be changed");
    if (current.status === "delivered" && status !== "delivered") throw new Error("Delivered orders cannot be changed");

    if (status === "cancelled" && current.status !== "cancelled") {
      const items = await client.query(
        `SELECT product_id, quantity FROM order_items WHERE order_id = $1;`,
        [orderId]
      );
      for (const item of items.rows) {
        await client.query(
          `UPDATE products SET stock = stock + $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2;`,
          [item.quantity, item.product_id]
        );
      }
    }

    const paymentStatus = status === "delivered" ? "paid" : status === "cancelled" ? "cancelled" : current.payment_status;
    const result = await client.query(
      `UPDATE orders
       SET status = $1, payment_status = $2, updated_at = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING id, order_number, status, payment_status, updated_at;`,
      [status, paymentStatus, orderId]
    );
    await client.query("COMMIT");
    return result.rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};


/*
  CUSTOMERS
*/

export const getCustomers = async ({
  search = "",
  page = 1,
  limit = 20
} = {}) => {
  const values = [];
  let whereClause = "";

  if (search.trim()) {
    values.push(`%${search.trim()}%`);

    whereClause = `
      WHERE
        users.name ILIKE $1
        OR users.email ILIKE $1
        OR users.phone ILIKE $1
    `;
  }

  const countResult = await pool.query(
    `
    SELECT COUNT(*)::integer AS total
    FROM users
    WHERE role = 'customer'
    ${
      search.trim()
        ? `
          AND (
            name ILIKE $1
            OR email ILIKE $1
            OR phone ILIKE $1
          )
        `
        : ""
    };
    `,
    values
  );

  const total = countResult.rows[0].total;

  const newCustomersResult = await pool.query(`
    SELECT COUNT(*)::integer AS count
    FROM users
    WHERE role = 'customer' AND created_at >= CURRENT_TIMESTAMP - INTERVAL '30 days';
  `);
  const newCustomers = newCustomersResult.rows[0].count;

  const offset =
    (Number(page) - 1) * Number(limit);

  const dataValues = [...values];

  dataValues.push(Number(limit));

  const limitIndex = dataValues.length;

  dataValues.push(offset);

  const offsetIndex = dataValues.length;

  const result = await pool.query(
    `
    SELECT
      users.id,
      users.name,
      users.email,
      users.phone,
      users.created_at,

      COUNT(orders.id)::integer AS orders_count,

      COALESCE(
        SUM(
          CASE
            WHEN orders.status <> 'cancelled'
            THEN orders.total
            ELSE 0
          END
        ),
        0
      ) AS total_spent,

      MAX(orders.created_at) AS last_order

    FROM users

    LEFT JOIN orders
      ON orders.user_id = users.id

    WHERE users.role = 'customer'
    ${
      search.trim()
        ? `
          AND (
            users.name ILIKE $1
            OR users.email ILIKE $1
            OR users.phone ILIKE $1
          )
        `
        : ""
    }

    GROUP BY users.id
    ORDER BY users.created_at DESC

    LIMIT $${limitIndex}
    OFFSET $${offsetIndex};
    `,
    dataValues
  );

  return {
    customers: result.rows,
    total,
    page: Number(page),
    limit: Number(limit),
    totalPages: Math.ceil(
      total / Number(limit)
    )
  };
};


export const getCustomerSummary = async () => {
  const result = await pool.query(`
    SELECT
      COUNT(*) FILTER (WHERE users.role = 'customer')::integer AS total_customers,
      COUNT(*) FILTER (
        WHERE users.role = 'customer' AND EXISTS (
          SELECT 1 FROM orders o
          WHERE o.user_id = users.id AND o.status <> 'cancelled'
            AND o.created_at >= CURRENT_TIMESTAMP - INTERVAL '90 days'
        )
      )::integer AS active_customers,
      COUNT(*) FILTER (
        WHERE users.role = 'customer' AND (SELECT COUNT(*) FROM orders o2 WHERE o2.user_id = users.id) > 1
      )::integer AS repeat_customers
    FROM users;
  `);
  return result.rows[0];
};

export const getCustomerDetails = async (
  customerId
) => {
  const customerResult = await pool.query(
    `
    SELECT
      id,
      name,
      email,
      phone,
      role,
      created_at
    FROM users
    WHERE id = $1
      AND role = 'customer';
    `,
    [customerId]
  );

  if (customerResult.rows.length === 0) {
    return null;
  }

  const ordersResult = await pool.query(
    `
    SELECT
      id,
      total,
      status,
      payment_status,
      created_at
    FROM orders
    WHERE user_id = $1
    ORDER BY created_at DESC;
    `,
    [customerId]
  );

  const statsResult = await pool.query(
    `
    SELECT
      COUNT(*)::integer AS orders_count,

      COALESCE(
        SUM(
          CASE
            WHEN status <> 'cancelled'
            THEN total
            ELSE 0
          END
        ),
        0
      ) AS total_spent,

      MAX(created_at) AS last_order

    FROM orders
    WHERE user_id = $1;
    `,
    [customerId]
  );

  return {
    customer: customerResult.rows[0],
    stats: statsResult.rows[0],
    orders: ordersResult.rows
  };
};

