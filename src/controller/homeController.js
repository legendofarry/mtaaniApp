// src/controllers/homeController.js
import { logout } from "../services/auth.service.js";
import { navigate } from "../app/router.js";

export const handleLogout = async (e) => {
  e.preventDefault();

  const result = await logout();

  if (result.success) {
    navigate("/login");
  }
};

export const getUserInfo = () => {
  return getCurrentUser();
};
