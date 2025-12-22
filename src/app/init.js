// src/app/init.js
import { registerRoute, renderRoute } from "./router.js";
import { renderLogin } from "../auth/login.ui.js";
import { renderRegister } from "../auth/register.ui.js";
import { renderHome } from "../home/home.ui.js";
import { renderMainLayout } from "../screens/layouts/main.layout.js";

import { renderWater } from "../screens/water.ui.js";
import { renderElectricity } from "../screens/electricity.ui.js";
import { renderProfile } from "../screens/profile.ui.js";

// Register all routes
export const initRoutes = () => {
  // Public routes
  registerRoute("/", renderLogin, false);
  registerRoute("/login", renderLogin, false);
  registerRoute("/register", renderRegister, false);

  // Protected routes (require authentication)
  //   registerRoute("/home", renderHome, true);

  registerRoute("/home", renderHome, true, renderMainLayout);
  registerRoute("/water", renderWater, true, renderMainLayout);
  registerRoute("/electricity", renderElectricity, true, renderMainLayout);
  registerRoute("/profile", renderProfile, true, renderMainLayout);

  // Render initial route
  renderRoute();
};
