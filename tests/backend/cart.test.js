import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

test("cart schema prevents duplicate products and invalid quantities", () => {
  const schema = fs.readFileSync("database/schema.sql", "utf8");
  assert.match(schema, /cart_items_cart_id_product_id_key/);
  assert.match(schema, /cart_items_quantity_positive/);
});
