// src\store\useAuth.js
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

  login: async (user, accessToken) => {
    if (!accessToken) {
      console.warn("⚠️ login called without token");
      return;
    }

    // Persist session
    await AsyncStorage.setItem("token", accessToken);
    await AsyncStorage.setItem("user", JSON.stringify(user));

    // Update store
    set({
      token: accessToken,
      user,
      shouldShowPostAuthSplash: true,
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
