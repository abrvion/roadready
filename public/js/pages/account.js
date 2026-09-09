
import "../components/header.js";
import "../components/footer.js";
import { getToken, clearAuth, authHeaders } from "../utils/auth.js";


/* =====================================================
   ELEMENTS
   ===================================================== */

const userNameElement =
    document.getElementById("account-user-name");

const userEmailElement =
    document.getElementById("account-user-email");

const logoutButton =
    document.getElementById("account-logout");

const recentOrdersSection =
    document.querySelector(".rr-account-section");


/* =====================================================
   AUTHENTICATION
   ===================================================== */

const token = getToken();


if (!token) {

    window.location.href =
        "/login";

}


/* =====================================================
   LOAD STORED USER
   ===================================================== */

const storedUser =
    JSON.parse(
        localStorage.getItem("user")
    );


if (storedUser) {

    if (userNameElement) {

        userNameElement.textContent =
            storedUser.name ||
            "RoadReady Rider";

    }


    if (userEmailElement) {

        userEmailElement.textContent =
            storedUser.email ||
            "";

    }

}


/* =====================================================
   LOGOUT
   ===================================================== */

if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        () => {

            fetch("/api/auth/logout", { method: "POST", credentials: "same-origin" }).catch(() => {});
            localStorage.removeItem("token");
            localStorage.removeItem("user");

            window.location.href =
                "/login";

        }
    );

}


/* =====================================================
   FORMAT DATE
   ===================================================== */

const formatOrderDate = (date) => {

    return new Date(date).toLocaleDateString(
        "en-US",
        {
            year: "numeric",
            month: "short",
            day: "numeric"
        }
    );

};


/* =====================================================
   FORMAT CURRENCY
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
   STATUS CLASS
   ===================================================== */

const getStatusClass = (status) => {

    const normalizedStatus =
        String(status || "")
            .toLowerCase()
            .replace(/\s+/g, "-");

    /*
     * Your current database uses "pending".
     * The existing design uses "processing".
     * Treat pending orders visually as processing.
     */

    if (normalizedStatus === "pending") {

        return "rr-order-status-processing";

    }

    return `rr-order-status-${normalizedStatus}`;

};


/* =====================================================
   UPDATE ORDER COUNT
   ===================================================== */

const updateStatCount = (href, count) => {
    const stat = document.querySelector(`.rr-account-stat[href="${href}"]`);
    const countElement = stat?.querySelector("strong");
    if (countElement) countElement.textContent = Number(count) || 0;
};

const updateOrderCount = (orderCount) => {

    const ordersStat =
        document.querySelector(
            '.rr-account-stat[href="/account/orders"]'
        );


    if (!ordersStat) {
        return;
    }


    const countElement =
        ordersStat.querySelector("strong");


    if (countElement) {

        countElement.textContent =
            orderCount;

    }

};


/* =====================================================
   RENDER RECENT ORDERS
   ===================================================== */

const renderRecentOrders = (orders) => {

    if (!recentOrdersSection) {
        return;
    }


    const emptyState =
        recentOrdersSection.querySelector(
            ".rr-account-empty"
        );


    /*
     * Remove an old dynamically-created list
     * if the function is ever called again.
     */

    const existingList =
        recentOrdersSection.querySelector(
            ".rr-orders-list"
        );


    if (existingList) {

        existingList.remove();

    }


    /*
     * No orders.
     *
     * Keep the existing empty state.
     */

    if (orders.length === 0) {

        return;

    }


    /*
     * Hide the empty state.
     */

    if (emptyState) {

        emptyState.remove();

    }


    /*
     * Dashboard only shows the latest 3 orders.
     */

    const recentOrders =
        orders.slice(0, 3);


    /*
     * Reuse the same order-card structure
     * used by the My Orders page.
     */

    const orderList =
        document.createElement("div");

    orderList.className =
        "rr-orders-list";


    recentOrders.forEach((order) => {

        const orderElement =
            document.createElement("article");

        orderElement.className =
            "rr-order-card";


        const statusText =
            order.status === "pending"
                ? "Processing"
                : order.status;


        orderElement.innerHTML = `

            <div class="rr-order-card-main">

                <div class="rr-order-card-icon">
                    <i class="bi bi-box-seam"></i>
                </div>


                <div class="rr-order-card-info">

                    <span class="rr-order-card-label">
                        ORDER #${order.order_number || `RR-${String(order.id).padStart(6, "0")}`}
                    </span>

                    <h3>
                        Order #${order.order_number || `RR-${String(order.id).padStart(6, "0")}`}
                    </h3>

                    <p>
                        ${formatOrderDate(order.created_at)}
                    </p>

                </div>


                <span
                    class="rr-order-status ${getStatusClass(order.status)}"
                >
                    ${statusText}
                </span>


                <strong class="rr-order-card-total">
                    ৳${formatPrice(order.total)}
                </strong>


                <a
                    href="/account/order/${order.id}"
                    class="rr-order-card-details"
                >
                    View Details
                    <i class="bi bi-arrow-right"></i>
                </a>

            </div>

        `;


        orderList.appendChild(
            orderElement
        );

    });


    /*
     * Add the list after the section header.
     */

    recentOrdersSection.appendChild(
        orderList
    );

};


/* =====================================================
   LOAD ORDERS
   ===================================================== */

const loadOrders = async () => {

    const response =
        await fetch(
            "/api/orders",
            {
                method: "GET",
                headers: authHeaders()
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


    const orders =
        data.orders || [];


    updateOrderCount(orders.length);
    renderRecentOrders(orders);

};



const loadAccountStats = async () => {
    const [wishlistResponse, addressResponse] = await Promise.all([
        fetch("/api/wishlist", { headers: authHeaders(), credentials: "same-origin" }),
        fetch("/api/addresses", { headers: authHeaders(), credentials: "same-origin" })
    ]);
    const wishlistData = await wishlistResponse.json().catch(() => ({}));
    const addressData = await addressResponse.json().catch(() => ({}));
    if (wishlistResponse.status === 401 || addressResponse.status === 401) throw new Error("Authentication required");
    if (!wishlistResponse.ok) throw new Error(wishlistData.message || "Failed to load wishlist count");
    if (!addressResponse.ok) throw new Error(addressData.message || "Failed to load address count");
    updateStatCount("/account/wishlist", (wishlistData.items || []).length);
    updateStatCount("/account/addresses", (addressData.addresses || []).length);
};

/* =====================================================
   VERIFY TOKEN + LOAD ACCOUNT
   ===================================================== */

const initializeAccount = async () => {
    try {
        const response = await fetch("/api/auth/me", {
            method: "GET",
            credentials: "same-origin",
            headers: authHeaders()
        });

        const data = await response.json().catch(() => ({}));

        if (response.status === 401) {
            clearAuth();
            window.location.href = "/login?next=/account";
            return;
        }

        if (!response.ok) {
            throw new Error(data.message || "Unable to verify your session.");
        }

        if (data.user) {
            localStorage.setItem("user", JSON.stringify(data.user));
            if (userNameElement) userNameElement.textContent = data.user.name || "RoadReady Rider";
            if (userEmailElement) userEmailElement.textContent = data.user.email || "";
        }

        await Promise.all([
            loadOrders(),
            loadAccountStats()
        ]);
    } catch (error) {
        console.error("Account loading error:", error);
        // Do not erase a valid-looking session because of a transient 5xx/network error.
        const notice = document.createElement("div");
        notice.className = "rr-account-session-notice";
        notice.textContent = "We couldn't refresh your account data right now. Please try again.";
        recentOrdersSection?.prepend(notice);
    }
};


/* =====================================================
   START
   ===================================================== */

if (token) {

    initializeAccount();

}

