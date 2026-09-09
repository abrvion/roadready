// Checkout page logic.

import "../components/header.js";
import "../components/footer.js";

import {
    showNotification
} from "../utils/notification.js";


/* =========================================================
   ELEMENTS
   ========================================================= */

const checkoutLayout =
    document.getElementById(
        "checkout-layout"
    );

const checkoutLoading =
    document.getElementById(
        "checkout-loading"
    );

const checkoutAddresses =
    document.getElementById(
        "checkout-addresses"
    );

const addressEmpty =
    document.getElementById(
        "address-empty"
    );

const fullNameInput =
    document.getElementById(
        "full-name"
    );

const phoneInput =
    document.getElementById(
        "phone"
    );

const emailInput =
    document.getElementById(
        "email"
    );

const checkoutItems =
    document.getElementById(
        "checkout-items"
    );

const checkoutSubtotal =
    document.getElementById(
        "checkout-subtotal"
    );

const checkoutDelivery =
    document.getElementById(
        "checkout-delivery-price"
    );

const checkoutTotal =
    document.getElementById(
        "checkout-total"
    );

const placeOrderButton =
    document.getElementById(
        "place-order"
    );

const checkoutError =
    document.getElementById(
        "checkout-error"
    );


/* =========================================================
   CONSTANTS
   ========================================================= */

const STANDARD_DELIVERY_FEE = 100;


/* =========================================================
   STATE
   ========================================================= */

const token =
    localStorage.getItem("token");

let cart = [];
let addresses = [];
let selectedAddressId = null;
let isPlacingOrder = false;


/* =========================================================
   INITIALIZE CHECKOUT
   ========================================================= */

async function initializeCheckout() {

    if (!token) {

        window.location.href =
            "/login";

        return;
    }

    try {

        const cartLoaded =
            await loadCart();

        if (!cartLoaded) {
            return;
        }

        await loadAddresses();

        renderCheckout();

        checkoutLoading.hidden = true;
        checkoutLayout.hidden = false;

    } catch (error) {

        console.error(
            "Failed to initialize checkout:",
            error
        );

        checkoutLoading.hidden = true;

        showCheckoutError(
            error.message ||
            "Failed to load checkout."
        );
    }
}


/* =========================================================
   LOAD CART
   ========================================================= */

async function loadCart() {

    const response =
        await fetch(
            "/api/cart",
            {
                method: "GET",
                headers: {
                    Authorization:
                        `Bearer ${token}`
                }
            }
        );

    const data =
        await response.json();

    if (!response.ok) {

        throw new Error(
            data.message ||
            "Failed to load cart."
        );
    }

    cart =
        data.cart || [];


    /*
     * Checkout cannot continue
     * without products.
     */

    if (cart.length === 0) {

        window.location.href =
            "/cart";

        return false;
    }

    return true;
}


/* =========================================================
   LOAD ADDRESSES
   ========================================================= */

async function loadAddresses() {

    const response =
        await fetch(
            "/api/addresses",
            {
                method: "GET",
                headers: {
                    Authorization:
                        `Bearer ${token}`
                }
            }
        );

    const data =
        await response.json();

    if (!response.ok) {

        throw new Error(
            data.message ||
            "Failed to load addresses."
        );
    }

    addresses =
        data.addresses || [];


    /*
     * Select the user's default address.
     *
     * If there is no default address,
     * use the first saved address.
     */

    const defaultAddress =
        addresses.find(
            (address) =>
                address.is_default === true
        );

    if (defaultAddress) {

        selectedAddressId =
            defaultAddress.id;

    } else if (addresses.length > 0) {

        selectedAddressId =
            addresses[0].id;

    }
}


/* =========================================================
   RENDER CHECKOUT
   ========================================================= */

function renderCheckout() {

    renderAddresses();

    renderContactInformation();

    renderItems();

    renderSummary();

}


/* =========================================================
   RENDER ADDRESSES
   ========================================================= */

function renderAddresses() {

    if (addresses.length === 0) {

        checkoutAddresses.innerHTML = "";

        addressEmpty.hidden = false;

        placeOrderButton.disabled = true;

        return;
    }

    addressEmpty.hidden = true;

    checkoutAddresses.innerHTML =
        addresses
            .map(createAddressCard)
            .join("");

}


/* =========================================================
   CREATE ADDRESS CARD
   ========================================================= */

function createAddressCard(address) {

    const selected =
        Number(address.id) ===
        Number(selectedAddressId);

    const label =
        address.label || "Address";

    const icon =
        label.toLowerCase() === "home"
            ? "bi-house"
            : "bi-geo-alt";

    return `
        <label
            class="
                rr-checkout-address
                ${
                    selected
                        ? "rr-checkout-address-selected"
                        : ""
                }
            "
        >

            <input
                type="radio"
                name="checkoutAddress"
                value="${address.id}"
                ${
                    selected
                        ? "checked"
                        : ""
                }
            >

            <span class="rr-radio-custom"></span>

            <span class="rr-checkout-address-icon">
                <i class="bi ${icon}"></i>
            </span>

            <span class="rr-checkout-address-content">

                <span class="rr-checkout-address-title">

                    <strong>
                        ${label}
                    </strong>

                    ${
                        address.is_default
                            ? `
                                <span class="rr-default-badge">
                                    Default
                                </span>
                            `
                            : ""
                    }

                </span>

                <strong>
                    ${address.name}
                </strong>

                <span>
                    ${address.address_line}
                </span>

                <span>
                    ${address.city}
                    ${
                        address.postal_code
                            ? `, ${address.postal_code}`
                            : ""
                    }
                </span>

                <span>
                    ${address.phone}
                </span>

            </span>

        </label>
    `;
}


/* =========================================================
   ADDRESS SELECTION
   ========================================================= */

checkoutAddresses.addEventListener(
    "change",
    (event) => {

        if (
            event.target.name !==
            "checkoutAddress"
        ) {
            return;
        }

        selectedAddressId =
            Number(
                event.target.value
            );

        renderAddresses();

        renderContactInformation();

        hideCheckoutError();
    }
);


/* =========================================================
   RENDER CONTACT INFORMATION
   ========================================================= */

function renderContactInformation() {

    const address =
        addresses.find(
            (item) =>
                Number(item.id) ===
                Number(selectedAddressId)
        );

    if (!address) {

        fullNameInput.value = "";
        phoneInput.value = "";

        return;
    }

    fullNameInput.value =
        address.name || "";

    phoneInput.value =
        address.phone || "";

}


/* =========================================================
   RENDER CART ITEMS
   ========================================================= */

function renderItems() {

    checkoutItems.innerHTML =
        cart
            .map(createCheckoutItem)
            .join("");

}


/* =========================================================
   CREATE CHECKOUT ITEM
   ========================================================= */

function createCheckoutItem(item) {

    const price =
        Number(item.price);

    const quantity =
        Number(item.quantity);

    const itemTotal =
        price * quantity;

    return `
        <div class="rr-checkout-item">

            <div class="rr-checkout-item-image">

                <img
                    src="${item.image}"
                    alt="${item.name}"
                >

                <span>
                    ${quantity}
                </span>

            </div>

            <div class="rr-checkout-item-info">

                <strong>
                    ${item.name}
                </strong>

                <span>
                    ${item.category || ""}
                </span>

            </div>

            <strong class="rr-checkout-item-price">
                ৳${itemTotal.toLocaleString()}
            </strong>

        </div>
    `;
}


/* =========================================================
   RENDER SUMMARY
   ========================================================= */

function renderSummary() {

    let subtotal = 0;


    cart.forEach(
        (item) => {

            const price =
                Number(item.price);

            const quantity =
                Number(item.quantity);

            subtotal +=
                price * quantity;

        }
    );


    const delivery =
        subtotal > 0
            ? STANDARD_DELIVERY_FEE
            : 0;


    const total =
        subtotal + delivery;


    checkoutSubtotal.textContent =
        `৳${subtotal.toLocaleString()}`;


    checkoutDelivery.textContent =
        `৳${delivery.toLocaleString()}`;


    checkoutTotal.textContent =
        `৳${total.toLocaleString()}`;

}


/* =========================================================
   PLACE ORDER
   ========================================================= */

placeOrderButton.addEventListener(
    "click",
    async () => {

        if (isPlacingOrder) {
            return;
        }


        if (!selectedAddressId) {

            showCheckoutError(
                "Please select a delivery address."
            );

            return;
        }


        const paymentMethod =
            document.querySelector(
                'input[name="payment"]:checked'
            );


        if (
            !paymentMethod ||
            paymentMethod.value !== "cod"
        ) {

            showCheckoutError(
                "Please select Cash on Delivery."
            );

            return;
        }


        await createOrder();

    }
);


/* =========================================================
   CREATE ORDER
   ========================================================= */

async function createOrder() {

    isPlacingOrder = true;

    hideCheckoutError();

    placeOrderButton.disabled = true;

    placeOrderButton.innerHTML = `
        Placing Order
        <i class="bi bi-arrow-repeat"></i>
    `;


    try {

        /*
         * We only send addressId.
         *
         * The backend is responsible for:
         *
         * - reading the cart
         * - checking stock
         * - calculating the total
         * - creating the order
         * - creating order items
         * - reducing stock
         * - clearing the cart
         */

        const response =
            await fetch(
                "/api/orders",
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
                            addressId:
                                selectedAddressId
                        })
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to place order."
            );
        }


        if (
            !data.order ||
            !data.order.id
        ) {

            throw new Error(
                "Order was created but no order ID was returned."
            );
        }


        showNotification(
            "Order placed successfully"
        );


        /*
         * The backend already cleared
         * the cart.
         *
         * Now take the customer to
         * their order.
         */

        window.location.href =
     `/order-confirmation/${data.order.id}`;

    } catch (error) {

        console.error(
            "Failed to place order:",
            error
        );


        showCheckoutError(
            error.message ||
            "Failed to place your order."
        );


        isPlacingOrder = false;

        placeOrderButton.disabled = false;

        placeOrderButton.innerHTML = `
            Place Order
            <i class="bi bi-arrow-right"></i>
        `;
    }
}


/* =========================================================
   ERROR HANDLING
   ========================================================= */

function showCheckoutError(message) {

    checkoutError.textContent =
        message;

    checkoutError.hidden = false;

}


function hideCheckoutError() {

    checkoutError.textContent = "";

    checkoutError.hidden = true;

}


/* =========================================================
   INITIAL STATE
   ========================================================= */

checkoutLayout.hidden = true;

initializeCheckout();