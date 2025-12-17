// src/utils/biometricStorage.js

import * as SecureStore from "expo-secure-store";

/**
 * ======================================================
 * BIOMETRIC STORAGE
 * ------------------------------------------------------
 * - Stores device-specific passkey for biometric login
 * - NEVER synced to backend
 * - Cleared on biometric failure
 * ======================================================
 */

const BIOMETRIC_EMAIL_KEY = "biometric_email";
const BIOMETRIC_PASSKEY_KEY = "biometric_passkey_raw";

/**
 * Save biometric credentials securely on device
 */
export const saveBiometricCredentials = async ({ email, passkeyRaw }) => {
  if (!email || !passkeyRaw) {
    throw new Error("Email and passkey are required");
  }

  await SecureStore.setItemAsync(BIOMETRIC_EMAIL_KEY, email);
  await SecureStore.setItemAsync(BIOMETRIC_PASSKEY_KEY, passkeyRaw);
};

/**
 * Retrieve biometric credentials
 */
export const getBiometricCredentials = async () => {
  const email = await SecureStore.getItemAsync(BIOMETRIC_EMAIL_KEY);
  const passkeyRaw = await SecureStore.getItemAsync(BIOMETRIC_PASSKEY_KEY);

  if (!email || !passkeyRaw) {
    return null;
  }

  return {
    email,
    passkeyRaw,
  };
};

/**
 * Clear biometric credentials (on logout or failure)
 */
export const clearBiometricCredentials = async () => {
  await SecureStore.deleteItemAsync(BIOMETRIC_EMAIL_KEY);
  await SecureStore.deleteItemAsync(BIOMETRIC_PASSKEY_KEY);
};
