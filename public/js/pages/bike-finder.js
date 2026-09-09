import "../components/header.js";
import "../components/footer.js";
import { createProductGrid, initializeProductGrid } from "../components/product-grid.js";

const makeSelect = document.getElementById("bike-make");
const modelSelect = document.getElementById("bike-model");
const yearSelect = document.getElementById("bike-year");
const form = document.getElementById("bike-finder-form");
const results = document.getElementById("bike-finder-results");
const resultTitle = document.getElementById("bike-finder-result-title");
const resultCount = document.getElementById("bike-finder-result-count");
const productGrid = document.getElementById("bike-finder-product-grid");
const empty = document.getElementById("bike-finder-empty");
const resetButton = document.getElementById("bike-finder-reset");

let bikes = [];

const escape = (value) => String(value ?? "").replace(/[&<>"']/g, c => ({
  "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
}[c]));

const loadBikes = async () => {
  const response = await fetch("/api/bikes");
  const data = await response.json();
  if (!response.ok || !data.success) throw new Error(data.message || "Unable to load bikes");
  bikes = data.bikes || [];

  const makes = [...new Set(bikes.map(b => b.make))].sort();
  makeSelect.innerHTML = '<option value="">Select make</option>' +
    makes.map(make => `<option value="${escape(make)}">${escape(make)}</option>`).join("");
};

const updateModels = () => {
  const make = makeSelect.value;
  const models = bikes.filter(b => b.make === make);
  modelSelect.disabled = !make;
  modelSelect.innerHTML = '<option value="">Select model</option>' +
    models.map(b => `<option value="${b.id}">${escape(b.model)}</option>`).join("");
  yearSelect.disabled = true;
  yearSelect.innerHTML = '<option value="">Select year</option>';
};

const updateYears = () => {
  const bike = bikes.find(b => Number(b.id) === Number(modelSelect.value));
  if (!bike) return;
  const from = bike.year_from || new Date().getFullYear();
  const to = bike.year_to || new Date().getFullYear();
  const years = [];
  for (let y = to; y >= from; y--) years.push(y);
  yearSelect.disabled = false;
  yearSelect.innerHTML = '<option value="">Select year</option>' +
    years.map(y => `<option value="${y}">${y}</option>`).join("");
};

const findParts = async () => {
  const bikeId = modelSelect.value;
  if (!bikeId) {
    alert("Please select your motorcycle.");
    return;
  }

  const response = await fetch(`/api/bikes/${bikeId}/products`);
  const data = await response.json();
  if (!response.ok || !data.success) throw new Error(data.message || "Unable to find compatible products");

  const bike = data.bike;
  const products = data.products || [];
  resultTitle.textContent = `${bike.make} ${bike.model}`;
  resultCount.textContent = `${products.length} compatible product${products.length === 1 ? "" : "s"}`;

  productGrid.innerHTML = products.length
    ? createProductGrid(products)
    : "";
  empty.hidden = products.length !== 0;
  results.hidden = false;

  if (products.length) initializeProductGrid(productGrid);
  results.scrollIntoView({ behavior: "smooth", block: "start" });
};

makeSelect?.addEventListener("change", updateModels);
modelSelect?.addEventListener("change", updateYears);

form?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const button = form.querySelector("button[type=submit]");
  const original = button.innerHTML;
  try {
    button.disabled = true;
    button.innerHTML = '<i class="bi bi-hourglass-split"></i> Finding Parts...';
    await findParts();
  } catch (error) {
    console.error(error);
    alert(error.message || "Unable to find compatible products.");
  } finally {
    button.disabled = false;
    button.innerHTML = original;
  }
});

resetButton?.addEventListener("click", () => {
  form.reset();
  modelSelect.disabled = true;
  yearSelect.disabled = true;
  modelSelect.innerHTML = '<option value="">Select model</option>';
  yearSelect.innerHTML = '<option value="">Select year</option>';
  results.hidden = true;
});

loadBikes().catch(error => {
  console.error(error);
  alert("Bike Finder is temporarily unavailable.");
});
