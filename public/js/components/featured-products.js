import { createProductGrid, initializeProductGrid } from "./product-grid.js";

const container = document.getElementById("featured-products");

const render = (products) => {
  container.innerHTML = `<section class="rr-featured-products"><div class="rr-container"><div class="rr-section-header"><div><span class="rr-section-eyebrow">FEATURED PRODUCTS</span><h2>Popular Picks for Every Ride</h2><p>Discover some of our most popular motorcycle essentials.</p></div><a href="/shop" class="rr-section-link">View All <i class="bi bi-arrow-right"></i></a></div>${createProductGrid(products.slice(0, 8))}</div></section>`;
  initializeProductGrid(container);
};

const load = async () => {
  try {
    const response = await fetch("/api/products");
    const data = await response.json();
    if (!response.ok || !data.success) throw new Error(data.message || "Unable to load products");
    render(data.products || []);
  } catch (error) {
    console.error("Failed to load featured products:", error);
    container.innerHTML = `<section class="rr-featured-products"><div class="rr-container"><div class="rr-section-header"><div><span class="rr-section-eyebrow">FEATURED PRODUCTS</span><h2>Shop RoadReady</h2><p>Products are temporarily unavailable. Please try the shop again.</p></div><a href="/shop" class="rr-section-link">Open Shop <i class="bi bi-arrow-right"></i></a></div></div></section>`;
  }
};

load();
