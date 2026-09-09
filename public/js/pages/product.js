// Product page logic.

import "../components/header.js";
import "../components/footer.js";

import { createProductGrid } from "../components/product-grid.js";

import {
    addProductToCart
} from "../utils/cartUt.js";

import { showNotification } from "../utils/notification.js";
import { getToken } from "../utils/auth.js";


/* =========================================================
   GET PRODUCT ID FROM URL
   ========================================================= */

const params =
    new URLSearchParams(
        window.location.search
    );

const productId =
    params.get("id") ||
    window.location.pathname.match(/^\/product\/(\d+)/)?.[1];


/* =========================================================
   PAGE ELEMENTS
   ========================================================= */

const titleElement =
    document.getElementById("product-title");

const priceElement =
    document.getElementById("product-price");

const descriptionElement =
    document.querySelector(
        ".rr-product-description"
    );

const mainImage =
    document.getElementById(
        "product-main-image"
    );

const categoryElement =
    document.querySelector(
        ".rr-product-detail-category"
    );

const quantityElement =
    document.getElementById(
        "product-quantity"
    );

const minusButton =
    document.getElementById(
        "quantity-minus"
    );

const plusButton =
    document.getElementById(
        "quantity-plus"
    );

const addToCartButton =
    document.getElementById(
        "add-to-cart"
    );

const buyNowButton =
    document.getElementById(
        "buy-now"
    );


/* =========================================================
   QUANTITY
   ========================================================= */

let quantity = 1;
let productStock = 0;


function updateQuantity() {

    quantityElement.textContent =
        quantity;

}


minusButton.addEventListener(
    "click",
    () => {

        if (quantity > 1) {

            quantity--;

            updateQuantity();

        }

    }
);


plusButton.addEventListener(
    "click",
    () => {

        if (productStock > 0 && quantity >= productStock) return;
        quantity++;

        updateQuantity();

    }
);


/* =========================================================
   LOAD PRODUCT
   ========================================================= */

async function loadProduct() {

    try {

        if (!productId) {

            console.error(
                "Product ID is missing from URL."
            );

            return;

        }


        const response =
            await fetch(
                `/api/products/${productId}`
            );


        const data =
            await response.json();


        if (!data.success) {

            console.error(
                "Failed to load product:",
                data.message
            );

            return;

        }


        const product =
            data.product;
        productStock = Number(product.stock) || 0;


        /* ================================================
           UPDATE PAGE
           ================================================ */

        titleElement.textContent =
            product.name;


        priceElement.textContent =
            `৳${Number(
                product.price
            ).toLocaleString()}`;


        descriptionElement.textContent =
            product.description;


        mainImage.src =
            product.image ||
            "/assets/images/products/product-placeholder.svg";


        mainImage.alt =
            product.name;


        categoryElement.textContent =
            product.category;

        const ratingElement = document.querySelector(".rr-product-detail-rating");
        if (ratingElement) {
            const rating = Number(product.average_rating || 0);
            const count = Number(product.review_count || 0);
            ratingElement.innerHTML = `<span class="rr-review-stars">${"★".repeat(Math.round(rating))}${"☆".repeat(5 - Math.round(rating))}</span><span>${rating ? rating.toFixed(1) : "No rating"}</span><span class="rr-review-count">(${count} review${count === 1 ? "" : "s"})</span>`;
        }


        /* ================================================
           STOCK
           ================================================ */

        const availability =
            document.querySelector(
                ".rr-product-availability span"
            );


        if (availability) {

            if (product.stock > 0) {

                availability.textContent =
                    `In Stock (${product.stock} available)`;

            } else {

                availability.textContent =
                    "Out of Stock";


                addToCartButton.disabled =
                    true;


                buyNowButton.disabled =
                    true;

            }

        }


        /* ================================================
           PAGE TITLE
           ================================================ */

        document.title =
            `${product.name} | RoadReady`;


        /* ================================================
           ADD TO CART
           ================================================ */

        addToCartButton.addEventListener(
            "click",
            async () => {

                const result =
                    await addProductToCart(
                        product.id,
                        quantity
                    );


                if (result.success) {

                    showNotification(
                        "Product added to cart"
                    );

                }

            }
        );


        /* ================================================
           BUY NOW
           ================================================ */

        buyNowButton.addEventListener(
            "click",
            () =>
                buyProductNow(
                    product.id
                )
        );

    } catch (error) {

        console.error(
            "Failed to load product:",
            error
        );

    }

}


/* =========================================================
   BUY NOW
   ========================================================= */

async function buyProductNow(
    productId
) {

    const token =
        localStorage.getItem(
            "token"
        );


    if (!token) {

        alert(
            "Please login before buying a product."
        );

        return;

    }


    try {

        const response =
            await fetch(
                "/api/cart",
                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json",

                        "Authorization":
                            `Bearer ${token}`

                    },

                    body: JSON.stringify({

                        productId,

                        quantity

                    })

                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            alert(
                data.message ||
                "Failed to add product to cart."
            );

            return;

        }


        window.location.href =
            "/cart";

    } catch (error) {

        console.error(
            "Buy now failed:",
            error
        );

    }

}


/* =========================================================
   PRODUCT GALLERY
   ========================================================= */

const thumbnails =
    document.querySelectorAll(
        ".rr-product-thumbnail"
    );


thumbnails.forEach(
    (thumbnail) => {

        thumbnail.addEventListener(
            "click",
            () => {

                thumbnails.forEach(
                    (item) => {

                        item.classList.remove(
                            "active"
                        );

                    }
                );


                thumbnail.classList.add(
                    "active"
                );


                const image =
                    thumbnail.querySelector(
                        "img"
                    );


                mainImage.src =
                    image.src;

            }
        );

    }
);


/* =========================================================
   REVIEWS
   ========================================================= */

const stars = (rating) => {
    const value = Math.round(Number(rating) || 0);
    return "★".repeat(value) + "☆".repeat(5 - value);
};

async function loadReviews() {
    const section = document.getElementById("product-reviews");
    const summaryEl = document.getElementById("review-summary");
    const list = document.getElementById("review-list");
    const formContainer = document.getElementById("review-form-container");
    if (!section || !productId) return;
    section.hidden = false;
    try {
        const response = await fetch(`/api/reviews/product/${productId}`);
        const data = await response.json();
        if (!response.ok || !data.success) throw new Error(data.message || "Unable to load reviews");
        const summary = data.summary || { average_rating: 0, review_count: 0 };
        summaryEl.innerHTML = `<span class="rr-review-stars">${stars(summary.average_rating)}</span><span class="rr-review-average">${Number(summary.average_rating).toFixed(1)}</span><span class="rr-review-count">${Number(summary.review_count)} review${Number(summary.review_count) === 1 ? "" : "s"}</span>`;
        list.innerHTML = data.reviews?.length ? data.reviews.map(review => `<article class="rr-review-item"><div class="rr-review-item-head"><div><div class="rr-review-stars">${stars(review.rating)}</div><h3>${escapeHtml(review.title || "Customer review")}</h3><span class="rr-review-meta">${escapeHtml(review.user_name)} · ${new Date(review.created_at).toLocaleDateString()}</span></div></div>${review.body ? `<p>${escapeHtml(review.body)}</p>` : ""}</article>`).join("") : `<div class="rr-review-empty">No reviews yet. Be the first verified buyer to share your experience.</div>`;
        renderReviewForm(formContainer);
    } catch (error) {
        console.error("Failed to load reviews:", error);
        summaryEl.innerHTML = "";
        list.innerHTML = `<div class="rr-review-empty">Reviews are temporarily unavailable.</div>`;
    }
}

const escapeHtml = (value) => String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");

async function renderReviewForm(container) {
    if (!container) return;
    const token = getToken();
    if (!token) {
        container.innerHTML = `<p class="rr-review-meta">Purchased this product? <a href="/login?next=${encodeURIComponent(location.pathname + location.search)}">Sign in</a> to leave a verified review.</p>`;
        return;
    }
    container.innerHTML = `<form class="rr-review-form" id="review-form"><div class="rr-review-form-grid"><div class="rr-review-rating" aria-label="Rating"><span>Rating</span>${[1,2,3,4,5].map(n => `<button type="button" data-rating="${n}" aria-label="${n} star${n>1?'s':''}">★</button>`).join("")}</div><label>Title<input id="review-title" maxlength="120" placeholder="How was the product?"></label><label>Review<textarea id="review-body" maxlength="2000" placeholder="Tell other riders about quality, fit and performance"></textarea></label></div><div class="rr-review-actions"><button class="rr-btn rr-btn-primary" type="submit">Submit Review</button></div></form>`;
    const form = container.querySelector("#review-form");
    let rating = 0;
    form.querySelectorAll("[data-rating]").forEach(button => button.addEventListener("click", () => {
        rating = Number(button.dataset.rating);
        form.querySelectorAll("[data-rating]").forEach(b => b.classList.toggle("is-selected", Number(b.dataset.rating) <= rating));
    }));
    form.addEventListener("submit", async event => {
        event.preventDefault();
        if (!rating) return showNotification("Please choose a rating.", "error");
        const button = form.querySelector("button[type=submit]");
        button.disabled = true;
        try {
            const response = await fetch(`/api/reviews/product/${productId}`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ rating, title: form.querySelector("#review-title").value, body: form.querySelector("#review-body").value }) });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || "Unable to submit review");
            showNotification("Review published successfully.");
            await loadReviews();
        } catch (error) {
            showNotification(error.message || "Unable to submit review", "error");
        } finally { button.disabled = false; }
    });
}

/* =========================================================
   RELATED PRODUCTS
   ========================================================= */

async function loadRelatedProducts() {

    try {

        const response =
            await fetch(
                "/api/products"
            );


        const data =
            await response.json();


        if (!data.success) {

            console.error(
                "Failed to load related products:",
                data.message
            );

            return;

        }


        const products =
            data.products
                .filter(
                    (product) =>
                        product.id !==
                        Number(productId)
                )
                .slice(0, 3);


        const relatedGrid =
            document.getElementById(
                "related-product-grid"
            );


        relatedGrid.innerHTML =
            createProductGrid(
                products
            );

    } catch (error) {

        console.error(
            "Failed to load related products:",
            error
        );

    }

}


/* =========================================================
   START
   ========================================================= */

loadProduct();
loadReviews();
loadRelatedProducts();