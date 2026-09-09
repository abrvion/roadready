import "../components/header.js";
import "../components/footer.js";
import { addProductToCart } from "../utils/cartUt.js";
import { showNotification } from "../utils/notification.js";

const token = localStorage.getItem("token");
const grid = document.querySelector(".rr-wishlist-grid");
const header = document.querySelector(".rr-page-header");

if (!token) {
  window.location.href = "/login";
}

const escapeHtml = (value) => String(value ?? "").replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[char]));

const render = (items) => {
  if (!items.length) {
    grid.innerHTML = `<div class="rr-account-empty" style="grid-column:1/-1"><h3>Your wishlist is empty</h3><p>Save products you want to come back to.</p><a class="rr-btn rr-btn-primary" href="/shop">Browse Products</a></div>`;
    return;
  }
  grid.innerHTML = items.map((item) => {
    const id = Number(item.product_id);
    return `<article class="rr-wishlist-card" data-product-id="${id}">
      <div class="rr-wishlist-image"><img src="${escapeHtml(item.image || "")}" alt="${escapeHtml(item.name)}" loading="lazy">
        <button type="button" class="rr-wishlist-remove" aria-label="Remove ${escapeHtml(item.name)} from wishlist" data-product-id="${id}"><i class="bi bi-heart-fill"></i></button>
      </div>
      <div class="rr-wishlist-content"><span class="rr-product-category">${escapeHtml(item.category || "")}</span><h2>${escapeHtml(item.name)}</h2>
        <div class="rr-wishlist-bottom"><strong>৳${Number(item.price).toLocaleString()}</strong><button type="button" class="rr-wishlist-cart" data-product-id="${id}"><i class="bi bi-bag-plus"></i> Add to Cart</button></div>
      </div></article>`;
  }).join("");

  grid.querySelectorAll(".rr-wishlist-remove").forEach((button) => button.addEventListener("click", () => remove(button.dataset.productId)));
  grid.querySelectorAll(".rr-wishlist-cart").forEach((button) => button.addEventListener("click", async () => {
    const result = await addProductToCart(Number(button.dataset.productId));
    if (result.success) showNotification("Product added to cart");
  }));
};

const load = async () => {
  try {
    const response = await fetch("/api/wishlist", { headers: { Authorization: `Bearer ${token}` } });
    const data = await response.json();
    if (response.status === 401) throw new Error("Authentication required");
    if (!response.ok) throw new Error(data.message || "Unable to load wishlist");
    render(data.items || []);
  } catch (error) {
    if (error.message === "Authentication required") {
      fetch("/api/auth/logout", { method: "POST", credentials: "same-origin" }).catch(() => {}); localStorage.removeItem("token"); localStorage.removeItem("user"); window.location.href = "/login"; return;
    }
    console.error(error); grid.innerHTML = `<div class="rr-account-empty" style="grid-column:1/-1"><h3>Unable to load wishlist</h3><p>Please try again.</p></div>`;
  }
};

const remove = async (productId) => {
  try {
    const response = await fetch(`/api/wishlist/${productId}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Unable to remove item");
    await load();
  } catch (error) { showNotification(error.message || "Unable to remove item"); }
};

load();
