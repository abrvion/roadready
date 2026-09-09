// Order confirmation page logic.

import "../components/header.js";
import "../components/footer.js";


/* =========================================================
   ELEMENTS
   ========================================================= */

const orderLoading =
    document.getElementById(
        "order-loading"
    );

const orderError =
    document.getElementById(
        "order-error"
    );

const orderErrorMessage =
    document.getElementById(
        "order-error-message"
    );

const orderContent =
    document.getElementById(
        "order-content"
    );

const orderNumber =
    document.getElementById(
        "order-number"
    );

const orderStatus =
    document.getElementById(
        "order-status"
    );

const orderItems =
    document.getElementById(
        "order-items"
    );

const orderSubtotal =
    document.getElementById(
        "order-subtotal"
    );

const orderDelivery =
    document.getElementById(
        "order-delivery"
    );

const orderTotal =
    document.getElementById(
        "order-total"
    );

const shippingName =
    document.getElementById(
        "shipping-name"
    );

const shippingPhone =
    document.getElementById(
        "shipping-phone"
    );

const shippingAddress =
    document.getElementById(
        "shipping-address"
    );


/* =========================================================
   AUTHENTICATION
   ========================================================= */

const token =
    localStorage.getItem("token");


/* =========================================================
   GET ORDER ID FROM URL
   ========================================================= */

const urlParams =
    new URLSearchParams(
        window.location.search
    );

const orderId =
    urlParams.get("id") ||
    window.location.pathname.match(/^\/order-confirmation\/(\d+)/)?.[1];


/* =========================================================
   INITIALIZE PAGE
   ========================================================= */

async function initializeOrderConfirmation() {

    if (!token) {

        window.location.href =
            "/login";

        return;
    }


    if (!orderId) {

        showOrderError(
            "No order was specified."
        );

        return;
    }


    await loadOrder();

}


/* =========================================================
   LOAD ORDER
   ========================================================= */

async function loadOrder() {

    try {

        const response =
            await fetch(
                `/api/orders/${orderId}`,
                {
                    method: "GET",

                    headers: {
                        "Authorization":
                            `Bearer ${token}`
                    }
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to load order."
            );
        }


        if (!data.order) {

            throw new Error(
                "Order information was not found."
            );
        }


        renderOrder(
            data.order
        );


        orderLoading.hidden = true;

        orderContent.hidden = false;


    } catch (error) {

        console.error(
            "Failed to load order:",
            error
        );


        showOrderError(
            error.message ||
            "Failed to load your order."
        );

    }

}


/* =========================================================
   RENDER ORDER
   ========================================================= */

function renderOrder(order) {

    renderOrderNumber(
        (order.orderNumber || order.order_number || `RR-${String(order.id).padStart(6, "0")}`)
    );


    renderOrderStatus(
        order.status
    );


    renderOrderItems(
        order.items
    );


    renderOrderSummary(
        order
    );


    renderShippingInformation(
        order
    );

}


/* =========================================================
   ORDER NUMBER
   ========================================================= */

function renderOrderNumber(
    id
) {

    orderNumber.textContent =
        `#${id}`;

}


/* =========================================================
   ORDER STATUS
   ========================================================= */

function renderOrderStatus(
    status
) {

    if (!status) {

        orderStatus.textContent =
            "Confirmed";

        return;
    }


    const formattedStatus =
        status
            .replaceAll(
                "_",
                " "
            )
            .replace(/\b\w/g, (letter) =>
                letter.toUpperCase()
            );


    orderStatus.textContent =
        formattedStatus;

}


/* =========================================================
   ORDER ITEMS
   ========================================================= */

function renderOrderItems(
    items
) {

    if (
        !items ||
        items.length === 0
    ) {

        orderItems.innerHTML = `
            <p>
                No order items were found.
            </p>
        `;

        return;
    }


    orderItems.innerHTML =
        items
            .map(
                createOrderItem
            )
            .join("");

}


/* =========================================================
   CREATE ORDER ITEM
   ========================================================= */

function createOrderItem(
    item
) {

    const price =
        Number(item.price) || 0;

    const quantity =
        Number(item.quantity) || 0;

    const itemTotal =
        price * quantity;


    return `
        <div class="rr-order-item">

            <div class="rr-order-item-image">

                <img
                    src="${item.image || ""}"
                    alt="${item.name || "Product"}"
                >

            </div>


            <div class="rr-order-item-info">

                <strong>
                    ${item.name || "Product"}
                </strong>

                <span>
                    Qty ${quantity}
                </span>

            </div>


            <strong class="rr-order-item-price">
                ৳${itemTotal.toLocaleString()}
            </strong>

        </div>
    `;

}


/* =========================================================
   ORDER SUMMARY
   ========================================================= */

function renderOrderSummary(
    order
) {

    const total =
        Number(order.total) || 0;


    /*
     * Current RoadReady delivery fee
     * is a standard ৳100.
     */

    const delivery =
        total > 0
            ? 100
            : 0;


    const subtotal =
        total - delivery;


    orderSubtotal.textContent =
        `৳${subtotal.toLocaleString()}`;


    orderDelivery.textContent =
        `৳${delivery.toLocaleString()}`;


    orderTotal.textContent =
        `৳${total.toLocaleString()}`;

}


/* =========================================================
   SHIPPING INFORMATION
   ========================================================= */

function renderShippingInformation(
    order
) {

    shippingName.textContent =
        order.shippingName || "—";


    shippingPhone.textContent =
        order.shippingPhone || "—";


    const addressParts = [];


    if (
        order.shippingAddressLine
    ) {

        addressParts.push(
            order.shippingAddressLine
        );

    }


    if (
        order.shippingCity
    ) {

        addressParts.push(
            order.shippingCity
        );

    }


    if (
        order.shippingPostalCode
    ) {

        addressParts.push(
            order.shippingPostalCode
        );

    }


    shippingAddress.textContent =
        addressParts.length > 0
            ? addressParts.join(", ")
            : "—";

}


/* =========================================================
   ERROR HANDLING
   ========================================================= */

function showOrderError(
    message
) {

    orderLoading.hidden = true;

    orderContent.hidden = true;

    orderErrorMessage.textContent =
        message;

    orderError.hidden = false;

}


/* =========================================================
   START
   ========================================================= */

initializeOrderConfirmation();