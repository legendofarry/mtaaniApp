// src/controllers/homeController.js
import { logout } from "../services/auth.service.js";
import { navigate } from "../app/router.js";

export const handleLogout = async (e) => {
  // Support being called directly (no event) or as an event handler
  if (e && typeof e.preventDefault === "function") {
    e.preventDefault();
  }

  const result = await logout();

  if (result && result.success) {
    navigate("/login");
  }
};

export const getUserInfo = () => {
  return getCurrentUser();
};
