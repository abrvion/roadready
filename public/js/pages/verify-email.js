import "../components/header.js";
import "../components/footer.js";

const title = document.getElementById("verify-title");
const message = document.getElementById("verify-message");
const action = document.getElementById("verify-action");
const token = new URLSearchParams(location.search).get("token");

try {
  if (!token) throw new Error("This verification link is invalid or missing.");
  const response = await fetch(`/api/auth/verify-email?token=${encodeURIComponent(token)}`);
  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.success) throw new Error(data.message || "Unable to verify email.");
  title.textContent = "Email verified";
  message.textContent = "Your RoadReady account is now active. You can sign in and start shopping.";
} catch (error) {
  title.textContent = "Verification failed";
  message.textContent = error.message || "This verification link is invalid or expired.";
  action.textContent = "Back to Sign In";
}
