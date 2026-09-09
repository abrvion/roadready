
// Addresses page entry point

import "../components/header.js";
import "../components/footer.js";


/* =====================================================
   ELEMENTS
   ===================================================== */

const addAddressButton =
    document.getElementById("add-address-button");

const addressFormWrapper =
    document.getElementById("address-form-wrapper");

const closeAddressForm =
    document.getElementById("close-address-form");

const cancelAddress =
    document.getElementById("cancel-address");

const addressForm =
    document.getElementById("address-form");

const addressList =
    document.getElementById("address-list");

const formTitle =
    addressFormWrapper.querySelector("h2");

const formEyebrow =
    addressFormWrapper.querySelector(".rr-category-label");

const submitButton =
    addressForm.querySelector(".rr-auth-submit");


/* =====================================================
   STATE
   ===================================================== */

let editingAddress = null;


/* =====================================================
   AUTH TOKEN
   ===================================================== */

const getToken = () => {
    return localStorage.getItem("token");
};


/* =====================================================
   OPEN ADD ADDRESS FORM
   ===================================================== */

function openAddAddressForm() {

    editingAddress = null;

    addressForm.reset();

    formEyebrow.textContent =
        "NEW ADDRESS";

    formTitle.textContent =
        "Add Delivery Address";

    submitButton.innerHTML =
        `Save Address <i class="bi bi-check2"></i>`;

    addressFormWrapper.hidden = false;

    addressFormWrapper.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}


/* =====================================================
   OPEN EDIT ADDRESS FORM
   ===================================================== */

function openEditAddressForm(address) {

    editingAddress = address;


    document.getElementById("address-label").value =
        address.label || "";

    document.getElementById("address-name").value =
        address.name || "";

    document.getElementById("address-phone").value =
        address.phone || "";

    document.getElementById("address-line").value =
        address.address_line || "";

    document.getElementById("address-city").value =
        address.city || "";

    document.getElementById("address-postal").value =
        address.postal_code || "";


    /*
        Show the real default state from PostgreSQL.
    */

    document.getElementById("address-default").checked =
        address.is_default === true;


    formEyebrow.textContent =
        "EDIT ADDRESS";

    formTitle.textContent =
        "Edit Delivery Address";

    submitButton.innerHTML =
        `Update Address <i class="bi bi-check2"></i>`;


    addressFormWrapper.hidden = false;


    addressFormWrapper.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}


/* =====================================================
   CLOSE FORM
   ===================================================== */

function closeForm() {

    addressFormWrapper.hidden = true;

    addressForm.reset();

    editingAddress = null;
}


/* =====================================================
   RENDER ADDRESS LIST
   ===================================================== */

function renderAddresses(addresses) {

    addressList.innerHTML = "";


    /* -------------------------------------------------
       Render real database addresses
       ------------------------------------------------- */

    addresses.forEach((address) => {

        const card =
            document.createElement("article");

        card.className =
            "rr-address-card";


        /*
            Store the real database ID on the card.
        */

        card.dataset.addressId =
            address.id;


        const label =
            address.label || "Address";


        const icon =
            label.toLowerCase() === "home"
                ? "bi-house"
                : "bi-geo-alt";


        card.innerHTML = `

            <div class="rr-address-card-header">

                <div class="rr-address-title">

                    <span class="rr-address-icon">

                        <i class="bi ${icon}"></i>

                    </span>


                    <div>

                        <h3>
                            ${label}
                        </h3>

                        <span>
                            ${
                                address.is_default
                                    ? "Default Address"
                                    : "Saved Address"
                            }
                        </span>

                    </div>

                </div>


                ${
                    address.is_default
                        ? `
                            <span class="rr-default-badge">
                                Default
                            </span>
                        `
                        : ""
                }

            </div>


            <div class="rr-address-details">

                <strong>
                    ${address.name}
                </strong>


                <p>
                    ${address.address_line}<br>
                    ${address.city}
                    ${
                        address.postal_code
                            ? `, ${address.postal_code}`
                            : ""
                    }
                </p>


                <span>

                    <i class="bi bi-telephone"></i>

                    ${address.phone}

                </span>

            </div>


            <div class="rr-address-actions">

                <button
                    type="button"
                    class="rr-address-action"
                    data-action="edit"
                >

                    <i class="bi bi-pencil"></i>

                    Edit

                </button>


                <button
                    type="button"
                    class="rr-address-action rr-address-delete"
                    data-action="delete"
                >

                    <i class="bi bi-trash3"></i>

                    Delete

                </button>

            </div>

        `;


        addressList.appendChild(card);

    });


    /* -------------------------------------------------
       Add New Address Card
       ------------------------------------------------- */

    const newAddressCard =
        document.createElement("button");

    newAddressCard.type =
        "button";

    newAddressCard.className =
        "rr-address-new-card";

    newAddressCard.id =
        "add-address-card";


    newAddressCard.innerHTML = `

        <span class="rr-address-new-icon">

            <i class="bi bi-plus-lg"></i>

        </span>


        <strong>
            Add New Address
        </strong>


        <span>
            Save another delivery location
        </span>

    `;


    addressList.appendChild(
        newAddressCard
    );
}


/* =====================================================
   LOAD ADDRESSES
   ===================================================== */

async function loadAddresses() {

    const token =
        getToken();


    if (!token) {

        window.location.href =
            "/login";

        return;
    }


    try {

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
                "Failed to load addresses"
            );
        }


        renderAddresses(
            data.addresses || []
        );


    } catch (error) {

        console.error(
            "Failed to load addresses:",
            error
        );
    }
}


/* =====================================================
   CREATE ADDRESS
   ===================================================== */

async function createAddress(addressData) {

    const token =
        getToken();


    try {

        const response =
            await fetch(
                "/api/addresses",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json",

                        Authorization:
                            `Bearer ${token}`
                    },

                    body:
                        JSON.stringify(addressData)
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to create address"
            );
        }


        await loadAddresses();

        closeForm();


    } catch (error) {

        console.error(
            "Failed to create address:",
            error
        );

        alert(
            error.message ||
            "Failed to create address."
        );
    }
}


/* =====================================================
   UPDATE ADDRESS
   ===================================================== */

async function updateAddress(
    addressId,
    addressData
) {

    const token =
        getToken();


    try {

        const response =
            await fetch(
                `/api/addresses/${addressId}`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json",

                        Authorization:
                            `Bearer ${token}`
                    },

                    body:
                        JSON.stringify(addressData)
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to update address"
            );
        }


        await loadAddresses();

        closeForm();


    } catch (error) {

        console.error(
            "Failed to update address:",
            error
        );

        alert(
            error.message ||
            "Failed to update address."
        );
    }
}


/* =====================================================
   DELETE ADDRESS
   ===================================================== */

async function deleteAddress(addressId) {

    const token =
        getToken();


    try {

        const response =
            await fetch(
                `/api/addresses/${addressId}`,
                {
                    method: "DELETE",

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
                "Failed to delete address"
            );
        }


        await loadAddresses();


    } catch (error) {

        console.error(
            "Failed to delete address:",
            error
        );

        alert(
            error.message ||
            "Failed to delete address."
        );
    }
}


/* =====================================================
   ADD ADDRESS BUTTON
   ===================================================== */

addAddressButton.addEventListener(
    "click",
    openAddAddressForm
);


/* =====================================================
   CLOSE BUTTONS
   ===================================================== */

closeAddressForm.addEventListener(
    "click",
    closeForm
);


cancelAddress.addEventListener(
    "click",
    closeForm
);


/* =====================================================
   SAVE / UPDATE ADDRESS
   ===================================================== */

addressForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();


        const formData =
            new FormData(addressForm);


        /*
            Convert the checkbox into a real boolean.

            Checked:
                true

            Unchecked:
                false
        */

        const isDefault =
            formData.get("isDefault") === "on";


        const addressData = {

            label:
                formData.get("label"),

            name:
                formData.get("name"),

            phone:
                formData.get("phone"),

            addressLine:
                formData.get("address"),

            city:
                formData.get("city"),

            postalCode:
                formData.get("postalCode"),

            isDefault

        };


        /* ---------------------------------------------
           EDIT EXISTING ADDRESS
           --------------------------------------------- */

        if (editingAddress) {

            await updateAddress(
                editingAddress.id,
                addressData
            );

            return;
        }


        /* ---------------------------------------------
           CREATE NEW ADDRESS
           --------------------------------------------- */

        await createAddress(
            addressData
        );

    }
);


/* =====================================================
   ADDRESS ACTIONS
   ===================================================== */

/*
    Event delegation is used here.

    Address cards are created dynamically
    by JavaScript.

    Therefore we listen on the parent container.
*/

addressList.addEventListener(
    "click",
    async (event) => {

        /* ---------------------------------------------
           ADD NEW ADDRESS
           --------------------------------------------- */

        const newAddressButton =
            event.target.closest(
                "#add-address-card"
            );


        if (newAddressButton) {

            openAddAddressForm();

            return;
        }


        /* ---------------------------------------------
           FIND ACTION BUTTON
           --------------------------------------------- */

        const actionButton =
            event.target.closest(
                "[data-action]"
            );


        if (!actionButton) {
            return;
        }


        /* ---------------------------------------------
           FIND ADDRESS CARD
           --------------------------------------------- */

        const addressCard =
            actionButton.closest(
                ".rr-address-card"
            );


        if (!addressCard) {
            return;
        }


        const addressId =
            Number(
                addressCard.dataset.addressId
            );


        if (!addressId) {
            return;
        }


        const action =
            actionButton.dataset.action;


        /* ---------------------------------------------
           EDIT
           --------------------------------------------- */

        if (action === "edit") {

            const token =
                getToken();


            try {

                const response =
                    await fetch(
                        `/api/addresses/${addressId}`,
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
                        "Failed to load address"
                    );
                }


                openEditAddressForm(
                    data.address
                );


            } catch (error) {

                console.error(
                    "Failed to load address:",
                    error
                );

                alert(
                    error.message ||
                    "Failed to load address."
                );
            }


            return;
        }


        /* ---------------------------------------------
           DELETE
           --------------------------------------------- */

        if (action === "delete") {

            const confirmed =
                window.confirm(
                    "Are you sure you want to delete this address?"
                );


            if (!confirmed) {
                return;
            }


            await deleteAddress(
                addressId
            );
        }

    }
);


/* =====================================================
   INITIAL LOAD
   ===================================================== */

loadAddresses();

