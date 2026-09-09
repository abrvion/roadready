// Order business logic.

import pool from "../config/database.js";

import { createOrder } from "../models/Order.js";
import { createOrderItem } from "../models/OrderItem.js";


export const createOrderFromCart = async (
    userId,
    addressId
) => {

    const client =
        await pool.connect();


    try {

        await client.query("BEGIN");


        // Get the selected address and make sure it belongs to the user.

        const addressResult =
            await client.query(
                `
                SELECT
                    id,
                    name,
                    phone,
                    address_line,
                    city,
                    postal_code
                FROM addresses
                WHERE id = $1
                    AND user_id = $2;
                `,
                [
                    addressId,
                    userId
                ]
            );


        if (
            addressResult.rows.length === 0
        ) {

            throw new Error(
                "Address not found"
            );

        }


        const address =
            addressResult.rows[0];


        // Get the user's cart and products.

        const cartResult =
            await client.query(
                `
                SELECT
                    carts.id AS cart_id,
                    cart_items.product_id,
                    cart_items.quantity,
                    products.name,
                    products.price,
                    products.stock
                FROM carts
                JOIN cart_items
                    ON carts.id = cart_items.cart_id
                JOIN products
                    ON cart_items.product_id = products.id
                WHERE carts.user_id = $1
                    AND products.status = 'active'
                FOR UPDATE OF products;
                `,
                [userId]
            );


        if (
            cartResult.rows.length === 0
        ) {

            throw new Error(
                "Cart is empty"
            );

        }


        const cartItems =
            cartResult.rows;


        // Check stock and calculate subtotal.

        let subtotal = 0;


        for (
            const item of cartItems
        ) {

            if (
                item.quantity > item.stock
            ) {

                throw new Error(
                    `Not enough stock for ${item.name}`
                );

            }


            subtotal +=
                Number(item.price) *
                item.quantity;

        }


        // Standard delivery fee.

        const deliveryFee =
            subtotal > 0
                ? 100
                : 0;


        // Final order total.

        const total =
            subtotal + deliveryFee;


        // Create the order with a snapshot
        // of the shipping address.

        const order =
            await createOrder(
                client,
                userId,
                addressId,
                total.toFixed(2),
                address.name,
                address.phone,
                address.address_line,
                address.city,
                address.postal_code
            );

        await client.query(
            `UPDATE orders
             SET order_number = $1
             WHERE id = $2;`,
            [order.order_number, order.id]
        );


        // Create order items and reduce stock.

        for (
            const item of cartItems
        ) {

            await createOrderItem(
                client,
                order.id,
                item.product_id,
                item.quantity,
                item.price
            );


            await client.query(
                `
                UPDATE products
                SET stock = stock - $1
                WHERE id = $2;
                `,
                [
                    item.quantity,
                    item.product_id
                ]
            );

        }


        // Clear the cart.

        await client.query(
            `
            DELETE FROM cart_items
            WHERE cart_id = $1;
            `,
            [
                cartItems[0].cart_id
            ]
        );


        await client.query("COMMIT");


        return {

            order,

            items:
                cartItems.map(
                    (item) => ({
                        productId:
                            item.product_id,

                        name:
                            item.name,

                        quantity:
                            item.quantity,

                        price:
                            item.price
                    })
                )

        };


    } catch (error) {

        await client.query(
            "ROLLBACK"
        );

        throw error;


    } finally {

        client.release();

    }

};