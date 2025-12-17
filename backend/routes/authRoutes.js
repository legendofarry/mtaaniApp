// backend/routes/authRoutes.js
const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

// ==================== BASIC AUTH ====================
router.post("/register", authController.register);
router.post("/login", authController.login);

// ==================== SOCIAL AUTH ====================
router.post("/sync-firebase-user", authController.syncFirebaseUser);

// ==================== BIOMETRICS ====================
router.post("/save-passkey", authController.savePasskey);
router.post("/biometric-login", authController.biometricLogin);

// ==================== ONBOARDING ====================
router.post("/complete-onboarding", authController.completeOnboarding);

module.exports = router;
