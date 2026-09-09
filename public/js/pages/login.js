import "../components/header.js";
import "../components/footer.js";
import { setAuth } from "../utils/auth.js";

const loginForm = document.getElementById("login-form");
const passwordInput = document.getElementById("login-password");
const passwordToggle = document.querySelector(".rr-password-toggle");

passwordToggle?.addEventListener("click", () => {
  const visible = passwordInput.type === "password";
  passwordInput.type = visible ? "text" : "password";
  passwordToggle.innerHTML = visible
    ? '<i class="bi bi-eye-slash"></i>'
    : '<i class="bi bi-eye"></i>';
  passwordToggle.setAttribute("aria-label", visible ? "Hide password" : "Show password");
});

loginForm?.addEventListener("submit", async (event) => {
  event.preventDefault();

  const email = document.getElementById("login-email")?.value.trim().toLowerCase();
  const password = passwordInput?.value || "";
  const button = loginForm.querySelector(".rr-auth-submit");

  if (!email || !password) {
    alert("Please enter your email and password.");
    return;
  }

  const original = button?.innerHTML || "Sign In";
  if (button) {
    button.disabled = true;
    button.innerHTML = "Signing In...";
  }

  try {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok || !data.success || !data.token) {
      throw new Error(data.message || "Login failed. Please check your credentials.");
    }

    setAuth({ token: data.token, user: data.user });

    const next = new URLSearchParams(window.location.search).get("next");
    if (next && next.startsWith("/") && !next.startsWith("//")) {
      window.location.assign(next);
      return;
    }

    window.location.assign(
      data.user?.role === "admin" ? "/admin" : "/account"
    );
  } catch (error) {
    console.error("Login failed:", error);
    alert(error.message || "Unable to connect to the server. Please try again.");
  } finally {
    if (button) {
      button.disabled = false;
      button.innerHTML = original;
    }
  }
});
