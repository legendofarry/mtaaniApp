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

  return { uid: userSnap.id, ...userSnap.data() }; // <-- add uid here
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

/**
 * Submit a vendor application for review (water vendors only)
 */
export const submitVendorApplication = async (uid, application) => {
  const appRef = doc(db, "vendor_applications", uid);
  await setDoc(appRef, {
    uid,
    ...application,
    type: "water",
    status: "pending",
    createdAt: new Date().toISOString(),
  });
  return { success: true };
};

/**
 * Get a vendor application by applicant UID
 */
export const getVendorApplication = async (uid) => {
  try {
    const ref = doc(db, "vendor_applications", uid);
    const snap = await getDoc(ref);
    return snap.exists() ? snap.data() : null;
  } catch (err) {
    console.warn("getVendorApplication error:", err);
    return null;
  }
};

/**
 * Get all vendor applications (admin view)
 */
export const getAllVendorApplications = async () => {
  try {
    const col = collection(db, "vendor_applications");
    const snapshot = await getDocs(col);
    return {
      success: true,
      data: snapshot.docs.map((d) => ({ id: d.id, ...d.data() })),
    };
  } catch (err) {
    console.warn("getAllVendorApplications error:", err);
    return { success: false, error: err.message || String(err) };
  }
};

/**
 * Update vendor application document
 */
export const updateVendorApplication = async (uid, updates) => {
  const ref = doc(db, "vendor_applications", uid);
  await updateDoc(ref, { ...updates, updatedAt: new Date().toISOString() });
  return { success: true };
};

/**
 * Approve application and mark user as vendor
 */
export const approveVendorApplication = async (uid) => {
  await updateVendorApplication(uid, {
    status: "approved",
    reviewedAt: new Date().toISOString(),
  });
  // elevate user role
  await updateUserProfile(uid, {
    role: "vendor",
    vendorApprovedAt: new Date().toISOString(),
  });
  return { success: true };
};

/**
 * Save a passkey/pk credential to the user's profile
 */
export const savePasskey = async (uid, passkey) => {
  const userRef = doc(db, "users", uid);
  const userSnap = await getDoc(userRef);
  const data = userSnap.exists() ? userSnap.data() : {};
  const passkeys = data.passkeys || [];
  passkeys.push(passkey);
  await updateDoc(userRef, { passkeys, updatedAt: new Date().toISOString() });
  return passkeys;
};

/**
 * Get user's saved passkeys
 */
export const getPasskeys = async (uid) => {
  const userRef = doc(db, "users", uid);
  const snap = await getDoc(userRef);
  if (!snap.exists()) return [];
  const data = snap.data();
  return data.passkeys || [];
};

/**
 * Remove a passkey by id
 */
export const removePasskey = async (uid, passkeyId) => {
  const userRef = doc(db, "users", uid);
  const snap = await getDoc(userRef);
  const data = snap.exists() ? snap.data() : {};
  const passkeys = (data.passkeys || []).filter((p) => p.id !== passkeyId);
  await updateDoc(userRef, { passkeys, updatedAt: new Date().toISOString() });
  return passkeys;
};
/**
 * Reject application with optional reason
 */
export const rejectVendorApplication = async (uid, reason) => {
  await updateVendorApplication(uid, {
    status: "rejected",
    rejectedReason: reason || "",
    reviewedAt: new Date().toISOString(),
  });
  return { success: true };
};
