// Shop page logic.

import "../components/header.js";
import "../components/footer.js";
import {
    createProductGrid,
    initializeProductGrid
} from "../components/product-grid.js";


/* =========================================================
   ELEMENTS
   ========================================================= */

const productGrid =
    document.getElementById("shop-product-grid");

const resultsCount =
    document.getElementById("shop-results-count");

const searchInput =
    document.getElementById("shop-search");

const sortSelect =
    document.getElementById("shop-sort");

const clearFiltersButton =
    document.getElementById("clear-filters");

const emptyClearFiltersButton =
    document.getElementById("empty-clear-filters");

const emptyState =
    document.getElementById("shop-empty");

const minPriceInput =
    document.getElementById("min-price");

const maxPriceInput =
    document.getElementById("max-price");

const categoryInputs =
    document.querySelectorAll(
        'input[name="category"]'
    );

const availabilityInputs =
    document.querySelectorAll(
        'input[name="availability"]'
    );


/* =========================================================
   PRODUCT DATA
   ========================================================= */

let products = [];
const searchParams = new URLSearchParams(window.location.search);
const categoryParam = searchParams.get("category");
const shouldFocusSearch = searchParams.get("focus") === "search" || window.location.hash === "#search";
if (shouldFocusSearch) {
    requestAnimationFrame(() => {
        searchInput?.focus();
        searchInput?.select();
    });
}


/* =========================================================
   LOAD PRODUCTS
   ========================================================= */

async function loadProducts() {

    try {

        const response =
            await fetch("/api/products");


        const data =
            await response.json();


        if (!response.ok || !data.success) {

            throw new Error(
                data.message || "Failed to load products"
            );

        }


        products = data.products;


        applyFilters();

    } catch (error) {

        console.error(
            "Failed to load products:",
            error
        );


        productGrid.innerHTML = "";

        resultsCount.textContent =
            "Unable to load products";

        emptyState.hidden = false;

    }

}


/* =========================================================
   FILTER PRODUCTS
   ========================================================= */

function applyFilters() {

    let filteredProducts =
        [...products];


    /* =====================================================
       SEARCH
       ===================================================== */

    const searchTerm =
        searchInput.value
            .trim()
            .toLowerCase();


    if (searchTerm) {

        filteredProducts =
            filteredProducts.filter((product) => {

                return (
                    product.name
                        .toLowerCase()
                        .includes(searchTerm)

                    ||

                    product.description
                        ?.toLowerCase()
                        .includes(searchTerm)

                    ||

                    product.category
                        ?.toLowerCase()
                        .includes(searchTerm)
                );

            });

    }


    /* =====================================================
       CATEGORY
       ===================================================== */

  const selectedCategories =
    Array.from(categoryInputs)
        .filter(input => input.checked)
        .map(input => input.value.toLowerCase());


if (selectedCategories.length > 0) {

    filteredProducts =
        filteredProducts.filter((product) => {

            const category =
                product.category?.toLowerCase();

            return selectedCategories.includes(
                category
            );

        });

}

    if (categoryParam && selectedCategories.length === 0) {
        filteredProducts = filteredProducts.filter((product) =>
            product.category?.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") ===
        categoryParam.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
        );
    }


    /* =====================================================
       MINIMUM PRICE
       ===================================================== */

    const minPrice =
        Number(minPriceInput.value);


    if (
        minPriceInput.value !== "" &&
        !Number.isNaN(minPrice)
    ) {

        filteredProducts =
            filteredProducts.filter((product) => {

                return Number(product.price) >= minPrice;

            });

    }


    /* =====================================================
       MAXIMUM PRICE
       ===================================================== */

    const maxPrice =
        Number(maxPriceInput.value);


    if (
        maxPriceInput.value !== "" &&
        !Number.isNaN(maxPrice)
    ) {

        filteredProducts =
            filteredProducts.filter((product) => {

                return Number(product.price) <= maxPrice;

            });

    }


    /* =====================================================
       AVAILABILITY
       ===================================================== */

    const selectedAvailability =
        Array.from(availabilityInputs)
            .filter(input => input.checked)
            .map(input => input.value);


    if (
        selectedAvailability.includes("in-stock")
    ) {

        filteredProducts =
            filteredProducts.filter((product) => {

                return Number(product.stock) > 0;

            });

    }


    /* =====================================================
       SORT
       ===================================================== */

    const sortValue =
        sortSelect.value;


    if (sortValue === "price-low") {

        filteredProducts.sort((a, b) => {

            return Number(a.price) - Number(b.price);

        });

    }


    if (sortValue === "price-high") {

        filteredProducts.sort((a, b) => {

            return Number(b.price) - Number(a.price);

        });

    }


    if (sortValue === "newest") {

        filteredProducts.sort((a, b) => {

            return new Date(b.created_at) -
                   new Date(a.created_at);

        });

    }


    /* =====================================================
       RENDER
       ===================================================== */

    renderProducts(filteredProducts);

}


/* =========================================================
   RENDER PRODUCTS
   ========================================================= */

function renderProducts(productList) {

    productGrid.innerHTML =
        createProductGrid(productList);


    initializeProductGrid(
        productGrid
    );


    resultsCount.textContent =
        `Showing ${productList.length} products`;


    if (productList.length === 0) {

        emptyState.hidden = false;

    } else {

        emptyState.hidden = true;

    }

}

/* =========================================================
   CLEAR FILTERS
   ========================================================= */

function clearFilters() {

    searchInput.value = "";

    minPriceInput.value = "";

    maxPriceInput.value = "";

    sortSelect.value = "featured";


    categoryInputs.forEach((input) => {

        input.checked = false;

    });


    availabilityInputs.forEach((input) => {

        input.checked = false;

    });


    applyFilters();

}


/* =========================================================
   EVENT LISTENERS
   ========================================================= */


/* Search */

searchInput?.addEventListener(
    "input",
    applyFilters
);


/* Category */

categoryInputs.forEach((input) => {

    input.addEventListener(
        "change",
        applyFilters
    );

});


/* Price */

minPriceInput?.addEventListener(
    "input",
    applyFilters
);


maxPriceInput?.addEventListener(
    "input",
    applyFilters
);


/* Availability */

availabilityInputs.forEach((input) => {

    input.addEventListener(
        "change",
        applyFilters
    );

});


/* Sorting */

sortSelect?.addEventListener(
    "change",
    applyFilters
);


/* Clear buttons */

clearFiltersButton?.addEventListener(
    "click",
    clearFilters
);


emptyClearFiltersButton?.addEventListener(
    "click",
    clearFilters
);


/* =========================================================
   START
   ========================================================= */

loadProducts();