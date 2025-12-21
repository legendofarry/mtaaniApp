// src/services/auth.service.js
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../config/firebase.js";
import { showLoading, hideLoading } from "../utils/loading.js";

let currentUser = null;

// Initialize auth state listener
export const initAuthListener = () => {
  return new Promise((resolve) => {
    onAuthStateChanged(auth, (user) => {
      currentUser = user;
      resolve(user);
    });
  });
};

// Check if user is authenticated
export const isAuthenticated = async () => {
  return new Promise((resolve) => {
    onAuthStateChanged(auth, (user) => {
      resolve(!!user);
    });
  });
};

// Get current user
export const getCurrentUser = () => {
  return currentUser || auth.currentUser;
};

// Login function
export const login = async (email, password) => {
  try {
    showLoading("Logging in...");
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    currentUser = userCredential.user;
    hideLoading();
    return { success: true, user: userCredential.user };
  } catch (error) {
    hideLoading();
    return { success: false, error: getErrorMessage(error.code) };
  }
};

// Register function
export const register = async (email, password, displayName) => {
  try {
    showLoading("Creating account...");

    // Create user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    // Update profile with display name
    await updateProfile(userCredential.user, {
      displayName: displayName,
    });

    // Add user data to Firestore
    await setDoc(doc(db, "users", userCredential.user.uid), {
      uid: userCredential.user.uid,
      email: userCredential.user.email,
      displayName: displayName,
      createdAt: new Date().toISOString(),
      role: "user",
      status: "active",
    });

    currentUser = userCredential.user;
    hideLoading();
    return { success: true, user: userCredential.user };
  } catch (error) {
    hideLoading();
    return { success: false, error: getErrorMessage(error.code) };
  }
};

// Logout function
export const logout = async () => {
  try {
    showLoading("Logging out...");
    await signOut(auth);
    currentUser = null;
    hideLoading();
    return { success: true };
  } catch (error) {
    hideLoading();
    return { success: false, error: getErrorMessage(error.code) };
  }
};

// Get user-friendly error messages
const getErrorMessage = (errorCode) => {
  const errorMessages = {
    "auth/invalid-email": "Invalid email address",
    "auth/user-disabled": "This account has been disabled",
    "auth/user-not-found": "No account found with this email",
    "auth/wrong-password": "Incorrect password",
    "auth/email-already-in-use": "Email already in use",
    "auth/weak-password": "Password should be at least 6 characters",
    "auth/network-request-failed":
      "Network error. Please check your connection",
    "auth/too-many-requests": "Too many attempts. Please try again later",
    "auth/invalid-credential": "Invalid email or password",
  };

  return errorMessages[errorCode] || "An error occurred. Please try again";
};
