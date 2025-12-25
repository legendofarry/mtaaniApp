// src/main.js
import { initRoutes } from "./app/init.js";
import { renderRoute, navigate } from "./app/router.js";
import { initAuthStore, subscribeAuth } from "./services/auth.store.js";
import { initLoadingScreen, showAppContent } from "./utils/loading.js";

const initApp = async () => {
  initLoadingScreen();

  // 🔐 Wait for Firebase auth to initialize
  await initAuthStore();

  // Initialize routes
  initRoutes();

  // 🔁 React to auth changes globally
  subscribeAuth((user) => {
    if (!user) {
      navigate("/login");
    } else {
      // Only redirect if user is on auth pages
      const path = window.location.pathname;
      if (path === "/login" || path === "/register") {
        navigate("/home");
      }
    }
  });

  // Initial render
  renderRoute();

  showAppContent();
};

initApp().catch(console.error);
