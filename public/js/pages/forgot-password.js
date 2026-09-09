import "../components/header.js";
import "../components/footer.js";

const form = document.getElementById("forgot-password-form");
const emailInput = document.getElementById("forgot-email");

form?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const email = emailInput.value.trim();
  const button = form.querySelector('button[type="submit"]');
  const original = button.innerHTML;

  if (!email) return;
  try {
    button.disabled = true;
    button.textContent = "Sending...";
    const response = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Unable to process password reset");
    alert(data.message || "If an account exists for that email, password reset instructions have been sent.");
  } catch (error) {
    console.error("Forgot password error:", error);
    alert(error.message || "Something went wrong. Please try again.");
  } finally {
    button.disabled = false;
    button.innerHTML = original;
  }
});
