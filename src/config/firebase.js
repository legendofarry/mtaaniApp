// src/config/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, initializeAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

// ✅ Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDITellfquYB_i31doYghix1qWe604JmQI",
  authDomain: "mtaa-app-9d796.firebaseapp.com",
  projectId: "mtaa-app-9d796",
  storageBucket: "mtaa-app-9d796.appspot.com",
  messagingSenderId: "437462714105",
  appId: "1:437462714105:web:7299438c6dd63ff6c84428",
};

// ✅ Init Firebase app
const app = initializeApp(firebaseConfig);

// ✅ Init Auth (platform-safe)
let auth;

if (Platform.OS === "web") {
  // 🌐 Web
  auth = getAuth(app);
} else {
  // 📱 Android / iOS
  const { getReactNativePersistence } = require("firebase/auth");

  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
}

// ✅ Firestore & Storage
const db = getFirestore(app);
const storage = getStorage(app);

// ✅ Exports
export { auth, db, storage };
export default app;

console.log("🔥 Firebase initialized:", Platform.OS);
