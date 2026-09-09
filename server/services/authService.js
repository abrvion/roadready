import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { env } from "../config/environment.js";

import {
  findUserByEmail,
  createUser,
  savePasswordResetToken,
  findUserByResetToken,
  updateUserPassword,
  saveEmailVerificationToken,
  findUserByEmailVerificationToken,
  markEmailVerified
} from "../models/User.js";

const hashResetToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");


const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      role: user.role
    },
    env.jwtSecret,
    {
      expiresIn: "7d"
    }
  );
};

export const registerUser = async (
  name,
  email,
  password,
  phone
) => {
  const existingUser = await findUserByEmail(email);

  if (existingUser) {
    throw new Error("Email already registered");
  }

  const hashedPassword = await bcrypt.hash(
    password,
    10
  );

  const user = await createUser(
    name,
    email,
    hashedPassword,
    phone
  );

  const verification = await issueEmailVerification(user.id);
  return { user: { ...user, email_verified: false }, verificationToken: verification.verificationToken };
};

export const loginUser = async (
  email,
  password
) => {
  const user = await findUserByEmail(email);

  if (!user) {
    throw new Error("Invalid email or password");
  }
  if (user.email_verified === false) {
    throw new Error("Please verify your email address before signing in");
  }

  const passwordMatch = await bcrypt.compare(
    password,
    user.password
  );

  if (!passwordMatch) {
    throw new Error("Invalid email or password");
  }

  const token = generateToken(user);

  const safeUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role
  };

  return {
    user: safeUser,
    token
  };
};

export const requestPasswordReset = async (
  email
) => {
  const user = await findUserByEmail(email);

  if (!user) {
    throw new Error("User not found");
  }

  const resetToken = crypto.randomBytes(32).toString("hex");

  const expires = new Date(
    Date.now() + 30 * 60 * 1000
  );

  await savePasswordResetToken(
    user.id,
    hashResetToken(resetToken),
    expires
  );

  return {
    resetToken,
    email: user.email
  };
};

export const resetPassword = async (
  resetToken,
  newPassword
) => {
  const user = await findUserByResetToken(
    hashResetToken(resetToken)
  );

  if (!user) {
    throw new Error("Invalid or expired reset token");
  }

  const hashedPassword = await bcrypt.hash(
    newPassword,
    10
  );

  const updatedUser = await updateUserPassword(
    user.id,
    hashedPassword
  );

  return updatedUser;
};
export const issueEmailVerification = async (userId) => {
  const verificationToken = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const user = await saveEmailVerificationToken(userId, hashResetToken(verificationToken), expires);
  return { ...user, verificationToken };
};

export const verifyEmail = async (rawToken) => {
  const user = await findUserByEmailVerificationToken(hashResetToken(rawToken));
  if (!user) throw new Error("Invalid or expired verification link");
  return markEmailVerified(user.id);
};
