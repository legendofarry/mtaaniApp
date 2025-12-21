// src\config\firebase.js
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAUpPCZMArkoJt3dUAUMf63F_uQqRLOWaQ",
  authDomain: "flux-1eca5.firebaseapp.com",
  projectId: "flux-1eca5",
  storageBucket: "flux-1eca5.firebasestorage.app",
  messagingSenderId: "538706055826",
  appId: "1:538706055826:web:7a27a61d227c6b8b908c4b",
  measurementId: "G-B7MQ3815KW",
};

// ✅ 1. Initialize app FIRST
export const app = initializeApp(firebaseConfig);

// ✅ 2. Then initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics =
  typeof window !== "undefined" ? getAnalytics(app) : null;
