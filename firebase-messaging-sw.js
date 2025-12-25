// firebase-messaging-sw.js
// Optional: If you plan to use Firebase Cloud Messaging (FCM) for web push,
// paste your Firebase config below and initialize firebase-app and firebase-messaging.
// Example (compat):
importScripts(
  "https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js"
);
const firebaseConfig = {
  apiKey: "AIzaSyAUpPCZMArkoJt3dUAUMf63F_uQqRLOWaQ",
  authDomain: "flux-1eca5.firebaseapp.com",
  projectId: "flux-1eca5",
  storageBucket: "flux-1eca5.firebasestorage.app",
  messagingSenderId: "538706055826",
  appId: "1:538706055826:web:7a27a61d227c6b8b908c4b",
  measurementId: "G-B7MQ3815KW",
};
firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage(function (payload) {
  console.log(
    "[firebase-messaging-sw.js] Received background message ",
    payload
  );
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: "/icons/icon-192.png",
  };
  self.registration.showNotification(notificationTitle, notificationOptions);
});

// If you do not use FCM, keep using `sw.js` for generic Push API handling.
