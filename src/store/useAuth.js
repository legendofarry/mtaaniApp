import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL, headers } from "../services/api";

export const useAuth = create((set) => ({
  user: null,
  token: null,
  isRestored: false,

  restoreAuth: async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const user = await AsyncStorage.getItem("user");

      if (token && user) {
        set({
          token,
          user: JSON.parse(user),
          isRestored: true,
        });
      } else {
        set({ isRestored: true });
      }
    } catch {
      set({ isRestored: true });
    }
  },

  login: async ({ token }) => {
    // 1️⃣ Save token first
    await AsyncStorage.setItem("token", token);
    set({ token });

    // 2️⃣ Fetch authoritative user profile
    const res = await fetch(`${API_URL}/users/me`, {
      headers: headers(token),
    });

    const data = await res.json();
    const user = data.user || data;

    // 3️⃣ Save correct user
    await AsyncStorage.setItem("user", JSON.stringify(user));
    set({ user });
  },

  logoutAndReset: async () => {
    await AsyncStorage.multiRemove(["token", "user"]);
    set({ token: null, user: null });
  },
}));
