// src/components/toast.js
let container;

const ensure = () => {
  if (container) return container;
  container = document.createElement("div");
  container.id = "toast-container";
  container.style.position = "fixed";
  container.style.right = "16px";
  container.style.top = "16px";
  container.style.zIndex = 99999;
  container.style.display = "flex";
  container.style.flexDirection = "column";
  container.style.gap = "8px";
  document.body.appendChild(container);
  return container;
};

export const showToast = (message, type = "info", duration = 3500) => {
  const c = ensure();
  const el = document.createElement("div");
  el.className = `toast toast-${type}`;
  el.style.padding = "10px 14px";
  el.style.borderRadius = "10px";
  el.style.boxShadow = "0 6px 18px rgba(15,23,42,0.12)";
  el.style.color = "#fff";
  el.style.minWidth = "180px";
  el.style.maxWidth = "320px";
  el.style.fontSize = "14px";
  el.style.opacity = "0";
  el.style.transform = "translateY(-6px)";
  el.style.transition = "all 240ms ease";

  const bg =
    type === "success"
      ? getComputedStyle(document.documentElement).getPropertyValue(
          "--success-color"
        ) || "#10b981"
      : type === "error"
      ? getComputedStyle(document.documentElement).getPropertyValue(
          "--error-color"
        ) || "#ef4444"
      : type === "warning"
      ? getComputedStyle(document.documentElement).getPropertyValue(
          "--warning-color"
        ) || "#f59e0b"
      : getComputedStyle(document.documentElement).getPropertyValue(
          "--primary-color"
        ) || "#4f46e5";

  el.style.background = bg.trim();
  el.textContent = message;

  c.appendChild(el);

  // enter via CSS class
  requestAnimationFrame(() => el.classList.add("show"));

  const timeout = setTimeout(() => {
    // exit
    el.classList.remove("show");
    setTimeout(() => el.remove(), 280);
  }, duration);

  // click to dismiss
  el.onclick = () => {
    clearTimeout(timeout);
    el.classList.remove("show");
    setTimeout(() => el.remove(), 180);
  };

  return () => {
    clearTimeout(timeout);
    el.remove();
  };
};

export default showToast;
