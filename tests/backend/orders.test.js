import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

test("order migration is idempotent and backfills public order numbers", () => {
  const migration = fs.readFileSync("database/migrations/003_order_numbers.sql", "utf8");
  assert.match(migration, /ADD COLUMN IF NOT EXISTS order_number/);
  assert.match(migration, /UPDATE orders/);
  assert.match(migration, /CREATE UNIQUE INDEX IF NOT EXISTS/);
});
