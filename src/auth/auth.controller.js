// src\auth\auth.controller.js
import { register, login } from "../services/auth.service";
import { createUserProfile, getUserProfile } from "../services/user.service";
import { showLoading, hideLoading } from "../ui/loading";
import { navigate } from "../app/router";
import { showToast } from "../components/toast";

export const register = async ({ email, password, name }) => {
  try {
    showLoading();

    const res = await register(email, password, name);

    if (!res || !res.success) {
      showToast(res?.error || "Registration failed", "error");
      return;
    }

    try {
      await createUserProfile(res.user.uid, { email, name });
    } catch (e) {
      console.error("createUserProfile failed:", e);
      showToast("Account created, but profile setup failed.", "warning");
    }

    navigate("/home");
  } finally {
    hideLoading();
  }
};

export const login = async ({ email, password }) => {
  try {
    showLoading();

    const res = await login(email, password);

    if (!res || !res.success) {
      showToast(res?.error || "Login failed", "error");
      return;
    }

    try {
      await getUserProfile(res.user.uid);
    } catch (e) {
      // If profile fetch fails, continue — profile creation may be handled elsewhere
      console.warn("getUserProfile failed:", e);
    }

    navigate("/home");
  } finally {
    hideLoading();
  }
};
