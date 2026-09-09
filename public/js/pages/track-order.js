import "../components/header.js";
import "../components/footer.js";

const form = document.getElementById("track-order-form");
const orderStatus = document.getElementById("order-status");
const orderNumberInput = document.getElementById("track-order-number");
const emailInput = document.getElementById("track-order-email");
const trackedOrderNumber = document.getElementById("tracked-order-number");

form?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const orderNumber = orderNumberInput.value.trim().toUpperCase();
  const email = emailInput.value.trim().toLowerCase();
  const button = form.querySelector("button[type=submit]");
  const original = button.innerHTML;

  try {
    button.disabled = true;
    button.textContent = "Checking...";
    const response = await fetch(`/api/track?orderNumber=${encodeURIComponent(orderNumber)}&email=${encodeURIComponent(email)}`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Order not found");
    trackedOrderNumber.textContent = data.order.order_number;
    const normalizedStatus = String(data.order.status || "pending").toLowerCase();
    const statusElement = orderStatus.querySelector("[data-track-status]") || orderStatus.querySelector("strong");
    if (statusElement) statusElement.textContent = normalizedStatus === "shipped" ? "In Transit" : normalizedStatus.replace(/^./, (c) => c.toUpperCase());
    const steps = Array.from(orderStatus.querySelectorAll(".rr-order-step"));
    const order = ["pending", "processing", "shipped", "delivered"];
    const currentIndex = order.indexOf(normalizedStatus);
    steps.forEach((step, index) => {
      step.classList.remove("is-complete", "is-active");
      if (normalizedStatus === "cancelled") return;
      if (index < currentIndex) step.classList.add("is-complete");
      if (index === currentIndex) step.classList.add("is-active");
    });
    orderStatus.hidden = false;
    orderStatus.scrollIntoView({ behavior: "smooth", block: "start" });
  } catch (error) {
    orderStatus.hidden = true;
    alert(error.message || "Unable to track order");
  } finally {
    button.disabled = false;
    button.innerHTML = original;
  }
});
