import express from "express";
import path from "path";
import { fileURLToPath } from "url";

import { env, validateEnvironment } from "./config/environment.js";
import { checkDatabaseConnection } from "./config/database.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import addressRoutes from "./routes/addressRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import wishlistRoutes from "./routes/wishlistRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import trackRoutes from "./routes/trackRoutes.js";
import newsletterRoutes from "./routes/newsletterRoutes.js";
import bikeRoutes from "./routes/bikeRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import { errorHandler } from "./middleware/errorMiddleware.js";

validateEnvironment();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.join(__dirname, "..", "public");

const app = express();
app.disable("x-powered-by");

app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  if (env.nodeEnv === "production") {
    res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  }
  next();
});

app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: true, limit: "50kb" }));

app.get("/api/health", (req, res) => {
  res.json({ success: true, status: "ok", service: "roadready-api" });
});

app.get("/api/health/ready", async (req, res) => {
  try {
    await checkDatabaseConnection();
    res.json({ success: true, status: "ready", database: "ok" });
  } catch (error) {
    console.error("Readiness check failed:", error.message);
    res.status(503).json({ success: false, status: "not-ready", database: "unavailable" });
  }
});

app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/addresses", addressRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/users", userRoutes);
app.use("/api/track", trackRoutes);
app.use("/api/newsletter", newsletterRoutes);
app.use("/api/bikes", bikeRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/admin", adminRoutes);


// Professional browser routes. Legacy /pages/*.html URLs remain supported
// by the static handler below so existing bookmarks do not break.
const page = (file) => (req, res) => res.sendFile(path.join(publicDir, "pages", file));

app.get("/shop", page("shop.html"));
app.get("/product/:id", page("product.html"));
app.get("/cart", page("cart.html"));
app.get("/checkout", page("checkout.html"));
app.get("/track-order", page("track-order.html"));
app.get("/order-confirmation/:id", page("order-confirmation.html"));
app.get("/bike-finder", page("bike-finder.html"));
app.get("/deals", page("deals.html"));
app.get("/help", page("help.html"));
app.get("/contact", page("contact.html"));

app.get("/login", page("auth/login.html"));
app.get("/register", page("auth/register.html"));
app.get("/forgot-password", page("auth/forgot-password.html"));
app.get("/reset-password", page("auth/reset-password.html"));
app.get("/verify-email", page("auth/verify-email.html"));

app.get("/account", page("account/account.html"));
app.get("/account/orders", page("account/orders.html"));
app.get("/account/order/:id", page("account/order-details.html"));
app.get("/account/wishlist", page("account/wishlist.html"));
app.get("/account/addresses", page("account/addresses.html"));
app.get("/account/profile", page("account/profile.html"));

app.get("/admin", page("admin/dashboard.html"));
app.get("/admin/dashboard", page("admin/dashboard.html"));
app.get("/admin/products", page("admin/products.html"));
app.get("/admin/product/new", page("admin/product-form.html"));
app.get("/admin/product/:id/edit", page("admin/product-form.html"));
app.get("/admin/categories", page("admin/categories.html"));
app.get("/admin/orders", page("admin/orders.html"));
app.get("/admin/order/:id", page("admin/order-details.html"));
app.get("/admin/customers", page("admin/customers.html"));
app.get("/admin/customer/:id", page("admin/customer-details.html"));
app.get("/admin/bikes", page("admin/bikes.html"));

app.use(express.static(publicDir, { extensions: ["html"] }));

app.use((req, res) => {
  if (req.path.startsWith("/api/")) {
    return res.status(404).json({ success: false, message: "API endpoint not found" });
  }
  return res.status(404).sendFile(path.join(publicDir, "404.html"));
});

app.use(errorHandler);

const server = app.listen(env.port, "0.0.0.0", () => {
  console.log(`RoadReady server running on port ${env.port}`);
  if (!env.databaseUrl) console.warn("DATABASE_URL is not configured; database-backed features will fail until it is set.");
});

const shutdown = (signal) => {
  console.log(`${signal} received; shutting down RoadReady.`);
  server.close(() => process.exit(0));
};
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
