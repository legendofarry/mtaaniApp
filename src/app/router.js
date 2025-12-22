const routes = {};
let currentLayout = null;
let currentRoute = null;

export const registerRoute = (
  path,
  render,
  requiresAuth = false,
  layout = null
) => {
  routes[path] = { render, requiresAuth, layout };
};

export const navigate = (path) => {
  window.history.pushState({}, "", path);
  renderRoute();
};

export const renderRoute = async () => {
  const path = window.location.pathname;

  // fallback route
  const route = routes[path] || routes["/login"];

  if (!route) {
    console.error(`No route found for path: ${path}`);
    return;
  }

  // 🔐 Auth guard
  if (route.requiresAuth) {
    const { isAuthenticated } = await import("../services/auth.service.js");

    if (!isAuthenticated()) {
      return navigate("/login");
    }
  }

  // 🧱 Render layout ONCE
  if (route.layout && currentLayout !== route.layout) {
    currentLayout = route.layout;
    await route.layout();
  }

  currentRoute = path;

  try {
    await route.render();
  } catch (error) {
    console.error("Error rendering route:", error);
  }
};

export const getCurrentRoute = () => currentRoute;

// Browser navigation
window.addEventListener("popstate", renderRoute);

// SPA links
document.addEventListener("click", (e) => {
  const link = e.target.closest("[data-link]");
  if (!link) return;

  e.preventDefault();
  navigate(link.getAttribute("href"));
});
