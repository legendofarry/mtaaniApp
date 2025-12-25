// src/services/auth.store.js
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../config/firebase.js";

let authUser = null;
let initialized = false;
let initPromise = null;
const listeners = new Set();

/**
 * Initialize Firebase auth listener (run ONCE on app start)
 */
export const initAuthStore = () => {
  if (initPromise) return initPromise;

  initPromise = new Promise((resolve) => {
    let resolved = false;
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      authUser = user;
      initialized = true;

      listeners.forEach((cb) => cb(user));

      if (!resolved) {
        resolve(user);
        resolved = true;
      }
      // keep the listener active so `subscribeAuth` receivers get future updates
    });
  });

  return initPromise;
};

/**
 * Get current authenticated user (sync)
 */
export const getAuthUser = () => authUser;

/**
 * Check if auth has initialized
 */
export const isAuthReady = () => initialized;

/**
 * Wait until auth is ready (useful for screens)
 */
export const waitForAuth = async () => {
  if (initialized) return authUser;
  return await initAuthStore();
};

/**
 * Subscribe to auth changes
 */
export const subscribeAuth = (callback) => {
  listeners.add(callback);
  return () => listeners.delete(callback);
};
