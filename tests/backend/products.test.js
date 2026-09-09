import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

test("schema contains product integrity constraints", () => {
  const schema = fs.readFileSync("database/schema.sql", "utf8");
  assert.match(schema, /products_price_nonnegative/);
  assert.match(schema, /products_stock_nonnegative/);
  assert.match(schema, /order_number/);
});

test("catalogue pages do not load the global homepage bootstrap", () => {
  for (const file of ["public/pages/shop.html", "public/pages/product.html"]) {
    const html = fs.readFileSync(file, "utf8");
    assert.doesNotMatch(html, /src=["']\/js\/main\.js["']/);
  }
});
