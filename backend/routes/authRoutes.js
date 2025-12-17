// backend/routes/authRoutes.js

const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");

/* ======================================================
   BASIC AUTH
====================================================== */
router.post("/register", authController.register);
router.post("/login", authController.login);

/* ======================================================
   SOCIAL AUTH (FIREBASE → BACKEND)
====================================================== */
router.post("/sync-firebase-user", authController.syncFirebaseUser);

/* ======================================================
   BIOMETRICS
====================================================== */
// 🔓 Public (device + passkey)
router.post("/biometric-login", authController.biometricLogin);

// 🔐 Protected (user must be logged in)
router.post("/enable-passkey", authMiddleware, authController.enablePasskey);

/* ======================================================
   ONBOARDING
====================================================== */
router.post(
  "/complete-onboarding",
  authMiddleware,
  authController.completeOnboarding
);

module.exports = router;
