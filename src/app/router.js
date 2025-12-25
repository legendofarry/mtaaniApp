const routes = {};
let currentLayout = null;
let currentRoute = null;

export const registerRoute = (path, render, layout = null) => {
  routes[path] = { render, layout };
};

export const navigate = (path) => {
  window.history.pushState({}, "", path);
  renderRoute();
};

export const renderRoute = async () => {
  const path = window.location.pathname;

  // fallback route
  const route = routes[path] || routes["/login"];
  if (!route) return;

  // 🧱 Render layout ONCE
  if (route.layout && currentLayout !== route.layout) {
    currentLayout = route.layout;
    await route.layout();
  }

  currentRoute = path;

  try {
    await route.render();
  } catch (error) {
    console.error("Route render error:", error);
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
