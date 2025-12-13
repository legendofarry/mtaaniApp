import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL, headers } from "../services/api";

export const useAuth = create((set, get) => ({
  user: null,
  token: null,
  isRestored: false,
  shouldShowPostAuthSplash: false, // ⭐ NEW

  restoreAuth: async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const user = await AsyncStorage.getItem("user");

      if (token && user) {
        set({
          token,
          user: JSON.parse(user),
          isRestored: true,
          shouldShowPostAuthSplash: false, // ❗ cold start → no splash
        });
      } else {
        set({ isRestored: true });
      }
    } catch {
      set({ isRestored: true });
    }
  },

  login: async ({ token }) => {
    await AsyncStorage.setItem("token", token);
    set({ token });

    const res = await fetch(`${API_URL}/users/me`, {
      headers: headers(token),
    });

    const data = await res.json();
    const user = data.user || data;

    await AsyncStorage.setItem("user", JSON.stringify(user));
    set({
      user,
      shouldShowPostAuthSplash: true, // ⭐ after login
    });
  },

  completeOnboarding: async () => {
    const { user } = get();
    if (!user) return;

    const updatedUser = {
      ...user,
      onboardingCompleted: true,
    };

    await AsyncStorage.setItem("user", JSON.stringify(updatedUser));
    set({
      user: updatedUser,
      shouldShowPostAuthSplash: true, // ⭐ after onboarding
    });
  },

  clearPostAuthSplash: () => {
    set({ shouldShowPostAuthSplash: false });
  },

  logoutAndReset: async () => {
    await AsyncStorage.multiRemove(["token", "user"]);
    set({
      token: null,
      user: null,
      shouldShowPostAuthSplash: false,
    });
  },
}));
