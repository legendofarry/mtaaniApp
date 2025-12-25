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
 * Falls back to a local biometric session when Firebase auth is not set
 */
export const getAuthUser = () => {
  if (authUser) return authUser;
  try {
    const s = localStorage.getItem("webauthn_session");
    if (!s) return authUser;
    const parsed = JSON.parse(s);
    // Return a minimal user-like object so callers can read uid/email
    return {
      uid: parsed.uid,
      email: parsed.email,
      _biometric: true,
    };
  } catch (e) {
    return authUser;
  }
};

/**
 * Check if auth has initialized
 */
export const isAuthReady = () => initialized;

/**
 * Emit a local auth change (useful for biometric-only sessions)
 */
export const emitLocalAuth = (user) => {
  listeners.forEach((cb) => cb(user));
};

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
