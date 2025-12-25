// src/services/auth.service.js
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import { auth } from "../config/firebase.js";

// Return shape: { success: true, user } or { success: false, error }
export const login = async (email, password) => {
  try {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: cred.user };
  } catch (err) {
    return { success: false, error: err.message || "Login failed" };
  }
};

export const register = async (email, password, displayName) => {
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password);

    if (displayName) {
      try {
        await updateProfile(cred.user, { displayName });
      } catch (e) {
        // Non-fatal: profile update failed
        console.warn("updateProfile failed:", e);
      }
    }

    return { success: true, user: cred.user };
  } catch (err) {
    // Normalize common Firebase errors for UI
    let message = err.message || "Registration failed";
    if (err.code === "auth/email-already-in-use") {
      message = "Email already in use";
    }

    return { success: false, error: message };
  }
};

export const logout = async () => {
  await signOut(auth);
};
