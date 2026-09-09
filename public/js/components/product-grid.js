// Product grid component logic.

import {
    createProductCard,
    attachProductCardEvents
} from "./product-card.js";


export function createProductGrid(products) {

    return `
        <div class="rr-product-grid">

            ${products
                .map(product => createProductCard(product))
                .join("")}

        </div>
    `;
}


export function initializeProductGrid(
    container
) {

    attachProductCardEvents(
        container
    );

}