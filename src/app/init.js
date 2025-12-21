// src/app/init.js
import { registerRoute, renderRoute } from "./router.js";
import { renderLogin } from "../auth/login.ui.js";
import { renderRegister } from "../auth/register.ui.js";
import { renderHome } from "../home/home.ui.js";

// Register all routes
export const initRoutes = () => {
  // Public routes
  registerRoute("/", renderLogin, false);
  registerRoute("/login", renderLogin, false);
  registerRoute("/register", renderRegister, false);

  // Protected routes (require authentication)
  registerRoute("/home", renderHome, true);

  // Render initial route
  renderRoute();
};
