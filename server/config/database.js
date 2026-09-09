import pg from "pg";
import { env } from "./environment.js";

const { Pool } = pg;

const pool = new Pool({
  connectionString: env.databaseUrl || undefined,
  max: Number(process.env.DB_POOL_MAX) || 10,
  idleTimeoutMillis: Number(process.env.DB_IDLE_TIMEOUT_MS) || 30000,
  connectionTimeoutMillis: Number(process.env.DB_CONNECTION_TIMEOUT_MS) || 5000
});

pool.on("error", (error) => {
  console.error("Unexpected PostgreSQL pool error:", error);
});

export const checkDatabaseConnection = async () => {
  const result = await pool.query("SELECT 1 AS ok");
  return result.rows[0]?.ok === 1;
};

export default pool;
