// src/utils/permissions.js
export const isNotificationSupported = () =>
  "Notification" in window && "serviceWorker" in navigator;

export const checkNotificationPermission = () =>
  Notification.permission || "default";

export const requestNotificationPermission = async () => {
  if (!isNotificationSupported()) return "unsupported";
  return await Notification.requestPermission();
};

export const isGeolocationSupported = () => "geolocation" in navigator;
export const getCurrentPosition = (opts = {}) =>
  new Promise((res, rej) => {
    if (!isGeolocationSupported()) return rej(new Error("no-geolocation"));
    navigator.geolocation.getCurrentPosition(
      (p) => res(p),
      (e) => rej(e),
      opts
    );
  });

export const isBackgroundSyncSupported = () =>
  "serviceWorker" in navigator && "SyncManager" in window;
