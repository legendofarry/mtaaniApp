// src/services/api.js
import { Platform } from "react-native";
import Constants from "expo-constants";

/**
 * Resolve API base URL safely across:
 * - Web
 * - Android emulator
 * - Real device (LAN)
 * - Production
 */
const getBaseUrl = () => {
  // 1️⃣ Production / EAS / Expo extra
  const extraApiUrl = Constants?.expoConfig?.extra?.API_URL;
  if (extraApiUrl) {
    return extraApiUrl;
  }

  // 2️⃣ Web (always localhost)
  if (Platform.OS === "web") {
    return "http://localhost:4000";
  }

  // 3️⃣ Android emulator special localhost
  if (Platform.OS === "android") {
    return "http://10.0.2.2:4000";
  }

  // 4️⃣ Real device fallback (LAN IP – CHANGE IF NEEDED)
  return "http://10.23.71.142:4000";
};

// Final base URL
const BASE_URL = getBaseUrl();

// Public API URL
export const API_URL = `${BASE_URL}/api`;

// Standard JSON headers (with optional auth token)
export const headers = (token) => ({
  "Content-Type": "application/json",
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
});
