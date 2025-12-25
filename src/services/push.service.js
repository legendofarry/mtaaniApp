// src/services/push.service.js
import { showToast } from "../components/toast.js";
import { getAuthUser } from "./auth.store.js";
import { db } from "../config/firebase.js";
import { doc, setDoc } from "firebase/firestore";

export const registerServiceWorker = async () => {
  if (!('serviceWorker' in navigator)) return null;
  try {
    const reg = await navigator.serviceWorker.register('/sw.js');
    return reg;
  } catch (err) {
    console.warn('Service worker registration failed', err);
    return null;
  }
};

export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) return 'unsupported';
  try {
    const p = await Notification.requestPermission();
    return p; // 'granted' | 'denied' | 'default'
  } catch (err) {
    console.warn('Notification permission request failed', err);
    return 'default';
  }
};

export const subscribeToPush = async (vapidKey) => {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    showToast('Push not supported in this browser', 'warning');
    return null;
  }

  const reg = await registerServiceWorker();
  if (!reg) return null;

  try {
    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: vapidKey ? urlBase64ToUint8Array(vapidKey) : undefined,
    });
    return sub;
  } catch (err) {
    console.warn('Push subscription failed', err);
    return null;
  }
};

export const saveSubscriptionForUser = async (subscription) => {
  const user = getAuthUser();
  if (!user) return null;
  try {
    const ref = doc(db, 'push_subscriptions', user.uid);
    await setDoc(ref, { uid: user.uid, subscription, updatedAt: new Date().toISOString() });
    return true;
  } catch (err) {
    console.warn('Failed to save subscription', err);
    return false;
  }
};

// small helper
const urlBase64ToUint8Array = (base64String) => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

export default {
  registerServiceWorker,
  requestNotificationPermission,
  subscribeToPush,
  saveSubscriptionForUser,
};
