
// Address database queries.

import pool from "../config/database.js";

export const createAddress = async (
  client,
  userId,
  name,
  phone,
  addressLine,
  city,
  postalCode,
  label,
  isDefault
) => {
  const result = await client.query(
    `
    INSERT INTO addresses (
      user_id,
      name,
      phone,
      address_line,
      city,
      postal_code,
      label,
      is_default
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *;
    `,
    [
      userId,
      name,
      phone,
      addressLine,
      city,
      postalCode || null,
      label || null,
      isDefault
    ]
  );

  return result.rows[0];
};

export const getAddressesByUserId = async (userId) => {
  const result = await pool.query(
    `
    SELECT *
    FROM addresses
    WHERE user_id = $1
    ORDER BY id;
    `,
    [userId]
  );

  return result.rows;
};

export const getAddressById = async (
  addressId,
  userId
) => {
  const result = await pool.query(
    `
    SELECT *
    FROM addresses
    WHERE id = $1
      AND user_id = $2;
    `,
    [addressId, userId]
  );

  return result.rows[0] || null;
};

export const updateAddress = async (
  client,
  addressId,
  userId,
  name,
  phone,
  addressLine,
  city,
  postalCode,
  label,
  isDefault
) => {
  const result = await client.query(
    `
    UPDATE addresses
    SET
      name = $1,
      phone = $2,
      address_line = $3,
      city = $4,
      postal_code = $5,
      label = $6,
      is_default = $7,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $8
      AND user_id = $9
    RETURNING *;
    `,
    [
      name,
      phone,
      addressLine,
      city,
      postalCode || null,
      label || null,
      isDefault,
      addressId,
      userId
    ]
  );

  return result.rows[0] || null;
};

export const setOtherAddressesNotDefault = async (
  client,
  userId,
  addressId = null
) => {
  if (addressId) {
    await client.query(
      `
      UPDATE addresses
      SET is_default = FALSE
      WHERE user_id = $1
        AND id != $2;
      `,
      [userId, addressId]
    );

    return;
  }

  await client.query(
    `
    UPDATE addresses
    SET is_default = FALSE
    WHERE user_id = $1;
    `,
    [userId]
  );
};

export const getAddressCountByUserId = async (
  client,
  userId
) => {
  const result = await client.query(
    `
    SELECT COUNT(*)::int AS count
    FROM addresses
    WHERE user_id = $1;
    `,
    [userId]
  );

  return result.rows[0].count;
};

export const getAddressByIdForUpdate = async (
  client,
  addressId,
  userId
) => {
  const result = await client.query(
    `
    SELECT *
    FROM addresses
    WHERE id = $1
      AND user_id = $2
    FOR UPDATE;
    `,
    [addressId, userId]
  );

  return result.rows[0] || null;
};

export const isAddressUsedByOrder = async (
  client,
  addressId,
  userId
) => {
  const result = await client.query(
    `
    SELECT 1
    FROM orders
    WHERE address_id = $1
      AND user_id = $2
    LIMIT 1;
    `,
    [addressId, userId]
  );

  return result.rows.length > 0;
};

export const deleteAddress = async (
  client,
  addressId,
  userId
) => {
  const result = await client.query(
    `
    DELETE FROM addresses
    WHERE id = $1
      AND user_id = $2
    RETURNING id;
    `,
    [addressId, userId]
  );

  return result.rows[0] || null;
};

