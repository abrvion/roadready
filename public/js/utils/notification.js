// RoadReady application notifications. Browser alerts are replaced with a polished modal.
const escapeHtml = (value) => String(value ?? "")
  .replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;").replaceAll("'", "&#039;");

let alertRoot;

const ensureRoot = () => {
  if (alertRoot?.isConnected) return alertRoot;
  alertRoot = document.createElement("div");
  alertRoot.id = "rr-alert-root";
  document.body.appendChild(alertRoot);
  return alertRoot;
};

export function showNotification(message, type = "success") {
  const notification = document.createElement("div");
  const icon = type === "error" ? "bi-exclamation-circle-fill" : type === "info" ? "bi-info-circle-fill" : "bi-check-circle-fill";
  notification.className = `rr-notification rr-notification-${type}`;
  notification.innerHTML = `<i class="bi ${icon}"></i><span>${escapeHtml(message)}</span>`;
  document.body.appendChild(notification);
  requestAnimationFrame(() => notification.classList.add("show"));
  window.setTimeout(() => {
    notification.classList.remove("show");
    window.setTimeout(() => notification.remove(), 250);
  }, 2800);
}

export function showAlertModal(message, { title = "RoadReady", type = "info" } = {}) {
  const root = ensureRoot();
  const modal = document.createElement("div");
  const icon = type === "error" ? "bi-exclamation-triangle-fill" : type === "success" ? "bi-check-circle-fill" : "bi-info-circle-fill";
  modal.className = "rr-alert-modal";
  modal.innerHTML = `<div class="rr-alert-backdrop"></div><section class="rr-alert-dialog" role="alertdialog" aria-modal="true" aria-labelledby="rr-alert-title"><div class="rr-alert-icon rr-alert-icon-${type}"><i class="bi ${icon}"></i></div><h2 id="rr-alert-title">${escapeHtml(title)}</h2><p>${escapeHtml(message)}</p><button type="button" class="rr-btn rr-btn-primary rr-alert-ok">OK</button></section>`;
  root.appendChild(modal);
  const close = () => { modal.classList.add("is-closing"); setTimeout(() => modal.remove(), 180); };
  modal.querySelector(".rr-alert-ok").addEventListener("click", close);
  modal.querySelector(".rr-alert-backdrop").addEventListener("click", close);
  modal.addEventListener("keydown", e => { if (e.key === "Escape" || e.key === "Enter") close(); });
  modal.tabIndex = -1;
  modal.focus();
}

if (typeof window !== "undefined" && !window.__roadreadyAlertPatched) {
  window.__roadreadyAlertPatched = true;
  window.alert = (message) => showAlertModal(message);
}
