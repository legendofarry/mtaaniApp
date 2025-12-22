// src/main.js
import { initRoutes } from "./app/init.js";
import { initAuthListener } from "./services/auth.service.js";
import { initLoadingScreen, showAppContent } from "./utils/loading.js";
import "/main.css";

// Initialize the application
const initApp = async () => {
  // Initialize loading screen
  initLoadingScreen();

  // Wait for Firebase auth to initialize
  await initAuthListener();

  // Initialize routes
  initRoutes();

  // Show app content and hide loading screen
  setTimeout(() => {
    showAppContent();
  }, 1000);
};

// Start the app
initApp().catch((error) => {
  console.error("Failed to initialize app:", error);
});
