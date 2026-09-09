import { clearAuth } from "../utils/auth.js";
import { showNotification } from "../utils/notification.js";

// Browser sessions use the HttpOnly cookie; avoid stale localStorage bearer tokens overriding it.
const auth = () => ({ "Content-Type": "application/json" });
const body = document.getElementById("bike-admin-body");
const form = document.getElementById("bike-admin-form");
const search = document.getElementById("bike-admin-search");
let bikes = [];
let products = [];

const escapeHtml = (value) => String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");

const request = async (url, options = {}) => {
  const response = await fetch(url, { credentials: "same-origin", ...options, headers: { ...auth(), ...(options.headers || {}) } });
  if (response.status === 401 || response.status === 403) {
    clearAuth(); window.location.href = "/login?next=/admin/bikes"; return null;
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || "Request failed");
  return data;
};

const load = async () => {
  const [bikeData, productData] = await Promise.all([
    request("/api/admin/bikes"),
    request("/api/admin/products?status=all&limit=100")
  ]);
  if (!bikeData || !productData) return;
  bikes = bikeData.bikes || [];
  products = productData.products || [];
  render();
};

const render = () => {
  const term = search.value.trim().toLowerCase();
  body.innerHTML = bikes.filter(b => `${b.make} ${b.model}`.toLowerCase().includes(term)).map(b => `
    <tr>
      <td><strong>${escapeHtml(b.make)} ${escapeHtml(b.model)}</strong></td>
      <td>${escapeHtml(b.year_from || "—")}${b.year_to ? `–${escapeHtml(b.year_to)}` : ""}</td>
      <td><span class="rr-admin-status rr-admin-status-${escapeHtml(b.status)}">${escapeHtml(b.status)}</span></td>
      <td>${Number(b.product_count || 0)}</td>
      <td>
        <button class="rr-btn rr-btn-secondary rr-bike-edit" data-id="${b.id}">Edit</button>
        <button class="rr-btn rr-btn-primary rr-bike-compat" data-id="${b.id}">Products</button>
        <button class="rr-btn rr-btn-secondary rr-bike-delete" data-id="${b.id}">Delete</button>
      </td>
    </tr>
  `).join("") || `<tr><td colspan="5">No motorcycles found.</td></tr>`;

  body.querySelectorAll(".rr-bike-edit").forEach(b => b.onclick = () => edit(Number(b.dataset.id)));
  body.querySelectorAll(".rr-bike-delete").forEach(b => b.onclick = () => remove(Number(b.dataset.id)));
  body.querySelectorAll(".rr-bike-compat").forEach(b => b.onclick = () => compatibility(Number(b.dataset.id)));
};

const edit = (id) => {
  const bike = bikes.find(b => Number(b.id) === id);
  if (!bike) return;
  document.getElementById("bike-id").value = bike.id;
  document.getElementById("bike-make-admin").value = bike.make;
  document.getElementById("bike-model-admin").value = bike.model;
  document.getElementById("bike-year-from").value = bike.year_from || "";
  document.getElementById("bike-year-to").value = bike.year_to || "";
  document.getElementById("bike-status-admin").value = bike.status;
  window.scrollTo({ top: 0, behavior: "smooth" });
};

const remove = async (id) => {
  if (!confirm("Delete this motorcycle and its compatibility assignments?")) return;
  try { await request(`/api/admin/bikes/${id}`, { method: "DELETE" }); await load(); }
  catch (e) { showNotification(e.message, "error"); }
};

const compatibility = async (id) => {
  const bike = bikes.find(b => Number(b.id) === id);
  const current = await request(`/api/bikes/${id}/products`);
  if (!current) return;
  const selected = new Set((current.products || []).map(p => Number(p.id)));
  const lines = products.map(p => `${selected.has(Number(p.id)) ? "[x]" : "[ ]"} ${p.id}: ${p.name}`).join("\n");
  const input = window.prompt(`Enter product IDs separated by commas to mark compatible for ${bike.make} ${bike.model}.\n\nAvailable products:\n${lines}`, [...selected].join(","));
  if (input === null) return;
  const ids = input.split(",").map(v => Number(v.trim())).filter(Number.isInteger);
  try { await request(`/api/admin/bikes/${id}/compatibility`, { method: "PUT", body: JSON.stringify({ productIds: ids }) }); await load(); }
  catch (e) { showNotification(e.message, "error"); }
};

form.addEventListener("submit", async e => {
  e.preventDefault();
  const id = document.getElementById("bike-id").value;
  const payload = {
    make: document.getElementById("bike-make-admin").value.trim(),
    model: document.getElementById("bike-model-admin").value.trim(),
    yearFrom: document.getElementById("bike-year-from").value || null,
    yearTo: document.getElementById("bike-year-to").value || null,
    status: document.getElementById("bike-status-admin").value
  };
  try {
    await request(id ? `/api/admin/bikes/${id}` : "/api/admin/bikes", { method: id ? "PUT" : "POST", body: JSON.stringify(payload) });
    form.reset(); document.getElementById("bike-id").value = ""; await load();
  } catch (e) { showNotification(e.message, "error"); }
});
document.getElementById("bike-cancel").onclick = () => { form.reset(); document.getElementById("bike-id").value = ""; };
search.addEventListener("input", render);

request("/api/auth/me").then(data => {
  const user = data?.user;
  if (!user || user.role !== "admin") { clearAuth(); window.location.href = "/login?next=/admin/bikes"; return; }
  load().catch(e => showNotification(e.message, "error"));
});
