// src/app/router.js
const routes = {};
let currentRoute = null;

export const registerRoute = (path, render, requiresAuth = false) => {
  routes[path] = { render, requiresAuth };
};

export const navigate = (path) => {
  window.history.pushState({}, "", path);
  renderRoute();
};

export const renderRoute = async () => {
  const path = window.location.pathname;
  const route = routes[path] || routes["/"];

  if (!route) {
    console.error(`No route found for path: ${path}`);
    return;
  }

  // Check authentication if required
  if (route.requiresAuth) {
    const { isAuthenticated } = await import("../services/auth.service.js");
    const authenticated = await isAuthenticated();

    if (!authenticated) {
      navigate("/login");
      return;
    }
  }

  currentRoute = path;

  try {
    await route.render();
  } catch (error) {
    console.error("Error rendering route:", error);
  }
};

export const getCurrentRoute = () => currentRoute;

// Handle browser back/forward buttons
window.addEventListener("popstate", renderRoute);

// Handle link clicks for SPA navigation
document.addEventListener("click", (e) => {
  if (e.target.matches("[data-link]")) {
    e.preventDefault();
    navigate(e.target.getAttribute("href"));
  }
});
