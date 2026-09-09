import "../components/header.js";
import "../components/footer.js";

const token = localStorage.getItem("token");
const form = document.getElementById("profile-form");
if (!token) window.location.href = "/login";

const firstName = document.getElementById("profile-first-name");
const lastName = document.getElementById("profile-last-name");
const email = document.getElementById("profile-email");
const phone = document.getElementById("profile-phone");

const load = async () => {
  try {
    const response = await fetch("/api/users/me", { headers: { Authorization: `Bearer ${token}` } });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Unable to load profile");
    const parts = String(data.user.name || "").trim().split(/\s+/);
    firstName.value = parts.shift() || "";
    lastName.value = parts.join(" ");
    email.value = data.user.email || "";
    phone.value = data.user.phone || "";
    localStorage.setItem("user", JSON.stringify(data.user));
  } catch (error) {
    if (error.message === "Invalid or expired token" || error.message === "Authentication required") {
      fetch("/api/auth/logout", { method: "POST", credentials: "same-origin" }).catch(() => {}); localStorage.removeItem("token"); localStorage.removeItem("user"); window.location.href = "/login"; return;
    }
    alert(error.message || "Unable to load profile");
  }
};

form?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const button = form.querySelector("button[type=submit]");
  const original = button.innerHTML;
  try {
    button.disabled = true; button.textContent = "Saving...";
    const name = `${firstName.value.trim()} ${lastName.value.trim()}`.trim();
    const response = await fetch("/api/users/me", {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ name, email: email.value.trim(), phone: phone.value.trim() })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Unable to update profile");
    localStorage.setItem("user", JSON.stringify(data.user));
    alert("Profile updated successfully.");
  } catch (error) { alert(error.message || "Unable to update profile"); }
  finally { button.disabled = false; button.innerHTML = original; }
});

load();
