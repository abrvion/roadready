
import { addProductToCart } from "../utils/cartUt.js";
import { showNotification } from "../utils/notification.js";

const escapeHtml = (value) =>
    String(value ?? "").replace(/[&<>'"]/g, (char) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "'": "&#39;",
        '"': "&quot;"
    }[char]));


const createRatingStars = (rating) => {

    const numericRating = Number(rating);

    if (
        !Number.isFinite(numericRating) ||
        numericRating <= 0
    ) {
        return "☆☆☆☆☆";
    }


    const roundedRating = Math.max(
        0,
        Math.min(
            5,
            Math.round(numericRating)
        )
    );


    return (
        "★".repeat(roundedRating) +
        "☆".repeat(5 - roundedRating)
    );
};


export function createProductCard(product) {

    const id = Number(product.id);

    const name =
        escapeHtml(product.name);

    const category =
        escapeHtml(product.category || "");

    const image =
        escapeHtml(product.image || "");

    const badge =
        escapeHtml(product.badge || "");


    /*
     * These values come from the PostgreSQL-backed
     * product API.
     */
    const averageRating =
        Number(product.average_rating) || 0;

    const reviewCount =
        Number(product.review_count) || 0;


    const ratingStars =
        createRatingStars(averageRating);


    const price =
        Number(product.price);


    const oldPrice =
        product.oldPrice != null
            ? Number(product.oldPrice)
            : null;


    return `
        <article
            class="rr-product-card"
            data-product-id="${id}"
        >

            <div class="rr-product-image">

                ${
                    badge
                        ? `
                            <span class="rr-product-badge">
                                ${badge}
                            </span>
                        `
                        : ""
                }


                <button
                    type="button"
                    class="rr-product-wishlist"
                    aria-label="Add ${name} to wishlist"
                    data-product-id="${id}"
                >
                    <i class="bi bi-heart"></i>
                </button>


                <a
                    href="/product/${id}"
                    class="rr-product-image-link"
                    aria-label="View ${name}"
                >
                    <img
                        src="${image}"
                        alt="${name}"
                        loading="lazy"
                    >
                </a>

            </div>


            <div class="rr-product-content">

                <span class="rr-product-category">
                    ${category}
                </span>


                <h3 class="rr-product-name">

                    <a href="/product/${id}">
                        ${name}
                    </a>

                </h3>


                <div class="rr-product-rating">

                    <span class="rr-product-stars">
                        ${ratingStars}
                    </span>

                    <span class="rr-product-reviews">
                        (${reviewCount})
                    </span>

                </div>


                <div class="rr-product-footer">

                    <div class="rr-product-price">

                        <span class="rr-product-current">
                            ৳${
                                Number.isFinite(price)
                                    ? price.toLocaleString()
                                    : "0"
                            }
                        </span>


                        ${
                            oldPrice != null &&
                            Number.isFinite(oldPrice)
                                ? `
                                    <span class="rr-product-old">
                                        ৳${oldPrice.toLocaleString()}
                                    </span>
                                `
                                : ""
                        }

                    </div>


                    <button
                        type="button"
                        class="rr-add-cart"
                        aria-label="Add ${name} to cart"
                        data-product-id="${id}"
                    >
                        <i class="bi bi-cart-plus"></i>
                    </button>

                </div>

            </div>

        </article>
    `;
}


export function attachProductCardEvents(container) {

    container
        .querySelectorAll(".rr-add-cart")
        .forEach((button) => {

            button.addEventListener(
                "click",
                async (event) => {

                    event.preventDefault();
                    event.stopPropagation();


                    const productId =
                        Number(
                            button.dataset.productId
                        );


                    if (!productId) {
                        return;
                    }


                    const result =
                        await addProductToCart(
                            productId
                        );


                    if (result.success) {

                        showNotification(
                            "Product added to cart"
                        );

                    }

                }
            );

        });


    container
        .querySelectorAll(".rr-product-wishlist")
        .forEach((button) => {

            button.addEventListener(
                "click",
                async (event) => {

                    event.preventDefault();
                    event.stopPropagation();


                    const token =
                        localStorage.getItem(
                            "token"
                        );


                    if (!token) {

                        window.location.href =
                            "/login";

                        return;
                    }


                    const productId =
                        Number(
                            button.dataset.productId
                        );


                    try {

                        const response =
                            await fetch(
                                "/api/wishlist",
                                {
                                    method: "POST",

                                    headers: {
                                        "Content-Type":
                                            "application/json",

                                        Authorization:
                                            `Bearer ${token}`
                                    },

                                    body:
                                        JSON.stringify({
                                            productId
                                        })
                                }
                            );


                        const data =
                            await response.json();


                        if (!response.ok) {

                            throw new Error(
                                data.message ||
                                "Unable to update wishlist"
                            );

                        }


                        button.classList.add(
                            "is-active"
                        );


                        const icon =
                            button.querySelector("i");


                        if (icon) {

                            icon.classList.remove(
                                "bi-heart"
                            );

                            icon.classList.add(
                                "bi-heart-fill"
                            );

                        }


                        showNotification(
                            "Saved to wishlist"
                        );

                    } catch (error) {

                        console.error(
                            "Wishlist update failed:",
                            error
                        );


                        showNotification(
                            error.message ||
                            "Unable to update wishlist"
                        );

                    }

                }
            );

        });

}

