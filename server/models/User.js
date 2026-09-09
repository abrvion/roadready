import pool from "../config/database.js";

export const findUserByEmail = async (email) => {
  const result = await pool.query(
    `
    SELECT
      id,
      name,
      email,
      password,
      phone,
      role,
      email_verified,
      email_verification_token,
      email_verification_expires
    FROM users
    WHERE email = $1;
    `,
    [email]
  );

  return result.rows[0];
};

export const createUser = async (name, email, password, phone) => {
  const result = await pool.query(`
    INSERT INTO users (name, email, password, phone, email_verified)
    VALUES ($1, $2, $3, $4, false)
    RETURNING id, name, email, phone, role, email_verified;
  `, [name, email, password, phone]);
  return result.rows[0];
};

export const savePasswordResetToken = async (
  userId,
  token,
  expires
) => {
  const result = await pool.query(
    `
    UPDATE users
    SET
      reset_password_token = $1,
      reset_password_expires = $2,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $3
    RETURNING
      id,
      email;
    `,
    [token, expires, userId]
  );

  return result.rows[0];
};

export const findUserByResetToken = async (token) => {
  const result = await pool.query(
    `
    SELECT
      id,
      name,
      email,
      password,
      phone,
      role,
      reset_password_token,
      reset_password_expires
    FROM users
    WHERE reset_password_token = $1
      AND reset_password_expires > CURRENT_TIMESTAMP;
    `,
    [token]
  );

  return result.rows[0];
};

export const updateUserPassword = async (
  userId,
  hashedPassword
) => {
  const result = await pool.query(
    `
    UPDATE users
    SET
      password = $1,
      reset_password_token = NULL,
      reset_password_expires = NULL,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $2
    RETURNING
      id,
      name,
      email,
      phone,
      role;
    `,
    [hashedPassword, userId]
  );

  return result.rows[0];
};

export const saveEmailVerificationToken = async (userId, token, expires) => {
  const result = await pool.query(`
    UPDATE users SET email_verification_token = $1, email_verification_expires = $2, updated_at = CURRENT_TIMESTAMP
    WHERE id = $3 RETURNING id, email, name;
  `, [token, expires, userId]);
  return result.rows[0];
};

export const findUserByEmailVerificationToken = async (token) => {
  const result = await pool.query(`
    SELECT id, name, email, phone, role, email_verified
    FROM users
    WHERE email_verification_token = $1 AND email_verification_expires > CURRENT_TIMESTAMP;
  `, [token]);
  return result.rows[0] || null;
};

export const markEmailVerified = async (userId) => {
  const result = await pool.query(`
    UPDATE users SET email_verified = true, email_verification_token = NULL, email_verification_expires = NULL, updated_at = CURRENT_TIMESTAMP
    WHERE id = $1 RETURNING id, name, email, phone, role, email_verified;
  `, [userId]);
  return result.rows[0];
};

export const getUserById = async (userId) => {
  const result = await pool.query(
    `SELECT id, name, email, phone, role, email_verified FROM users WHERE id = $1;`,
    [userId]
  );
  return result.rows[0];
};

export const updateUserProfile = async (userId, name, email, phone) => {
  const result = await pool.query(
    `UPDATE users
     SET name = $1, email = $2, phone = $3,
         email_verified = CASE WHEN email IS DISTINCT FROM $2 THEN false ELSE email_verified END,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $4
     RETURNING id, name, email, phone, role, email_verified;`,
    [name, email, phone, userId]
  );
  return result.rows[0];
};
