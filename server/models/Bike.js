import pool from "../config/database.js";

export const listBikes = async ({ search = "", status = "active" } = {}) => {
  const params = [];
  const where = [];

  if (status !== "all") {
    params.push(status);
    where.push(`b.status = $${params.length}`);
  }

  if (search.trim()) {
    params.push(`%${search.trim()}%`);
    where.push(`(b.make ILIKE $${params.length} OR b.model ILIKE $${params.length})`);
  }

  const result = await pool.query(`
    SELECT
      b.id, b.make, b.model, b.year_from, b.year_to, b.status,
      COUNT(bc.product_id)::int AS product_count
    FROM bikes b
    LEFT JOIN bike_compatibility bc ON bc.bike_id = b.id
    ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
    GROUP BY b.id
    ORDER BY b.make, b.model, b.year_from NULLS LAST
  `, params);

  return result.rows;
};

export const getBikeById = async (id) => {
  const result = await pool.query(
    `SELECT id, make, model, year_from, year_to, status
     FROM bikes WHERE id = $1`,
    [id]
  );
  return result.rows[0] || null;
};

export const getCompatibleProducts = async (bikeId) => {
  const result = await pool.query(`
    SELECT p.id, p.name, p.description, p.price, p.stock, p.brand, p.image,
           c.name AS category
    FROM bike_compatibility bc
    JOIN products p ON p.id = bc.product_id
    JOIN categories c ON c.id = p.category_id
    WHERE bc.bike_id = $1 AND p.status = 'active'
    ORDER BY p.created_at DESC
  `, [bikeId]);
  return result.rows;
};

export const createBike = async ({ make, model, yearFrom, yearTo }) => {
  const result = await pool.query(`
    INSERT INTO bikes (make, model, year_from, year_to)
    VALUES ($1, $2, $3, $4)
    RETURNING id, make, model, year_from, year_to, status
  `, [make, model, yearFrom || null, yearTo || null]);
  return result.rows[0];
};

export const updateBike = async (id, { make, model, yearFrom, yearTo, status }) => {
  const result = await pool.query(`
    UPDATE bikes
    SET make=$1, model=$2, year_from=$3, year_to=$4, status=$5, updated_at=CURRENT_TIMESTAMP
    WHERE id=$6
    RETURNING id, make, model, year_from, year_to, status
  `, [make, model, yearFrom || null, yearTo || null, status, id]);
  return result.rows[0] || null;
};

export const deleteBike = async (id) => {
  const result = await pool.query("DELETE FROM bikes WHERE id=$1 RETURNING id", [id]);
  return result.rows[0] || null;
};

export const replaceCompatibility = async (bikeId, productIds) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query("DELETE FROM bike_compatibility WHERE bike_id=$1", [bikeId]);

    const ids = [...new Set(productIds.map(Number).filter(Number.isInteger))];
    if (ids.length) {
      await client.query(
        `INSERT INTO bike_compatibility (bike_id, product_id)
         SELECT $1, p.id FROM products p WHERE p.id = ANY($2::int[])`,
        [bikeId, ids]
      );
    }

    await client.query("COMMIT");
    return getCompatibleProducts(bikeId);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};
