import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const read = (file) => fs.readFileSync(file, "utf8");

test("customer navigation and account data are database-backed", () => {
  const header = read("public/js/components/header.js");
  const account = read("public/js/pages/account.js");
  const orderDetails = read("public/js/pages/order-details.js");

  assert.match(header, /window\.location\.assign\("\/shop\?focus=search"\)/);
  assert.doesNotMatch(header, /filter\(c\s*=>\s*c\.status\s*===\s*["']active["']\)/);
  assert.match(account, /\/api\/wishlist/);
  assert.match(account, /\/api\/addresses/);
  assert.ok(orderDetails.includes("window.location.pathname.match(/^\\/account\\/order\\/(\\d+)/)"));
});

test("admin dashboard and lists do not rely on demo metrics", () => {
  const dashboard = read("public/pages/admin/dashboard.html");
  const products = read("public/pages/admin/products.html");
  const orders = read("public/pages/admin/orders.html");
  const customers = read("public/pages/admin/customers.html");
  const adminJs = read("public/js/pages/admin.js");

  assert.match(dashboard, /id="admin-total-revenue"/);
  assert.match(dashboard, /id="admin-total-orders"/);
  assert.match(dashboard, /id="admin-total-customers"/);
  assert.match(dashboard, /id="admin-total-products"/);
  assert.doesNotMatch(dashboard, /248,500|12\.5% from last month|#RR-10001/);
  assert.match(products, /id="admin-products-total-page"/);
  assert.match(orders, /id="admin-orders-total-page"/);
  assert.match(customers, /id="admin-total-customers-page"/);
  assert.match(adminJs, /sidebar\.classList\.add\("is-open"\)/);
  assert.match(adminJs, /overlay\.classList\.add\("is-visible"\)/);
});

test("bike admin uses the actual auth response and shared admin navigation", () => {
  const bikeJs = read("public/js/pages/bike-admin.js");
  const bikeHtml = read("public/pages/admin/bikes.html");
  const authRoutes = read("server/routes/authRoutes.js");

  assert.match(bikeJs, /request\("\/api\/auth\/me"\)\.then\(data/);
  assert.match(bikeJs, /const user = data\?\.user/);
  assert.match(bikeHtml, /class="rr-admin-nav-link is-active"/);
  assert.match(bikeHtml, /src="\/js\/pages\/admin\.js"/);
  assert.match(authRoutes, /getUserById\(req\.user\.id\)/);
});


test("email verification and review infrastructure is wired end-to-end", () => {
  const server = fs.readFileSync(path.join(root, "server/server.js"), "utf8");
  const authRoutes = fs.readFileSync(path.join(root, "server/routes/authRoutes.js"), "utf8");
  const migration = fs.readFileSync(path.join(root, "database/migrations/006_email_verification.sql"), "utf8");
  const reviews = fs.readFileSync(path.join(root, "database/migrations/007_reviews.sql"), "utf8");
  assert.match(server, /app\.use\("\/api\/reviews", reviewRoutes\)/);
  assert.match(server, /app\.get\("\/verify-email"/);
  assert.match(authRoutes, /\/verify-email/);
  assert.match(migration, /email_verified boolean NOT NULL DEFAULT true/);
  assert.match(reviews, /reviews_user_product_key UNIQUE/);
});

test("admin product listing does not reference an undefined customer metric", () => {
  const adminModel = fs.readFileSync(path.join(root, "server/models/Admin.js"), "utf8");
  assert.doesNotMatch(adminModel, /new_customers:\s*newCustomers/);
  assert.match(adminModel, /FROM products/);
});
