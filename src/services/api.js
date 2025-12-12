// src/services/api.js
import { Platform } from "react-native";

// For local development - update these when you deploy
const DEV_BASE_URL =
  Platform.OS === "web"
    ? "http://localhost:4000" // Web uses localhost
    : "http://10.23.71.142:4000"; // Mobile uses your PC's IP

// TODO: Replace with your production URL when deployed
const PROD_BASE_URL = "https://api.yourdomain.com";

// Use DEV for now, switch to PROD when deployed
const BASE_URL = __DEV__ ? DEV_BASE_URL : PROD_BASE_URL;

export const API_URL = `${BASE_URL}/api`;

// Standard JSON headers (with optional auth token)
export const headers = (token) => ({
  "Content-Type": "application/json",
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
});
