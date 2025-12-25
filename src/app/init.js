import { registerRoute } from "./router.js";

import { renderLogin } from "../auth/login.ui.js";
import { renderRegister } from "../auth/register.ui.js";

import { renderMainLayout } from "../screens/layouts/main.layout.js";

import { renderHome } from "../home/home.ui.js";
import { renderWater } from "../screens/water.ui.js";
import { renderElectricity } from "../screens/electricity.ui.js";
import { renderProfile } from "../screens/profile.ui.js";

export const initRoutes = () => {
  // Public
  registerRoute("/login", renderLogin);
  registerRoute("/register", renderRegister);

  // Protected (via layout)
  registerRoute("/home", renderHome, renderMainLayout);
  registerRoute("/water", renderWater, renderMainLayout);
  registerRoute("/electricity", renderElectricity, renderMainLayout);
  registerRoute("/profile", renderProfile, renderMainLayout);
};
