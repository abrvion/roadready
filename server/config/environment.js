import dotenv from "dotenv";

dotenv.config();

const required = ["JWT_SECRET"];

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT) || 5000,
  databaseUrl: process.env.DATABASE_URL || "",
  jwtSecret: process.env.JWT_SECRET || "",
  corsOrigin: process.env.CORS_ORIGIN || "",
  resendApiKey: process.env.RESEND_API_KEY || "",
  emailFrom: process.env.EMAIL_FROM || (process.env.NODE_ENV === "production" ? "" : "onboarding@resend.dev"),
  appUrl: process.env.APP_URL || `http://localhost:${Number(process.env.PORT) || 5000}`
};

export const validateEnvironment = ({ requireDatabase = false } = {}) => {
  const missing = required.filter((name) => !process.env[name]);
  if (requireDatabase && !process.env.DATABASE_URL) missing.push("DATABASE_URL");
  if (missing.length) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }
};
