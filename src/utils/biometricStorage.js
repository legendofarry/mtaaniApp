import * as SecureStore from "expo-secure-store";

const BIOMETRIC_SECRET_KEY = "biometric_secret";
const BIOMETRIC_EMAIL_KEY = "biometric_email";

export const saveBiometricCredentials = async (email, secret) => {
  await SecureStore.setItemAsync(BIOMETRIC_EMAIL_KEY, email);
  await SecureStore.setItemAsync(BIOMETRIC_SECRET_KEY, secret);
};

export const getBiometricCredentials = async () => {
  const email = await SecureStore.getItemAsync(BIOMETRIC_EMAIL_KEY);
  const secret = await SecureStore.getItemAsync(BIOMETRIC_SECRET_KEY);

  if (!email || !secret) return null;
  return { email, secret };
};

export const clearBiometricCredentials = async () => {
  await SecureStore.deleteItemAsync(BIOMETRIC_EMAIL_KEY);
  await SecureStore.deleteItemAsync(BIOMETRIC_SECRET_KEY);
};
