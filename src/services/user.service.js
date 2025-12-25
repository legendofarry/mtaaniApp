// src/services/userService.js
import {
  doc,
  getDoc,
  updateDoc,
  setDoc,
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db } from "../config/firebase.js";
import { getAuthUser } from "./auth.store.js";

/**
 * Get user data by UID
 */
export const getUserData = async (uid) => {
  const userRef = doc(db, "users", uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    return null;
  }

  return userSnap.data();
};

/**
 * Get currently authenticated user's Firestore profile
 */
export const getCurrentUserData = async () => {
  const user = getAuthUser();

  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    const data = await getUserData(user.uid);
    if (!data) return { success: false, error: "User not found" };
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err.message || "Failed to get user data" };
  }
};

/**
 * Update user profile
 */
export const updateUserProfile = async (uid, updates) => {
  const userRef = doc(db, "users", uid);

  await updateDoc(userRef, {
    ...updates,
    updatedAt: new Date().toISOString(),
  });
};

/**
 * Create a Firestore user profile (id = uid)
 */
export const createUserProfile = async (uid, data) => {
  const userRef = doc(db, "users", uid);
  await setDoc(userRef, {
    ...data,
    role: data.role || "user",
    createdAt: new Date().toISOString(),
  });
};

/**
 * Helper used by older controllers: returns profile or null
 */
export const getUserProfile = async (uid) => {
  return await getUserData(uid);
};

/**
 * Add a meter to a user's profile
 */
export const addMeter = async (uid, meter) => {
  const userRef = doc(db, "users", uid);
  const userSnap = await getDoc(userRef);
  const data = userSnap.exists() ? userSnap.data() : {};
  const meters = data.meters || [];
  meters.push(meter);
  await updateDoc(userRef, { meters, updatedAt: new Date().toISOString() });
  return meters;
};

/**
 * Update a meter by id
 */
export const updateMeter = async (uid, meterId, updates) => {
  const userRef = doc(db, "users", uid);
  const userSnap = await getDoc(userRef);
  const data = userSnap.exists() ? userSnap.data() : {};
  const meters = (data.meters || []).map((m) =>
    m.id === meterId ? { ...m, ...updates } : m
  );
  await updateDoc(userRef, { meters, updatedAt: new Date().toISOString() });
  return meters;
};

/**
 * Remove a meter by id
 */
export const removeMeter = async (uid, meterId) => {
  const userRef = doc(db, "users", uid);
  const userSnap = await getDoc(userRef);
  const data = userSnap.exists() ? userSnap.data() : {};
  const meters = (data.meters || []).filter((m) => m.id !== meterId);
  await updateDoc(userRef, { meters, updatedAt: new Date().toISOString() });
  return meters;
};

/**
 * Get all users (admin only – enforce via rules)
 */
export const getAllUsers = async () => {
  const usersRef = collection(db, "users");
  const querySnapshot = await getDocs(usersRef);

  return querySnapshot.docs.map((doc) => doc.data());
};

/**
 * Get users by role
 */
export const getUsersByRole = async (role) => {
  const usersRef = collection(db, "users");
  const q = query(usersRef, where("role", "==", role));
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map((doc) => doc.data());
};

/**
 * Check if a user document exists
 */
export const userExists = async (uid) => {
  const userRef = doc(db, "users", uid);
  const userSnap = await getDoc(userRef);
  return userSnap.exists();
};
