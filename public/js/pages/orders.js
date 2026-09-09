// My Orders page entry point

import "../components/header.js";
import "../components/footer.js";


/* =====================================================
   ELEMENTS
   ===================================================== */

const orderStatusFilter =
    document.getElementById("order-status-filter");

const ordersList =
    document.getElementById("orders-list");

const emptyState =
    document.querySelector(".rr-account-empty");


/* =====================================================
   AUTHENTICATION
   ===================================================== */

const token =
    localStorage.getItem("token");


if (!token) {

    window.location.href =
        "/login";

}


/* =====================================================
   STATE
   ===================================================== */

let orders = [];


/* =====================================================
   FORMAT DATE
   ===================================================== */

const formatOrderDate = (date) => {

    return new Date(date).toLocaleDateString(
        "en-US",
        {
            year: "numeric",
            month: "long",
            day: "numeric"
        }
    );

};


/* =====================================================
   FORMAT PRICE
   ===================================================== */

const formatPrice = (amount) => {

    return Number(amount).toLocaleString(
        "en-BD",
        {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        }
    );

};


/* =====================================================
   FORMAT STATUS
   ===================================================== */

const formatStatus = (status) => {

    if (!status) {
        return "Unknown";
    }

    return status
        .charAt(0)
        .toUpperCase() +
        status.slice(1);

};


/* =====================================================
   GET STATUS CLASS
   ===================================================== */

const getStatusClass = (status) => {

    const normalizedStatus =
        String(status)
            .toLowerCase();

    return `
        rr-order-status
        rr-order-status-${normalizedStatus}
    `;

};


/* =====================================================
   LOAD ORDERS
   ===================================================== */

const loadOrders = async () => {

    try {

        const response =
            await fetch(
                "/api/orders",
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
                "Failed to load orders"
            );

        }


        orders =
            data.orders || [];


        renderOrders(orders);


    } catch (error) {

        console.error(
            "Failed to load orders:",
            error
        );


        /*
         * If the JWT has expired or is invalid,
         * remove the authentication data and
         * send the user back to login.
         */

        if (
            error.message ===
            "Authentication required"
        ) {

            fetch("/api/auth/logout", { method: "POST", credentials: "same-origin" }).catch(() => {});
            localStorage.removeItem("token");
            localStorage.removeItem("user");

            window.location.href =
                "/login";

            return;

        }


        /*
         * For other errors, show the empty state
         * rather than leaving the demo order visible.
         */

        renderEmptyState();

    }

};


/* =====================================================
   RENDER ORDERS
   ===================================================== */

const renderOrders = (
    ordersToRender
) => {

    /*
     * Remove any existing static/demo orders.
     */

    ordersList.innerHTML = "";


    /*
     * No orders.
     */

    if (ordersToRender.length === 0) {

        renderEmptyState();

        return;

    }


    /*
     * We have real orders.
     */

    if (emptyState) {

        emptyState.style.display =
            "none";

    }


    ordersToRender.forEach(
        (order) => {

            const orderCard =
                document.createElement("article");


            orderCard.className =
                "rr-order-card";


            /*
             * The order model currently returns
             * order totals and metadata, but not
             * order items.
             *
             * We therefore don't guess the item
             * count here.
             *
             * We'll get the real item count when
             * we connect order details.
             */

            orderCard.innerHTML = `

                <div class="rr-order-card-main">

                    <div class="rr-order-card-icon">

                        <i class="bi bi-box-seam"></i>

                    </div>


                    <div class="rr-order-card-info">

                        <span class="rr-order-card-label">
                            ORDER
                        </span>

                        <h3>
                            ${order.order_number || `RR-${String(order.id).padStart(6, "0")}`}
                        </h3>

                        <p>
                            ${formatOrderDate(
                                order.created_at
                            )}
                        </p>

                    </div>

                </div>


                <div class="rr-order-card-status">

                    <span class="${getStatusClass(
                        order.status
                    )}">
                        ${formatStatus(
                            order.status
                        )}
                    </span>

                    <strong>
                        ৳${formatPrice(
                            order.total
                        )}
                    </strong>

                </div>


                <a
                    href="/account/order/${order.id}"
                    class="rr-order-card-details"
                >
                    View Details
                    <i class="bi bi-arrow-right"></i>
                </a>

            `;


            ordersList.appendChild(
                orderCard
            );

        }
    );

};


/* =====================================================
   EMPTY STATE
   ===================================================== */

const renderEmptyState = () => {

    ordersList.innerHTML = "";


    if (emptyState) {

        emptyState.style.display =
            "";

    }

};


/* =====================================================
   FILTER ORDERS
   ===================================================== */

if (orderStatusFilter) {

    orderStatusFilter.addEventListener(
        "change",
        () => {

            const selectedStatus =
                orderStatusFilter.value;


            if (
                selectedStatus === "all"
            ) {

                renderOrders(orders);

                return;

            }


            const filteredOrders =
                orders.filter(
                    (order) =>
                        String(
                            order.status
                        ).toLowerCase() ===
                        selectedStatus.toLowerCase()
                );


            renderOrders(
                filteredOrders
            );

        }
    );

}


/* =====================================================
   INITIALIZE
   ===================================================== */

if (token) {

    loadOrders();

}