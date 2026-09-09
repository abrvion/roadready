
// Cart page logic.

// Load shared site components.
import "../components/header.js";
import "../components/footer.js";
import {
    updateCartCount
} from "../utils/cartUt.js";


/* =========================================================
   PAGE ELEMENTS
   ========================================================= */

const cartSection =
    document.getElementById("cart-section");

const emptyCartSection =
    document.getElementById("empty-cart");

const cartItemsContainer =
    document.getElementById("cart-items-container");

const cartItemCount =
    document.getElementById("cart-item-count");

const cartSubtotal =
    document.getElementById("cart-subtotal");

const cartDelivery =
    document.getElementById("cart-delivery");

const cartTotal =
    document.getElementById("cart-total");

const checkoutButton =
    document.getElementById("checkout-button");


/* =========================================================
   AUTHENTICATION
   ========================================================= */

const token =
    localStorage.getItem("token");


/* =========================================================
   CART STATE
   ========================================================= */

let cart = [];


/* =========================================================
   LOAD CART
   ========================================================= */

async function loadCart() {

    if (!token) {

        showEmptyCart();

        return;

    }


    try {

        const response =
            await fetch("/api/cart", {

                method: "GET",

                headers: {

                    "Authorization":
                        `Bearer ${token}`

                }

            });


        const data =
            await response.json();


        if (!response.ok) {

            console.error(
                "Failed to load cart:",
                data.message
            );

            showEmptyCart();

            return;

        }


        cart =
            data.cart || [];


        renderCart();


        await updateCartCount();


    } catch (error) {

        console.error(
            "Failed to load cart:",
            error
        );

    }

}

/* =========================================================
   RENDER CART
   ========================================================= */

function renderCart() {

    if (cart.length === 0) {

        showEmptyCart();

        return;

    }


    cartSection.hidden = false;

    emptyCartSection.hidden = true;


    cartItemsContainer.innerHTML =
        cart.map(createCartItem).join("");


    updateCartSummary();

    attachCartEvents();

}


/* =========================================================
   CREATE CART ITEM
   ========================================================= */

function createCartItem(item) {

    const price =
        Number(item.price);

    const quantity =
        Number(item.quantity);


    return `
        <article
            class="rr-cart-item"
            data-cart-item-id="${item.id}"
        >

            <div class="rr-cart-item-image">

                <img
                    src="${item.image}"
                    alt="${item.name}"
                >

            </div>


            <div class="rr-cart-item-details">

                <span class="rr-cart-item-category">
                    ${item.category || ""}
                </span>

                <h3>
                    ${item.name}
                </h3>

                <span class="rr-cart-item-price">
                    ৳${price.toLocaleString()}
                </span>

            </div>


            <div class="rr-cart-item-actions">

                <div class="rr-cart-quantity">

                    <button
                        type="button"
                        class="cart-decrease"
                        aria-label="Decrease quantity"
                    >
                        <i class="bi bi-dash"></i>
                    </button>

                    <span>
                        ${quantity}
                    </span>

                    <button
                        type="button"
                        class="cart-increase"
                        aria-label="Increase quantity"
                    >
                        <i class="bi bi-plus"></i>
                    </button>

                </div>


                <button
                    type="button"
                    class="rr-cart-remove"
                >
                    <i class="bi bi-trash3"></i>
                    Remove
                </button>

            </div>

        </article>
    `;

}


/* =========================================================
   ATTACH CART EVENTS
   ========================================================= */

function attachCartEvents() {

    const cartItems =
        document.querySelectorAll(".rr-cart-item");


    cartItems.forEach((itemElement) => {

        const cartItemId =
            Number(
                itemElement.dataset.cartItemId
            );


        const decreaseButton =
            itemElement.querySelector(
                ".cart-decrease"
            );


        const increaseButton =
            itemElement.querySelector(
                ".cart-increase"
            );


        const removeButton =
            itemElement.querySelector(
                ".rr-cart-remove"
            );


        const quantityElement =
            itemElement.querySelector(
                ".rr-cart-quantity span"
            );


        decreaseButton.addEventListener(
            "click",
            async () => {

                const currentQuantity =
                    Number(
                        quantityElement.textContent
                    );


                if (currentQuantity <= 1) {

                    return;

                }


                await updateCartItem(
                    cartItemId,
                    currentQuantity - 1
                );

            }
        );


        increaseButton.addEventListener(
            "click",
            async () => {

                const currentQuantity =
                    Number(
                        quantityElement.textContent
                    );


                await updateCartItem(
                    cartItemId,
                    currentQuantity + 1
                );

            }
        );


        removeButton.addEventListener(
            "click",
            async () => {

                await removeCartItem(
                    cartItemId
                );

            }
        );

    });

}


/* =========================================================
   UPDATE CART ITEM
   ========================================================= */

async function updateCartItem(
    cartItemId,
    quantity
) {

    try {

        const response =
            await fetch(
                `/api/cart/items/${cartItemId}`,
                {

                    method: "PUT",

                    headers: {

                        "Content-Type":
                            "application/json",

                        "Authorization":
                            `Bearer ${token}`

                    },

                    body: JSON.stringify({

                        quantity

                    })

                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            alert(
                data.message ||
                "Failed to update cart."
            );

            return;

        }


        await loadCart();


    } catch (error) {

        console.error(
            "Failed to update cart item:",
            error
        );

    }

}


/* =========================================================
   REMOVE CART ITEM
   ========================================================= */

async function removeCartItem(
    cartItemId
) {

    try {

        const response =
            await fetch(
                `/api/cart/items/${cartItemId}`,
                {

                    method: "DELETE",

                    headers: {

                        "Authorization":
                            `Bearer ${token}`

                    }

                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            alert(
                data.message ||
                "Failed to remove item."
            );

            return;

        }


        await loadCart();


    } catch (error) {

        console.error(
            "Failed to remove cart item:",
            error
        );

    }

}


/* =========================================================
   UPDATE CART SUMMARY
   ========================================================= */

function updateCartSummary() {

    let subtotal = 0;

    let totalQuantity = 0;


    cart.forEach((item) => {

        const price =
            Number(item.price);

        const quantity =
            Number(item.quantity);


        subtotal +=
            price * quantity;


        totalQuantity +=
            quantity;

    });


    const delivery =
        subtotal > 0
            ? 100
            : 0;


    const total =
        subtotal + delivery;


    cartItemCount.textContent =
        `${totalQuantity} ${
            totalQuantity === 1
                ? "Item"
                : "Items"
        }`;


    cartSubtotal.textContent =
        `৳${subtotal.toLocaleString()}`;


    cartDelivery.textContent =
        `৳${delivery.toLocaleString()}`;


    cartTotal.textContent =
        `৳${total.toLocaleString()}`;

}


/* =========================================================
   EMPTY CART
   ========================================================= */

function showEmptyCart() {

    cart = [];


    cartSection.hidden = true;

    emptyCartSection.hidden = false;


    cartItemsContainer.innerHTML = "";


    cartItemCount.textContent =
        "0 Items";


    cartSubtotal.textContent =
        "৳0";


    cartDelivery.textContent =
        "৳0";


    cartTotal.textContent =
        "৳0";

}


/* =========================================================
   CHECKOUT
   ========================================================= */

checkoutButton.addEventListener(
    "click",
    () => {

        if (cart.length === 0) {

            return;

        }


        window.location.href =
            "/checkout";

    }
);


/* =========================================================
   START
   ========================================================= */

loadCart();

