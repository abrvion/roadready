
import "../components/header.js";
import "../components/footer.js";


/* =====================================================
   GET ORDER ID
   ===================================================== */

const urlParams =
    new URLSearchParams(window.location.search);

const pathMatch = window.location.pathname.match(/^\/account\/order\/(\d+)/);
const orderId = pathMatch?.[1] || urlParams.get("id");


/* =====================================================
   ELEMENTS
   ===================================================== */

const orderHeader =
    document.getElementById("order-title");

const orderDate =
    document.getElementById("order-date");

const orderStatus =
    document.getElementById("order-status");

const orderItemsContainer =
    document.getElementById("order-items");

const orderItemCount =
    document.getElementById("order-item-count");

const orderTimeline =
    document.getElementById("order-timeline");

const orderAddress =
    document.getElementById("order-address");

const orderSummary =
    document.getElementById("order-summary-lines");

const orderTotal =
    document.getElementById("order-total");

const orderPaymentStatus =
    document.getElementById("order-payment-status");


/* =====================================================
   FORMAT DATE
   ===================================================== */

const formatDate = (date) => {

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
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }
    );

};


/* =====================================================
   FORMAT STATUS
   ===================================================== */

const formatStatus = (status) => {

    if (status === "pending") {
        return "Processing";
    }

    return String(status || "")
        .replace(/_/g, " ")
        .replace(/\b\w/g, (letter) =>
            letter.toUpperCase()
        );

};


/* =====================================================
   GET STATUS CLASS
   ===================================================== */

const getStatusClass = (status) => {

    if (status === "pending") {
        return "rr-order-status-processing";
    }

    const normalizedStatus =
        String(status || "")
            .toLowerCase()
            .replace(/\s+/g, "-")
            .replace(/_/g, "-");

    return `rr-order-status-${normalizedStatus}`;

};


/* =====================================================
   UPDATE ORDER HEADER
   ===================================================== */

const renderOrderHeader = (order) => {

    if (orderHeader) {

        orderHeader.textContent =
            `Order #${order.orderNumber || order.order_number || `RR-${String(order.id).padStart(6, "0")}`}`;

    }


    if (orderDate) {

        orderDate.textContent =
            `Placed on ${formatDate(order.createdAt)}`;

    }


    if (orderStatus) {

        const status =
            formatStatus(order.status);

        orderStatus.textContent =
            status;

        orderStatus.className =
            `rr-order-status ${getStatusClass(order.status)}`;

    }

};


/* =====================================================
   RENDER ORDER ITEMS
   ===================================================== */

const renderOrderItems = (items) => {

    if (!orderItemsContainer) {
        return;
    }


    orderItemsContainer.innerHTML = "";


    if (orderItemCount) {

        orderItemCount.textContent =
            `${items.length} ${
                items.length === 1
                    ? "Item"
                    : "Items"
            }`;

    }


    items.forEach((item) => {

        const orderItem =
            document.createElement("div");

        orderItem.className =
            "rr-order-item";


        const itemTotal =
            Number(item.price) *
            Number(item.quantity);


        orderItem.innerHTML = `

            <div class="rr-order-item-image">

                ${
                    item.image
                        ? `
                            <img
                                src="${item.image}"
                                alt="${item.name}"
                                style="
                                    width: 100%;
                                    height: 100%;
                                    object-fit: cover;
                                    border-radius: 8px;
                                "
                            >
                        `
                        : `
                            <i class="bi bi-image"></i>
                        `
                }

            </div>


            <div class="rr-order-item-info">

                <h3>
                    ${item.name}
                </h3>

                <p>
                    Quantity: ${item.quantity}
                </p>

            </div>


            <strong class="rr-order-item-price">
                ৳${formatPrice(itemTotal)}
            </strong>

        `;


        orderItemsContainer.appendChild(
            orderItem
        );

    });

};


/* =====================================================
   RENDER ORDER SUMMARY
   ===================================================== */

const renderSummary = (order) => {

    const total =
        Number(order.total);


    if (orderSummary) {

        orderSummary.innerHTML = `

            <div>

                <span>
                    Order Total
                </span>

                <strong>
                    ৳${formatPrice(total)}
                </strong>

            </div>

        `;

    }


    if (orderTotal) {

        orderTotal.textContent =
            `৳${formatPrice(total)}`;

    }

};


/* =====================================================
   RENDER PAYMENT STATUS
   ===================================================== */

const renderPaymentStatus = (order) => {

    if (!orderPaymentStatus) {
        return;
    }


    const paymentStatus =
        String(order.paymentStatus || "pending");


    orderPaymentStatus.textContent =
        paymentStatus
            .replace(/_/g, " ")
            .replace(/\b\w/g, (letter) =>
                letter.toUpperCase()
            );

};


/* =====================================================
   RENDER SHIPPING ADDRESS
   ===================================================== */

const renderOrderAddress = (order) => {

    if (!orderAddress) {
        return;
    }


    if (!order.shippingName) {

        orderAddress.innerHTML = `

            <p>
                No shipping address available.
            </p>

        `;

        return;

    }


    orderAddress.innerHTML = `

        <div class="rr-order-address-content">

            <p>
                ${order.shippingName}
            </p>


            <p>
                ${order.shippingPhone}
            </p>


            <p>
                ${order.shippingAddressLine}
            </p>


            <p>
                ${order.shippingCity}
                ${
                    order.shippingPostalCode
                        ? `, ${order.shippingPostalCode}`
                        : ""
                }
            </p>

        </div>

    `;

};


/* =====================================================
   RENDER ORDER TIMELINE
   ===================================================== */

const renderTimeline = (order) => {

    if (!orderTimeline) {
        return;
    }


    const currentStatus =
        order.status === "pending"
            ? "processing"
            : order.status;


    const statuses = [
        {
            key: "processing",
            title: "Order Processing",
            description:
                "Your order has been received and is being processed."
        },
        {
            key: "shipped",
            title: "Order Shipped",
            description:
                "Your order has been handed over for delivery."
        },
        {
            key: "delivered",
            title: "Order Delivered",
            description:
                "Your order has been delivered."
        }
    ];


    const statusOrder = [
        "processing",
        "shipped",
        "delivered"
    ];


    const currentIndex =
        statusOrder.indexOf(currentStatus);


    orderTimeline.innerHTML = "";


    /* -------------------------------------------------
       Cancelled Order
       ------------------------------------------------- */

    if (currentStatus === "cancelled") {

        orderTimeline.innerHTML = `

            <div class="rr-order-timeline-item active">

                <div class="rr-order-timeline-icon">

                    <i class="bi bi-x-lg"></i>

                </div>

                <div>

                    <strong>
                        Order Cancelled
                    </strong>

                    <span>
                        This order has been cancelled.
                    </span>

                </div>

            </div>

        `;

        return;

    }


    /* -------------------------------------------------
       Normal Order Progress
       ------------------------------------------------- */

    statuses.forEach((status, index) => {

        const item =
            document.createElement("div");

        item.className =
            "rr-order-timeline-item";


        if (
            currentIndex !== -1 &&
            index <= currentIndex
        ) {

            item.classList.add("active");

        }


        item.innerHTML = `

            <div class="rr-order-timeline-icon">

                ${
                    index === 0
                        ? `<i class="bi bi-box-seam"></i>`
                        : index === 1
                            ? `<i class="bi bi-truck"></i>`
                            : `<i class="bi bi-check-lg"></i>`
                }

            </div>


            <div>

                <strong>
                    ${status.title}
                </strong>

                <span>
                    ${status.description}
                </span>

            </div>

        `;


        orderTimeline.appendChild(
            item
        );

    });

};


/* =====================================================
   LOAD ORDER
   ===================================================== */

const loadOrder = async () => {

    if (!orderId) {

        console.error(
            "No order ID supplied."
        );

        if (error.message === "Authentication required" || error.message === "Invalid or expired token") {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            fetch("/api/auth/logout", { method: "POST", credentials: "same-origin" }).catch(() => {});
            window.location.href = `/login?next=${encodeURIComponent(window.location.pathname)}`;
            return;
        }
        window.location.href = "/account/orders";

        return;

    }


    const token =
        localStorage.getItem("token");


    if (!token) {

        window.location.href =
            "/login";

        return;

    }


    try {

        /* ---------------------------------------------
           Get the order
           --------------------------------------------- */

        const response =
            await fetch(
                `/api/orders/${orderId}`,
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
                "Failed to load order"
            );

        }


        const order =
            data.order;


        if (!order) {

            throw new Error(
                "Order data was not returned"
            );

        }


        /* ---------------------------------------------
           Render order information
           --------------------------------------------- */

        renderOrderHeader(
            order
        );


        renderOrderItems(
            order.items || []
        );


        renderSummary(
            order
        );


        renderPaymentStatus(
            order
        );


        renderTimeline(
            order
        );


        /* ---------------------------------------------
           Render historical shipping snapshot
           --------------------------------------------- */

        renderOrderAddress(
            order
        );


    } catch (error) {

        console.error(
            "Failed to load order details:",
            error
        );

        window.location.href =
            "/account/orders";

    }

};


/* =====================================================
   START
   ===================================================== */

loadOrder();

