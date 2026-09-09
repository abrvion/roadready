// Shared cart functionality.


/* =========================================================
   ADD PRODUCT TO CART
   ========================================================= */

export async function addProductToCart(
    productId,
    quantity = 1
) {

    const token =
        localStorage.getItem("token");


    if (!token) {

        alert(
            "Please login before adding products to your cart."
        );

        return {
            success: false,
            authenticated: false
        };

    }


    try {

        const response =
            await fetch("/api/cart", {

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

            });


        const data =
            await response.json();


        if (!response.ok) {

            alert(
                data.message ||
                "Failed to add product to cart."
            );

            return {
                success: false,
                authenticated: true
            };

        }


        /*
         * The product was successfully added.
         * Refresh the header cart count.
         */

        await updateCartCount();


        return {
            success: true,
            authenticated: true,
            data
        };


    } catch (error) {

        console.error(
            "Add to cart failed:",
            error
        );


        alert(
            "Something went wrong while adding the product to your cart."
        );


        return {
            success: false,
            authenticated: true
        };

    }

}


/* =========================================================
   UPDATE HEADER CART COUNT
   ========================================================= */

export async function updateCartCount() {

    const token =
        localStorage.getItem("token");


    const cartCountElement =
        document.querySelector(
            ".rr-cart-count"
        );


    /*
     * If this page doesn't have a header
     * cart count, there is nothing to update.
     */

    if (!cartCountElement) {

        return;

    }


    /*
     * User is not logged in.
     */

    if (!token) {

        cartCountElement.textContent =
            "0";

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
                "Failed to load cart count:",
                data.message
            );

            return;

        }


        const cart =
            data.cart || [];


        let totalQuantity = 0;


        cart.forEach((item) => {

            totalQuantity +=
                Number(item.quantity) || 0;

        });


        cartCountElement.textContent =
            totalQuantity;


    } catch (error) {

        console.error(
            "Failed to update cart count:",
            error
        );

    }

}