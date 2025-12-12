// src/store/useAuth.js
import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const useAuth = create((set, get) => ({
  user: null,
  token: null,
  isRestored: false, // prevents UI flicker before loading storage

  // -----------------------------------
  // Save user + token after login
  // -----------------------------------
  login: async ({ user, token }) => {
    await AsyncStorage.setItem("token", token);
    await AsyncStorage.setItem("userProfile", JSON.stringify(user));

    set({ user, token });
  },

  // -----------------------------------
  // Update stored user profile anywhere
  // -----------------------------------
  setUser: async (updatedUser) => {
    await AsyncStorage.setItem("userProfile", JSON.stringify(updatedUser));
    set({ user: updatedUser });
  },

  // -----------------------------------
  // Restore session on app load
  // -----------------------------------
  restoreAuth: async () => {
    try {
      const storedToken = await AsyncStorage.getItem("token");
      const storedUser = await AsyncStorage.getItem("userProfile");

      if (storedToken && storedUser) {
        set({
          token: storedToken,
          user: JSON.parse(storedUser),
          isRestored: true,
        });
      } else {
        set({ isRestored: true });
      }
    } catch (err) {
      console.log("Auth restore error:", err);
      set({ isRestored: true });
    }
  },

  // -----------------------------------
  // Logout for simple flows (NOT full reset)
  // -----------------------------------
  logoutAndReset: async () => {
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("userProfile");

    set({
      user: null,
      token: null,
    });
  },

  // -----------------------------------
  // Full wipe (used in Profile fadeOut)
  // -----------------------------------
  clearAuth: async () => {
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("userProfile");

    set({
      user: null,
      token: null,
    });
  },
}));
