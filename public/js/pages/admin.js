
import {
  showNotification
} from "../utils/notification.js";


const token =
  localStorage.getItem("token");


/*
  AUTH
*/

async function getCurrentUser() {
  if (!token) {
    return null;
  }

  try {
    const response =
      await fetch("/api/auth/me", {
        headers: {
          Authorization:
            `Bearer ${token}`
        }
      });

    if (!response.ok) {
      return null;
    }

    const data =
      await response.json();

    return data.user;
  } catch (error) {
    console.error(
      "Failed to verify user:",
      error
    );

    return null;
  }
}


async function protectAdminPage() {
  const user =
    await getCurrentUser();

  if (!user) {
    window.location.href =
      "/login?next=/admin";

    return null;
  }

  if (user.role !== "admin") {
    alert(
      "You do not have permission to access the Admin area."
    );

    window.location.href =
      "/shop";

    return null;
  }

  return user;
}


/*
  SHARED ADMIN UI
*/

function setupSidebar() {
  const sidebar =
    document.querySelector(
      ".rr-admin-sidebar"
    );

  const overlay =
    document.querySelector(
      "#admin-overlay"
    );

  const menuButton =
    document.querySelector(
      "#admin-menu-button"
    );

  if (
    !sidebar ||
    !overlay ||
    !menuButton
  ) {
    return;
  }

  menuButton.addEventListener(
    "click",
    () => {
      sidebar.classList.add("is-open");
      overlay.classList.add("is-visible");
    }
  );

  overlay.addEventListener(
    "click",
    () => {
      sidebar.classList.remove("is-open");
      overlay.classList.remove("is-visible");
    }
  );
}


function setupLogout() {
  const button =
    document.querySelector(
      "#admin-logout"
    );

  if (!button) {
    return;
  }

  button.addEventListener(
    "click",
    () => {
      const confirmed =
        confirm(
          "Are you sure you want to logout?"
        );

      if (!confirmed) {
        return;
      }

      fetch("/api/auth/logout", { method: "POST", credentials: "same-origin" }).catch(() => {});
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      window.location.href =
        "/login?next=/admin";
    }
  );
}


/*
  Shared live dashboard metrics for admin list pages.
*/
async function loadDashboardStats() {
  const response = await fetch("/api/admin/dashboard", {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || "Failed to load dashboard metrics");
  return data.stats || {};
}


/*
  DASHBOARD
*/

async function loadDashboard() {
  const response =
    await fetch(
      "/api/admin/dashboard",
      {
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
      "Failed to load dashboard"
    );
  }

  const stats =
    data.stats;

  const values = {
    "admin-total-revenue":
      `৳${Number(stats.total_revenue).toLocaleString()}`,

    "admin-total-orders":
      Number(stats.total_orders),

    "admin-total-customers":
      Number(stats.total_customers),

    "admin-total-products":
      Number(stats.total_products),

    "admin-low-stock":
      Number(stats.low_stock_products)
  };

  Object.entries(values)
    .forEach(
      ([id, value]) => {
        const element =
          document.getElementById(id);

        if (element) {
          element.textContent =
            value;
        }
      }
    );

  setText("#admin-orders-supporting", `${Number(stats.pending_orders) + Number(stats.processing_orders) + Number(stats.shipped_orders)} active orders`);
  setText("#admin-customers-supporting", `${Number(stats.total_customers)} registered customers`);
  setText("#admin-products-supporting", `${Number(stats.low_stock_products)} low stock · ${Number(stats.out_of_stock_products)} out of stock`);

  setText("#admin-inventory-in-stock", Number(stats.in_stock_products));
  setText("#admin-inventory-low-stock", Number(stats.low_stock_products));
  setText("#admin-inventory-out-stock", Number(stats.out_of_stock_products));
  renderBestSellers(data.bestSellers || []);

  renderRecentOrders(
    data.recentOrders || []
  );
}


function renderBestSellers(products) {
  const container = document.querySelector("#admin-best-sellers-list");
  if (!container) return;
  if (!products.length) {
    container.innerHTML = '<div class="rr-admin-empty-row">No sales data yet.</div>';
    return;
  }
  container.innerHTML = products.map((product) => `
    <a class="rr-admin-product-row" href="/admin/product/${product.id}/edit">
      <div class="rr-admin-product-image">
        ${product.image ? `<img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name)}" loading="lazy">` : '<i class="bi bi-image"></i>'}
      </div>
      <div>
        <strong>${escapeHtml(product.name)}</strong>
        <span>${escapeHtml(product.category_name || "Uncategorized")}</span>
      </div>
      <strong>${Number(product.units_sold)} sold</strong>
    </a>
  `).join("");
}


function renderRecentOrders(orders) {
  const body =
    document.querySelector(
      "#admin-dashboard-orders-body"
    );

  if (!body) {
    return;
  }

  body.innerHTML = "";

  orders.forEach(
    (order) => {
      const row =
        document.createElement("tr");

      row.innerHTML = `
        <td>
          <a class="rr-admin-order-id" href="/admin/order/${order.id}">
            #${escapeHtml(order.order_number || `RR-${String(order.id).padStart(6, "0")}`)}
          </a>
        </td>

        <td>
          ${escapeHtml(
            order.customer_name
          )}
        </td>

        <td>
          ${formatDate(
            order.created_at
          )}
        </td>

        <td>
          ৳${Number(
            order.total
          ).toLocaleString()}
        </td>

        <td>
          <span class="rr-admin-status rr-admin-status-${escapeHtml(order.status)}">
            ${capitalize(
              order.status
            )}
          </span>
        </td>

        <td>
          <a
            href="/admin/order/${order.id}"
          >
            View
          </a>
        </td>
      `;

      body.appendChild(row);
    }
  );
}


/*
  CATEGORIES
*/

/*
  Load categories from the Admin API.
  This is also used by the product form.
*/

async function loadProductCategories() {
  const response =
    await fetch(
      "/api/admin/categories?status=active",
      {
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
      "Failed to load categories"
    );
  }

  return data.categories || [];
}


/*
  Load all categories for the
  Categories admin page.
*/

async function loadCategories() {
  const table =
    document.querySelector(
      "#admin-categories-table"
    );

  if (!table) {
    return;
  }

  const search =
    document.querySelector(
      "#admin-category-search"
    )?.value || "";

  const response =
    await fetch(
      `/api/admin/categories?search=${encodeURIComponent(
        search
      )}`,
      {
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
      "Failed to load categories"
    );
  }

  renderCategories(
    data.categories || []
  );
}


/*
  Render categories into the
  admin categories table.
*/

function renderCategories(categories) {
  const table =
    document.querySelector(
      "#admin-categories-table"
    );

  if (!table) {
    return;
  }

  const body =
    table.querySelector("tbody");

  if (!body) {
    return;
  }

  body.innerHTML = "";


  /*
    No categories
  */

  if (categories.length === 0) {
    const row =
      document.createElement("tr");

    row.innerHTML = `
      <td
        colspan="5"
        style="text-align: center;"
      >
        No categories found.
      </td>
    `;

    body.appendChild(row);

    return;
  }


  /*
    Render every category.
  */

  categories.forEach(
    (category) => {
      const row =
        document.createElement("tr");

      const productCount =
        category.product_count ??
        category.products_count ??
        0;

      const status =
        category.status ||
        "inactive";


      row.innerHTML = `
        <td>
          ${escapeHtml(
            category.name
          )}
        </td>

        <td>
          ${escapeHtml(
            category.description ||
            "—"
          )}
        </td>

        <td>
          ${Number(
            productCount
          )}
        </td>

        <td>
          <span
            class="rr-admin-status rr-admin-status-${escapeHtml(status)}"
          >
            ${capitalize(status)}
          </span>
        </td>

        <td>

          <button
            type="button"
            class="rr-admin-category-edit"
            data-id="${category.id}"
          >
            Edit
          </button>

          <button
            type="button"
            class="rr-admin-category-status"
            data-id="${category.id}"
            data-status="${
              status === "active"
                ? "inactive"
                : "active"
            }"
          >
            ${
              status === "active"
                ? "Deactivate"
                : "Activate"
            }
          </button>

        </td>
      `;

      body.appendChild(row);
    }
  );


  /*
    Edit buttons
  */

  body
    .querySelectorAll(
      ".rr-admin-category-edit"
    )
    .forEach(
      (button) => {
        button.addEventListener(
          "click",
          async () => {
            await loadCategoryForEdit(
              button.dataset.id
            );
          }
        );
      }
    );


  /*
    Status buttons
  */

  body
    .querySelectorAll(
      ".rr-admin-category-status"
    )
    .forEach(
      (button) => {
        button.addEventListener(
          "click",
          async () => {
            await updateCategoryStatus(
              button.dataset.id,
              button.dataset.status
            );
          }
        );
      }
    );
}


/*
  Category form
*/

async function setupCategoryForm() {
  const form =
    document.querySelector(
      "#admin-category-form"
    );

  if (!form) {
    return;
  }

  const cancelButton =
    document.querySelector(
      "#admin-category-cancel"
    );


  /*
    Cancel editing
  */

  cancelButton?.addEventListener(
    "click",
    () => {
      resetCategoryForm();
    }
  );


  /*
    Save category
  */

  form.addEventListener(
    "submit",
    async (event) => {
      event.preventDefault();

      const id =
        document.querySelector(
          "#admin-category-id"
        )?.value;


      const name =
        document.querySelector(
          "#admin-category-name"
        )?.value
          ?.trim();


      const description =
        document.querySelector(
          "#admin-category-description"
        )?.value
          ?.trim();


      const image =
        document.querySelector(
          "#admin-category-image"
        )?.value
          ?.trim();


      if (!name) {
        alert(
          "Category name is required."
        );

        return;
      }


      const submitButton =
        form.querySelector(
          'button[type="submit"]'
        );


      if (submitButton) {
        submitButton.disabled =
          true;
      }


      try {

        const payload = {
          name,
          description,
          image
        };


        const url =
          id
            ? `/api/admin/categories/${id}`
            : "/api/admin/categories";


        const method =
          id
            ? "PUT"
            : "POST";


        const response =
          await fetch(
            url,
            {
              method,

              headers: {
                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${token}`
              },

              body:
                JSON.stringify(
                  payload
                )
            }
          );


        const data =
          await response.json();


        if (!response.ok) {
          throw new Error(
            data.message ||
            "Failed to save category."
          );
        }


        showNotification(
          id
            ? "Category updated."
            : "Category created."
        );


        resetCategoryForm();

        await loadCategories();

      } catch (error) {

        console.error(
          "Failed to save category:",
          error
        );

        alert(
          error.message ||
          "Failed to save category."
        );

      } finally {

        if (submitButton) {
          submitButton.disabled =
            false;
        }

      }
    }
  );
}


/*
  Load a category into the
  category form for editing.
*/

async function loadCategoryForEdit(id) {
  try {

    const response =
      await fetch(
        `/api/admin/categories/${id}`,
        {
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
        "Category not found."
      );
    }


    const category =
      data.category;


    setValue(
      "#admin-category-id",
      category.id
    );

    setValue(
      "#admin-category-name",
      category.name
    );

    setValue(
      "#admin-category-description",
      category.description || ""
    );

    setValue(
      "#admin-category-image",
      category.image || ""
    );


    /*
      Change the form heading.
    */

    const heading =
      document.querySelector(
        ".rr-admin-panel-heading h3"
      );

    if (heading) {
      heading.textContent =
        "Edit Category";
    }


    /*
      Bring the form into view.
    */

    document
      .querySelector(
        "#admin-category-form"
      )
      ?.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });

  } catch (error) {

    console.error(
      "Failed to load category:",
      error
    );

    alert(
      error.message ||
      "Failed to load category."
    );
  }
}


/*
  Reset category form
*/

function resetCategoryForm() {
  const form =
    document.querySelector(
      "#admin-category-form"
    );

  if (form) {
    form.reset();
  }


  setValue(
    "#admin-category-id",
    ""
  );


  /*
    Restore heading
  */

  const heading =
    document.querySelector(
      ".rr-admin-panel-heading h3"
    );

  if (heading) {
    heading.textContent =
      "Add Category";
  }
}


/*
  Activate / deactivate category
*/

async function updateCategoryStatus(
  id,
  status
) {
  try {

    const response =
      await fetch(
        `/api/admin/categories/${id}/status`,
        {
          method: "PATCH",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${token}`
          },

          body:
            JSON.stringify({
              status
            })
        }
      );


    const data =
      await response.json();


    if (!response.ok) {
      throw new Error(
        data.message ||
        "Failed to update category status."
      );
    }


    showNotification(
      "Category status updated."
    );


    await loadCategories();

  } catch (error) {

    console.error(
      "Failed to update category:",
      error
    );

    alert(
      error.message ||
      "Failed to update category."
    );
  }
}


/*
  Category filters
*/

async function setupCategoryFilters() {
  const search =
    document.querySelector(
      "#admin-category-search"
    );

  if (!search) {
    return;
  }


  search.addEventListener(
    "input",
    debounce(
      loadCategories,
      350
    )
  );
}


/*
  PRODUCTS
*/

async function loadAdminProductCategories() {
  const select = document.querySelector("#admin-category-filter");
  if (!select) return;
  const current = select.value || "all";
  const response = await fetch("/api/admin/categories?status=active", {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to load categories");
  select.innerHTML = `<option value="all">All Categories</option>` +
    (data.categories || []).map(category => `<option value="${Number(category.id)}">${escapeHtml(category.name)}</option>`).join("");
  if ([...select.options].some(option => option.value === current)) select.value = current;
}

async function loadProducts() {
  const table =
    document.querySelector(
      "#admin-products-table"
    );

  if (!table) {
    return;
  }

  const search =
    document.querySelector(
      "#admin-product-search"
    )?.value || "";

  const category =
    document.querySelector(
      "#admin-category-filter"
    )?.value || "all";

  const stock =
    document.querySelector(
      "#admin-stock-filter"
    )?.value || "all";

  const response =
    await fetch(
      `/api/admin/products?search=${encodeURIComponent(
        search
      )}&categoryId=${encodeURIComponent(
        category
      )}&stockFilter=${encodeURIComponent(
        stock
      )}`,
      {
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
      "Failed to load products"
    );
  }

  setText("#admin-products-total-page", Number(data.total || 0));
  const stats = await loadDashboardStats();
  setText("#admin-products-active-page", Number(stats.active_products || 0));
  setText("#admin-products-low-page", Number(stats.low_stock_products || 0));
  setText("#admin-products-out-page", Number(stats.out_of_stock_products || 0));
  const pagination = document.querySelector("#admin-products-pagination-summary");
  if (pagination) pagination.textContent = data.total ? `Showing ${data.products.length} of ${data.total} products` : "No products";

  renderProducts(
    data.products || []
  );
}


function renderProducts(products) {
  const table =
    document.querySelector(
      "#admin-products-table"
    );

  if (!table) {
    return;
  }

  const body =
    table.querySelector("tbody");

  if (!body) {
    return;
  }

  body.innerHTML = "";

  const empty =
    document.querySelector(
      "#admin-products-empty"
    );

  if (products.length === 0) {
    if (empty) {
      empty.style.display =
        "block";
    }

    return;
  }

  if (empty) {
    empty.style.display =
      "none";
  }

  products.forEach(
    (product) => {
      const row =
        document.createElement("tr");

      const stockClass =
        product.stock === 0
          ? "out"
          : product.stock <= 5
            ? "low"
            : "";

      row.innerHTML = `
        <td>
          ${escapeHtml(
            product.name
          )}
        </td>

        <td>
          ${escapeHtml(
            product.category_name
          )}
        </td>

        <td>
          ৳${Number(
            product.price
          ).toLocaleString()}
        </td>

        <td>
          <span class="${stockClass}">
            ${product.stock}
          </span>
        </td>

        <td>
          <span class="rr-admin-status">
            ${capitalize(
              product.status
            )}
          </span>
        </td>

        <td>
          <a
            href="/admin/product/${product.id}/edit"
          >
            Edit
          </a>

          <button
            type="button"
            class="rr-admin-product-status"
            data-id="${product.id}"
            data-status="${
              product.status === "active"
                ? "inactive"
                : "active"
            }"
          >
            ${
              product.status === "active"
                ? "Deactivate"
                : "Activate"
            }
          </button>
        </td>
      `;

      body.appendChild(row);
    }
  );

  body
    .querySelectorAll(
      ".rr-admin-product-status"
    )
    .forEach(
      (button) => {
        button.addEventListener(
          "click",
          async () => {
            await updateProductStatus(
              button.dataset.id,
              button.dataset.status
            );
          }
        );
      }
    );
}


async function updateProductStatus(
  id,
  status
) {
  const response =
    await fetch(
      `/api/admin/products/${id}/status`,
      {
        method: "PATCH",

        headers: {
          "Content-Type":
            "application/json",

          Authorization:
            `Bearer ${token}`
        },

        body: JSON.stringify({
          status
        })
      }
    );

  const data =
    await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
      "Failed to update product"
    );
  }

  showNotification(
    "Product status updated."
  );

  await loadProducts();
}


/*
  PRODUCT IMAGE PREVIEW
*/

function setupProductImagePreview() {
  const imageUrlInput =
    document.querySelector(
      "#product-image-url"
    );

  const previewContainer =
    document.querySelector(
      "#admin-product-image-preview"
    );

  const previewImage =
    document.querySelector(
      "#admin-product-preview-image"
    );

  if (
    !imageUrlInput ||
    !previewContainer ||
    !previewImage
  ) {
    return;
  }


  previewContainer.style.width =
    "100px";

  previewContainer.style.height =
    "100px";

  previewContainer.style.marginTop =
    "12px";

  previewContainer.style.border =
    "1px solid #ddd";

  previewContainer.style.borderRadius =
    "8px";

  previewContainer.style.overflow =
    "hidden";

  previewContainer.style.display =
    "flex";

  previewContainer.style.alignItems =
    "center";

  previewContainer.style.justifyContent =
    "center";

  previewContainer.style.background =
    "#f8f8f8";


  previewImage.style.width =
    "100%";

  previewImage.style.height =
    "100%";

  previewImage.style.objectFit =
    "contain";

  previewImage.style.display =
    "block";


  function hidePreview() {
    previewContainer.hidden =
      true;

    previewImage.removeAttribute(
      "src"
    );
  }


  function showPreview(url) {
    const cleanUrl =
      url.trim();

    if (!cleanUrl) {
      hidePreview();
      return;
    }

    previewImage.onload =
      () => {
        previewContainer.hidden =
          false;
      };

    previewImage.onerror =
      () => {
        hidePreview();
      };

    previewImage.src =
      cleanUrl;
  }


  imageUrlInput.addEventListener(
    "input",
    () => {
      showPreview(
        imageUrlInput.value
      );
    }
  );


  if (imageUrlInput.value.trim()) {
    showPreview(
      imageUrlInput.value
    );
  }
}


/*
  PRODUCT FORM
*/

async function setupProductForm() {
  const form =
    document.querySelector(
      "#admin-product-form"
    );

  if (!form) {
    return;
  }

  const params =
    new URLSearchParams(
      window.location.search
    );

  const productPathMatch = window.location.pathname.match(/^\/admin\/product\/(\d+)\/edit$/);
  const productId = productPathMatch?.[1] || params.get("id");

  const categorySelect =
    document.querySelector(
      "#product-category"
    );


  if (categorySelect) {
    try {
      categorySelect.disabled = true;

      categorySelect.innerHTML = `
        <option value="">
          Loading categories...
        </option>
      `;

      const categories =
        await loadProductCategories();

      categorySelect.innerHTML = `
        <option value="">
          Select category
        </option>
      `;

      categories.forEach(
        (category) => {
          const option =
            document.createElement(
              "option"
            );

          option.value =
            category.id;

          option.textContent =
            category.name;

          categorySelect.appendChild(
            option
          );
        }
      );

      categorySelect.disabled = false;

      if (categories.length === 0) {
        categorySelect.innerHTML = `
          <option value="">
            No active categories available
          </option>
        `;

        categorySelect.disabled = true;
      }
    } catch (error) {
      categorySelect.innerHTML = `
        <option value="">
          Failed to load categories
        </option>
      `;

      categorySelect.disabled = true;

      throw error;
    }
  }


  setupProductImagePreview();


  if (productId) {
    setText(
      "#admin-product-page-title",
      "Edit Product"
    );

    setText(
      "#admin-product-form-heading",
      "Edit Product"
    );

    await loadProductForEdit(
      productId
    );
  }


  form.addEventListener(
    "submit",
    async (event) => {
      event.preventDefault();

      const saveButton =
        document.querySelector(
          "#admin-save-product"
        );

      if (saveButton) {
        saveButton.disabled = true;
      }

      try {
        const formData =
          new FormData(form);

        const active =
          formData.get("active") !== null;

        const payload = {
          name:
            formData.get("name")?.trim(),

          description:
            formData.get(
              "description"
            )?.trim(),

          price:
            formData.get("price"),

          stock:
            formData.get("stock"),

          brand:
            formData.get("brand")?.trim(),

          categoryId:
            formData.get("category"),

          image:
            formData.get("imageUrl")?.trim() || "",

          status:
            active
              ? "active"
              : "inactive"
        };


        if (!payload.name) {
          throw new Error(
            "Product name is required."
          );
        }

        if (!payload.categoryId) {
          throw new Error(
            "Please select a category."
          );
        }

        if (
          payload.price === null ||
          payload.price === ""
        ) {
          throw new Error(
            "Product price is required."
          );
        }

        if (
          payload.stock === null ||
          payload.stock === ""
        ) {
          throw new Error(
            "Stock quantity is required."
          );
        }


        const url =
          productId
            ? `/api/admin/products/${productId}`
            : "/api/admin/products";

        const method =
          productId
            ? "PUT"
            : "POST";


        const response =
          await fetch(url, {
            method,

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${token}`
            },

            body:
              JSON.stringify(payload)
          });


        const data =
          await response.json();


        if (!response.ok) {
          throw new Error(
            data.message ||
            "Failed to save product."
          );
        }


        showNotification(
          productId
            ? "Product updated."
            : "Product created."
        );


        setTimeout(() => {
          window.location.href =
            "/admin/products";
        }, 500);

      } catch (error) {
        console.error(
          "Failed to save product:",
          error
        );

        alert(
          error.message ||
          "Failed to save product."
        );

      } finally {
        if (saveButton) {
          saveButton.disabled = false;
        }
      }
    }
  );
}


async function loadProductForEdit(
  id
) {
  const response =
    await fetch(
      `/api/admin/products/${id}`,
      {
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
      "Product not found."
    );
  }

  const product =
    data.product;

  setValue(
    "#product-name",
    product.name
  );

  setValue(
    "#product-description",
    product.description || ""
  );

  setValue(
    "#product-price",
    product.price
  );

  setValue(
    "#product-stock",
    product.stock
  );

  setValue(
    "#product-brand",
    product.brand || ""
  );

  setValue(
    "#product-category",
    product.category_id
  );


  const activeCheckbox =
    document.querySelector(
      "#product-active"
    );

  if (activeCheckbox) {
    activeCheckbox.checked =
      product.status === "active";
  }


  const imageUrlInput =
    document.querySelector(
      "#product-image-url"
    );

  if (imageUrlInput) {
    imageUrlInput.value =
      product.image || "";

    if (
      product.image
    ) {
      imageUrlInput.dispatchEvent(
        new Event("input")
      );
    }
  }
}


/*
  ORDERS
*/

async function loadOrders() {
  const table =
    document.querySelector(
      "#admin-orders-table"
    );

  if (!table) {
    return;
  }

  const search =
    document.querySelector(
      "#admin-order-search"
    )?.value || "";

  const status =
    document.querySelector(
      "#admin-order-status-filter"
    )?.value || "all";

  const customerId =
    new URLSearchParams(window.location.search).get("customer") || "all";

  const response =
    await fetch(
      `/api/admin/orders?search=${encodeURIComponent(
        search
      )}&status=${encodeURIComponent(
        status
      )}&customerId=${encodeURIComponent(
        customerId
      )}`,
      {
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

  setText("#admin-orders-total-page", Number(data.total || 0));
  const stats = await loadDashboardStats();
  setText("#admin-orders-pending-page", Number(stats.pending_orders || 0));
  setText("#admin-orders-processing-page", Number(stats.processing_orders || 0));
  setText("#admin-orders-completed-page", Number(stats.delivered_orders || 0));
  const pagination = document.querySelector("#admin-orders-pagination-summary");
  if (pagination) pagination.textContent = data.total ? `Showing ${data.orders.length} of ${data.total} orders` : "No orders";

  renderOrders(
    data.orders || []
  );
}


function renderOrders(orders) {
  const table =
    document.querySelector(
      "#admin-orders-table"
    );

  if (!table) {
    return;
  }

  const body =
    table.querySelector("tbody");

  if (!body) {
    return;
  }

  body.innerHTML = "";

  const empty =
    document.querySelector(
      "#admin-orders-empty"
    );

  if (orders.length === 0) {
    if (empty) {
      empty.style.display =
        "block";
    }

    return;
  }

  if (empty) {
    empty.style.display =
      "none";
  }

  orders.forEach(
    (order) => {
      const row =
        document.createElement("tr");

      row.innerHTML = `
        <td>#${order.id}</td>

        <td>
          ${escapeHtml(
            order.customer_name
          )}
        </td>

        <td>
          ${formatDate(
            order.created_at
          )}
        </td>

        <td>
          ৳${Number(
            order.total
          ).toLocaleString()}
        </td>

        <td>
          ${capitalize(
            order.payment_status
          )}
        </td>

        <td>
          <span class="rr-admin-status">
            ${capitalize(
              order.status
            )}
          </span>
        </td>

        <td>
          <a
            href="/admin/order/${order.id}"
          >
            View
          </a>
        </td>
      `;

      body.appendChild(row);
    }
  );
}


async function setupOrderDetails() {
  const select =
    document.querySelector(
      "#admin-order-status-select"
    );

  if (!select) {
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const pathMatch = window.location.pathname.match(/^\/admin\/order\/(\d+)/);
  const orderId = pathMatch?.[1] || params.get("id");

  if (!orderId) {
    return;
  }

  const response =
    await fetch(
      `/api/admin/orders/${orderId}`,
      {
        headers: {
          Authorization:
            `Bearer ${token}`
        }
      }
    );

  const data =
    await response.json();

  if (!response.ok) {
  showNotification(
    data.message ||
    "Order not found.",
    "error"
  );

  return;
}

  renderOrderDetails(
    data.order,
    data.items
  );

  select.value =
    data.order.status;

  const updateButton =
    document.querySelector(
      "#admin-update-order-status"
    );

  if (updateButton) {
    updateButton.addEventListener(
      "click",
      async () => {
        await updateOrderStatus(
          orderId,
          select.value
        );
      }
    );
  }
}


function renderOrderDetails(order, items = []) {
  const safeItems = Array.isArray(items)
    ? items
    : [];

  const total =
    Number(order.total) || 0;

  const subtotal =
    safeItems.reduce(
      (sum, item) =>
        sum +
        (
          Number(item.price) || 0
        ) *
        (
          Number(item.quantity) || 0
        ),
      0
    );

  /*
    RoadReady currently uses a fixed ৳100
    standard delivery fee for non-empty orders.
    Derive it from the actual order total rather
    than displaying a hardcoded demo value.
  */
  const delivery =
    subtotal > 0
      ? Math.max(0, total - subtotal)
      : 0;

  const discount = 0;

  const orderNumber =
    order.order_number ||
    `RR-${String(order.id).padStart(6, "0")}`;

  const customerName =
    order.customer_name ||
    "Customer";

  const customerInitials =
    customerName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map(
        (part) =>
          part.charAt(0).toUpperCase()
      )
      .join("") ||
    "CU";


  /*
    HEADER
  */

  setText(
    "#admin-order-title",
    `Order #${orderNumber}`
  );

  setText(
    "#admin-order-date",
    `Placed on ${formatDate(order.created_at)}`
  );

  setText(
    "#admin-order-time",
    formatTime(order.created_at)
  );

  setText(
    "#admin-order-status",
    capitalize(order.status)
  );


  /*
    ORDER ITEM COUNT
  */

  setText(
    "#admin-order-item-count",
    `${safeItems.length} ${
      safeItems.length === 1
        ? "item"
        : "items"
    }`
  );


  /*
    ORDER ITEMS
  */

  const productContainer =
    document.querySelector(
      "#admin-order-items-body"
    );

  if (productContainer) {

    productContainer.innerHTML = "";

    if (safeItems.length === 0) {

      productContainer.innerHTML = `
        <div class="rr-admin-order-item">
          <div class="rr-admin-order-item-info">
            <strong>
              No products found for this order.
            </strong>
          </div>
        </div>
      `;

    } else {

      safeItems.forEach((item) => {

        const row =
          document.createElement("div");

        row.className =
          "rr-admin-order-item";

        const itemPrice =
          Number(item.price) || 0;

        const quantity =
          Number(item.quantity) || 0;

        const itemTotal =
          itemPrice * quantity;

        const image =
          item.image
            ? `
              <img
                src="${escapeHtml(item.image)}"
                alt="${escapeHtml(item.name || "Product")}"
                style="
                  width:100%;
                  height:100%;
                  object-fit:cover;
                  border-radius:8px;
                "
              >
            `
            : `
              <i class="bi bi-image"></i>
            `;

        row.innerHTML = `

          <div class="rr-admin-order-item-image">
            ${image}
          </div>

          <div class="rr-admin-order-item-info">

            <strong>
              ${escapeHtml(
                item.name ||
                "Unknown product"
              )}
            </strong>

            <span>
              Product ID: #${Number(
                item.product_id
              ) || "—"}
            </span>

            <small>
              Quantity: ${quantity}
            </small>

          </div>

          <strong class="rr-admin-order-item-price">
            ৳${itemTotal.toLocaleString()}
          </strong>

        `;

        productContainer.appendChild(row);

      });

    }

  }


  /*
    TOTALS
  */

  setText(
    "#admin-order-subtotal",
    `৳${subtotal.toLocaleString()}`
  );

  setText(
    "#admin-order-delivery",
    `৳${delivery.toLocaleString()}`
  );

  setText(
    "#admin-order-discount",
    `-৳${discount.toLocaleString()}`
  );

  setText(
    "#admin-order-total",
    `৳${total.toLocaleString()}`
  );


  /*
    PAYMENT
  */

  const paymentStatus =
    capitalize(
      order.payment_status ||
      "pending"
    );

  setText(
    "#admin-order-payment-badge",
    paymentStatus
  );

  setText(
    "#admin-order-payment-status",
    paymentStatus
  );

  setText(
    "#admin-order-payment-reference",
    orderNumber
  );

  setText(
    "#admin-order-payment-total",
    `৳${total.toLocaleString()}`
  );

  /*
    RoadReady currently supports Cash on Delivery.
  */
  setText(
    "#admin-order-payment-method",
    "Cash on Delivery"
  );


  /*
    CUSTOMER
  */

  setText(
    "#admin-order-customer-avatar",
    customerInitials
  );

  setText(
    "#admin-order-customer-name",
    customerName
  );

  setText(
    "#admin-order-customer-email",
    order.customer_email ||
    "—"
  );
  setText(
  "#admin-order-customer-email-contact",
  order.customer_email || "—"
);
  setText(
    "#admin-order-customer-phone",
    order.customer_phone ||
    "—"
  );


  /*
    CUSTOMER CONTACT LINKS
  */

  const phoneLink =
    document.querySelector(
      "#admin-order-customer-phone-link"
    );

  if (phoneLink) {

    if (order.customer_phone) {

      phoneLink.href =
        `tel:${order.customer_phone}`;

      phoneLink.style.display =
        "";

    } else {

      phoneLink.removeAttribute("href");
      phoneLink.style.display =
        "none";

    }

  }


  const emailLink =
    document.querySelector(
      "#admin-order-customer-email-link"
    );

  if (emailLink) {

    if (order.customer_email) {

      emailLink.href =
        `mailto:${order.customer_email}`;

      emailLink.style.display =
        "";

    } else {

      emailLink.removeAttribute("href");
      emailLink.style.display =
        "none";

    }

  }


  /*
    SHIPPING
  */

  setText(
    "#admin-order-shipping-name",
    order.shipping_name ||
    "No shipping name available"
  );

  setText(
    "#admin-order-shipping-phone",
    order.shipping_phone ||
    "No phone available"
  );

  setText(
    "#admin-order-shipping-address",
    [
      order.shipping_address_line,
      order.shipping_city,
      order.shipping_postal_code
    ]
      .filter(Boolean)
      .join(", ") ||
    "No shipping address available"
  );


  /*
    STATUS SELECT
  */

  const statusSelect =
    document.querySelector(
      "#admin-order-status-select"
    );

  if (statusSelect) {

    statusSelect.value =
      order.status || "pending";

  }

}

async function updateOrderStatus(
  id,
  status
) {
  const response =
    await fetch(
      `/api/admin/orders/${id}/status`,
      {
        method: "PATCH",

        headers: {
          "Content-Type":
            "application/json",

          Authorization:
            `Bearer ${token}`
        },

        body: JSON.stringify({
          status
        })
      }
    );

  const data =
    await response.json();

  if (!response.ok) {
   showNotification(
  data.message ||
  "Failed to update order.",
  "error"
);

    return;
  }

  showNotification(
    "Order status updated."
  );

  setText(
    "#admin-order-status",
    capitalize(
      data.order.status
    )
  );
}


/*
  CUSTOMERS
*/

async function loadCustomers() {
  const table =
    document.querySelector(
      "#admin-customers-table"
    );

  if (!table) {
    return;
  }

  const search =
    document.querySelector(
      "#admin-customer-search"
    )?.value || "";

  const response =
    await fetch(
      `/api/admin/customers?search=${encodeURIComponent(
        search
      )}`,
      {
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
      "Failed to load customers"
    );
  }

  setText("#admin-total-customers-page", Number(data.summary?.total_customers || 0));
  setText("#admin-active-customers-page", Number(data.summary?.active_customers || 0));
  setText("#admin-repeat-customers-page", Number(data.summary?.repeat_customers || 0));
  setText("#admin-new-customers-page", Number(data.new_customers || 0));
  const pagination = document.querySelector("#admin-customers-pagination-summary");
  if (pagination) pagination.textContent = data.total ? `Showing ${data.customers.length} of ${data.total} customers` : "No customers";

  renderCustomers(
    data.customers || []
  );
}


function renderCustomers(
  customers
) {
  const table =
    document.querySelector(
      "#admin-customers-table"
    );

  if (!table) {
    return;
  }

  const body =
    table.querySelector("tbody");

  if (!body) {
    return;
  }

  body.innerHTML = "";

  const empty =
    document.querySelector(
      "#admin-customers-empty"
    );

  if (customers.length === 0) {
    if (empty) {
      empty.style.display =
        "block";
    }

    return;
  }

  if (empty) {
    empty.style.display =
      "none";
  }

  customers.forEach(
    (customer) => {
      const row =
        document.createElement("tr");

      row.innerHTML = `
        <td>
          ${escapeHtml(
            customer.name
          )}
        </td>

        <td>
          ${escapeHtml(
            customer.email
          )}
        </td>

        <td>
          ${customer.orders_count}
        </td>

        <td>
          ৳${Number(
            customer.total_spent
          ).toLocaleString()}
        </td>

        <td>
          ${
            customer.last_order
              ? formatDate(
                  customer.last_order
                )
              : "Never"
          }
        </td>

        <td>
          <a
            href="/admin/customer/${customer.id}"
          >
            View
          </a>
        </td>
      `;

      body.appendChild(row);
    }
  );
}


async function setupCustomerDetails() {
  const title =
    document.querySelector(
      "#admin-customer-page-title"
    );

  if (!title) {
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const pathMatch = window.location.pathname.match(/^\/admin\/customer\/(\d+)/);
  const customerId = pathMatch?.[1] || params.get("id");

  if (!customerId) {
    return;
  }

  const response =
    await fetch(
      `/api/admin/customers/${customerId}`,
      {
        headers: {
          Authorization:
            `Bearer ${token}`
        }
      }
    );

  const data =
    await response.json();

  if (!response.ok) {
    alert(
      data.message ||
      "Customer not found."
    );

    return;
  }

  renderCustomerDetails(
    data
  );
}


function renderCustomerDetails(
  data
) {
  const customer =
    data.customer;

  const stats =
    data.stats;

  setText(
    "#admin-customer-page-title",
    customer.name
  );

  setText(
    "#admin-customer-name",
    customer.name
  );

  setText(
    "#admin-customer-id",
    `C-${customer.id}`
  );

  setText(
    "#admin-customer-email",
    customer.email
  );

  setText(
    "#admin-customer-phone",
    customer.phone || "—"
  );

  setText(
    "#admin-customer-joined",
    formatDate(
      customer.created_at
    )
  );

  setText(
    "#admin-customer-orders-count",
    stats.orders_count
  );

  setText(
    "#admin-customer-total-spent",
    `৳${Number(
      stats.total_spent
    ).toLocaleString()}`
  );

  setText(
    "#admin-customer-last-order",
    stats.last_order
      ? formatDate(
          stats.last_order
        )
      : "Never"
  );

  const body =
    document.querySelector(
      "#admin-customer-orders-body"
    );

  if (!body) {
    return;
  }

  body.innerHTML = "";

  data.orders.forEach(
    (order) => {
      const row =
        document.createElement(
          "tr"
        );

      row.innerHTML = `
        <td>#${order.id}</td>

        <td>
          ${formatDate(
            order.created_at
          )}
        </td>

        <td>
          ৳${Number(
            order.total
          ).toLocaleString()}
        </td>

        <td>
          ${capitalize(
            order.status
          )}
        </td>

        <td>
          <a
            href="/admin/order/${order.id}"
          >
            View
          </a>
        </td>
      `;

      body.appendChild(row);
    }
  );
}


/*
  INITIALIZATION
*/

async function initializeAdmin() {
  const user =
    await protectAdminPage();

  if (!user) {
    return;
  }

  setupSidebar();
  setupLogout();

  const path =
    window.location.pathname;

  try {

    /*
      Dashboard
    */

    if (path === "/admin" || path === "/admin/" || path.endsWith("/dashboard.html")) {
      await loadDashboard();
    }


    /*
      Products
    */

    if (path === "/admin/products" || path.endsWith("/products.html")) {
      await setupProductFilters();
      await loadProducts();
    }


    /*
      Product form
    */

    if (path === "/admin/product/new" || path.endsWith("/product-form.html")) {
      await setupProductForm();
    }


    /*
      Categories
    */

    if (path === "/admin/categories" || path.endsWith("/categories.html")) {
      await setupCategoryFilters();
      await setupCategoryForm();
      await loadCategories();
    }


    /*
      Orders
    */

    if (path === "/admin/orders" || path.endsWith("/orders.html")) {
      await setupOrderFilters();
      await loadOrders();
    }


    /*
      Order details
    */

    if (path.startsWith("/admin/order/") || path.endsWith("/order-details.html")) {
      await setupOrderDetails();
    }


    /*
      Customers
    */

    if (path === "/admin/customers" || path.endsWith("/customers.html")) {
      await setupCustomerFilters();
      await loadCustomers();
    }


    /*
      Customer details
    */

    if (path.startsWith("/admin/customer/") || path.endsWith("/customer-details.html")) {
      await setupCustomerDetails();
    }

    if (path === "/admin/bikes" || path.endsWith("/bikes.html")) {
      // Bike data is handled by bike-admin.js; this shared module supplies auth and shell behavior.
    }

  } catch (error) {

    console.error(
      "Admin page failed:",
      error
    );

    alert(
      error.message ||
      "Failed to load Admin page."
    );
  }
}


async function setupProductFilters() {
  await loadAdminProductCategories();
  const search =
    document.querySelector(
      "#admin-product-search"
    );

  const category =
    document.querySelector(
      "#admin-category-filter"
    );

  const stock =
    document.querySelector(
      "#admin-stock-filter"
    );

  if (category) {
    const categories =
      await loadProductCategories();

    category.innerHTML =
      `<option value="all">
        All Categories
      </option>`;

    categories.forEach(
      (item) => {
        const option =
          document.createElement(
            "option"
          );

        option.value =
          item.id;

        option.textContent =
          item.name;

        category.appendChild(
          option
        );
      }
    );
  }

  const reload =
    debounce(
      loadProducts,
      350
    );

  search?.addEventListener(
    "input",
    reload
  );

  category?.addEventListener(
    "change",
    loadProducts
  );

  stock?.addEventListener(
    "change",
    loadProducts
  );
}


async function setupOrderFilters() {
  const search =
    document.querySelector(
      "#admin-order-search"
    );

  const filter =
    document.querySelector(
      "#admin-order-status-filter"
    );

  search?.addEventListener(
    "input",
    debounce(
      loadOrders,
      350
    )
  );

  filter?.addEventListener(
    "change",
    loadOrders
  );
}


async function setupCustomerFilters() {
  const search =
    document.querySelector(
      "#admin-customer-search"
    );

  search?.addEventListener(
    "input",
    debounce(
      loadCustomers,
      350
    )
  );
}


/*
  HELPERS
*/

function setText(
  selector,
  value
) {
  const element =
    document.querySelector(
      selector
    );

  if (element) {
    element.textContent =
      value ?? "";
  }
}


function setValue(
  selector,
  value
) {
  const element =
    document.querySelector(
      selector
    );

  if (element) {
    element.value =
      value ?? "";
  }
}


function capitalize(value) {
  if (!value) {
    return "";
  }

  return value
    .charAt(0).toUpperCase() +
    value.slice(1);
}


function formatTime(value) {
  if (!value) return "—";
  return new Date(value).toLocaleTimeString("en-BD", { hour: "numeric", minute: "2-digit" });
}


function formatDate(value) {
  if (!value) {
    return "—";
  }

  return new Date(value)
    .toLocaleDateString(
      "en-GB",
      {
        day: "2-digit",
        month: "short",
        year: "numeric"
      }
    );
}


function escapeHtml(value) {
  return String(
    value ?? ""
  )
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}


function debounce(
  callback,
  delay
) {
  let timeout;

  return (...args) => {
    clearTimeout(timeout);

    timeout =
      setTimeout(
        () => callback(...args),
        delay
      );
  };
}


initializeAdmin();

