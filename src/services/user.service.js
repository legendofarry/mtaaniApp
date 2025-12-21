// src/services/userService.js
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db } from "../config/firebase.js";
import { getCurrentUser } from "./auth.service.js";

// Get user data from Firestore
export const getUserData = async (uid) => {
  try {
    const userRef = doc(db, "users", uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      return { success: true, data: userSnap.data() };
    } else {
      return { success: false, error: "User not found" };
    }
  } catch (error) {
    console.error("Error fetching user data:", error);
    return { success: false, error: error.message };
  }
};

// Get current user's data from Firestore
export const getCurrentUserData = async () => {
  const user = getCurrentUser();
  if (!user) {
    return { success: false, error: "No user logged in" };
  }
  return await getUserData(user.uid);
};

// Update user profile in Firestore
export const updateUserProfile = async (uid, updates) => {
  try {
    const userRef = doc(db, "users", uid);
    await updateDoc(userRef, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
    return { success: true };
  } catch (error) {
    console.error("Error updating profile:", error);
    return { success: false, error: error.message };
  }
};

// Get all users (for admin)
export const getAllUsers = async () => {
  try {
    const usersRef = collection(db, "users");
    const querySnapshot = await getDocs(usersRef);

    const users = [];
    querySnapshot.forEach((doc) => {
      users.push(doc.data());
    });

    return { success: true, users };
  } catch (error) {
    console.error("Error fetching users:", error);
    return { success: false, error: error.message };
  }
};

// Get users by role
export const getUsersByRole = async (role) => {
  try {
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("role", "==", role));
    const querySnapshot = await getDocs(q);

    const users = [];
    querySnapshot.forEach((doc) => {
      users.push(doc.data());
    });

    return { success: true, users };
  } catch (error) {
    console.error("Error fetching users by role:", error);
    return { success: false, error: error.message };
  }
};

// Check if user exists in Firestore
export const userExists = async (uid) => {
  try {
    const userRef = doc(db, "users", uid);
    const userSnap = await getDoc(userRef);
    return userSnap.exists();
  } catch (error) {
    console.error("Error checking user existence:", error);
    return false;
  }
};
