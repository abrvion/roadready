import "../utils/notification.js";
// Header component logic.
import { updateCartCount } from "../utils/cartUt.js";
import { getToken, getUser } from "../utils/auth.js";

const header = document.getElementById("site-header");

header.innerHTML = `
    <!-- Top utility bar -->
    <div class="rr-topbar">
        <div class="rr-container rr-topbar-inner">

            <div class="rr-topbar-message">
                <i class="bi bi-truck"></i>
                <span>Fast delivery across Bangladesh</span>
            </div>

            <div class="rr-topbar-links">
                <a href="/track-order">Track Order</a>
                <a href="/help">Help Center</a>
            </div>

        </div>
    </div>


    <!-- Main navigation -->
    <nav class="rr-navbar">

        <div class="rr-container rr-navbar-inner">

            <!-- Brand -->
            <a href="/" class="rr-logo" aria-label="RoadReady home">

                <span class="rr-logo-mark">
                    <i class="bi bi-speedometer2"></i>
                </span>

                <span class="rr-logo-text">
                    ROAD<span>READY</span>
                </span>

            </a>


            <!-- Desktop navigation -->
            <div class="rr-nav-links">
                <a href="/" class="rr-nav-link">Home</a>
                <a href="/shop" class="rr-nav-link">Shop</a>

                <div class="rr-nav-dropdown-wrap">
                    <button type="button" class="rr-nav-link rr-nav-dropdown" aria-expanded="false" aria-haspopup="true">
                        Categories <i class="bi bi-chevron-down"></i>
                    </button>
                    <div class="rr-category-menu" role="menu">
                        <div class="rr-category-menu-loading">Loading categories...</div>
                    </div>
                </div>

                <a href="/bike-finder" class="rr-nav-link">Bike Finder</a>
                <a href="/deals" class="rr-nav-link rr-deals-link">Deals</a>
            </div>

            <!-- Search -->
            <button
                type="button"
                class="rr-search-icon-button"
                aria-label="Search products"
                title="Search"
            >
                <i class="bi bi-search"></i>
            </button>


            <!-- Customer actions -->
            <div class="rr-actions">

                <a
                    href="/account/wishlist"
                    class="rr-action"
                    aria-label="Wishlist"
                    title="Wishlist"
                >
                    <i class="bi bi-heart"></i>
                </a>

                <a
                    href="/login"
                    class="rr-action rr-account-action"
                    aria-label="Account"
                    title="Account"
                >
                    <i class="bi bi-person"></i>
                </a>

                <a
                    href="/cart"
                    class="rr-action rr-cart-action"
                    aria-label="Shopping cart"
                    title="Cart"
                >
                    <i class="bi bi-bag"></i>
                    <span class="rr-cart-count">0</span>
                </a>

            </div>


            <!-- Mobile menu -->
            <button
                class="rr-mobile-menu"
                type="button"
                aria-label="Open navigation menu"
            >
                <i class="bi bi-list"></i>
            </button>

        </div>

    </nav>


    <!-- Mobile navigation -->

    <div class="rr-mobile-overlay"></div>

    <aside
        class="rr-mobile-drawer"
        aria-hidden="true"
    >

        <div class="rr-mobile-drawer-header">

            <a href="/" class="rr-logo">

                <span class="rr-logo-mark">
                    <i class="bi bi-speedometer2"></i>
                </span>

                <span class="rr-logo-text">
                    ROAD<span>READY</span>
                </span>

            </a>

            <button
                type="button"
                class="rr-mobile-close"
                aria-label="Close navigation"
            >
                <i class="bi bi-x-lg"></i>
            </button>

        </div>


        <nav class="rr-mobile-nav">
            <a href="/"><span>Home</span><i class="bi bi-chevron-right"></i></a>
            <a href="/shop"><span>Shop</span><i class="bi bi-chevron-right"></i></a>
            <details class="rr-mobile-categories">
                <summary><span>Categories</span><i class="bi bi-chevron-down"></i></summary>
                <div class="rr-mobile-category-list"><span>Loading categories...</span></div>
            </details>
            <a href="/bike-finder"><span>Bike Finder</span><i class="bi bi-chevron-right"></i></a>
            <a href="/deals" class="mobile-deals"><span>Deals</span><i class="bi bi-chevron-right"></i></a>
        </nav>


        <div class="rr-mobile-divider"></div>


        <div class="rr-mobile-secondary">

            <a href="/account/wishlist">
                <i class="bi bi-heart"></i>
                <span>Wishlist</span>
            </a>

            <a
                href="/login"
                class="rr-mobile-account-action"
            >
                <i class="bi bi-person"></i>
                <span>My Account</span>
            </a>

            <a href="/track-order">
                Track Order
            </a>

        </div>


        <div class="rr-mobile-help">

            <span>Need help?</span>

            <a href="/contact">
                Contact RoadReady
            </a>

        </div>

    </aside>
`;


/* =====================================================
   AUTHENTICATION STATE
   ===================================================== */
const token = getToken();
const storedUser = getUser();
const accountAction = document.querySelector(".rr-account-action");
const mobileAccountAction = document.querySelector(".rr-mobile-account-action");

if (token) {
  accountAction?.setAttribute("href", "/account");
  accountAction?.setAttribute("title", "My Account");
  accountAction?.setAttribute("aria-label", "My Account");
  mobileAccountAction?.setAttribute("href", "/account");
} else {
  accountAction?.setAttribute("href", "/login");
  mobileAccountAction?.setAttribute("href", "/login");
}

/* =====================================================
   CATEGORY NAVIGATION
   ===================================================== */
const slugify = (value) => String(value || "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const escapeHtml = (value) => String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");

const loadCategoryNavigation = async () => {
  const desktopMenu = document.querySelector(".rr-category-menu");
  const mobileMenu = document.querySelector(".rr-mobile-category-list");
  try {
    const response = await fetch("/api/categories");
    const data = await response.json();
    if (!response.ok || !data.success) throw new Error(data.message || "Unable to load categories");
    // The public categories endpoint already returns active categories only.
    // Do not filter again here because the public response intentionally omits status.
    const categories = data.categories || [];

    const html = categories.length
      ? categories.map(c => `<a role="menuitem" href="/shop?category=${encodeURIComponent(slugify(c.name))}"><span>${escapeHtml(c.name)}</span><i class="bi bi-arrow-right"></i></a>`).join("")
      : `<span class="rr-category-menu-empty">No categories available.</span>`;

    if (desktopMenu) desktopMenu.innerHTML = html;
    if (mobileMenu) mobileMenu.innerHTML = html.replaceAll('role="menuitem"', "");
  } catch (error) {
    console.error("Category navigation failed:", error);
    if (desktopMenu) desktopMenu.innerHTML = `<a href="/shop">Browse all products <i class="bi bi-arrow-right"></i></a>`;
    if (mobileMenu) mobileMenu.innerHTML = `<a href="/shop">Browse all products</a>`;
  }
};

const categoryToggle = document.querySelector(".rr-nav-dropdown");
const categoryWrap = document.querySelector(".rr-nav-dropdown-wrap");

categoryToggle?.addEventListener("click", () => {
  const open = categoryWrap.classList.toggle("is-open");
  categoryToggle.setAttribute("aria-expanded", String(open));
});

document.addEventListener("click", event => {
  if (categoryWrap && !categoryWrap.contains(event.target)) {
    categoryWrap.classList.remove("is-open");
    categoryToggle?.setAttribute("aria-expanded", "false");
  }
});

loadCategoryNavigation();

/* =====================================================
   CART COUNT
   ===================================================== */

updateCartCount();



/* =====================================================
   MOBILE MENU
   ===================================================== */

const mobileMenu =
    document.querySelector(".rr-mobile-menu");

const mobileDrawer =
    document.querySelector(".rr-mobile-drawer");

const mobileOverlay =
    document.querySelector(".rr-mobile-overlay");

const mobileClose =
    document.querySelector(".rr-mobile-close");


function openMobileMenu() {

    mobileDrawer.classList.add("is-open");

    mobileOverlay.classList.add("is-visible");

    mobileDrawer.setAttribute(
        "aria-hidden",
        "false"
    );

    document.body.style.overflow =
        "hidden";
}


function closeMobileMenu() {

    mobileDrawer.classList.remove("is-open");

    mobileOverlay.classList.remove(
        "is-visible"
    );

    mobileDrawer.setAttribute(
        "aria-hidden",
        "true"
    );

    document.body.style.overflow =
        "";
}


mobileMenu.addEventListener(
    "click",
    openMobileMenu
);

mobileClose.addEventListener(
    "click",
    closeMobileMenu
);

mobileOverlay.addEventListener(
    "click",
    closeMobileMenu
);

const searchButton = document.querySelector(".rr-search-icon-button");
if (searchButton) {
  searchButton.addEventListener("click", () => {
    window.location.assign("/shop?focus=search");
  });
}
