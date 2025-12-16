// backend/routes/authRoutes.js
const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

// Email / password
router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);

// Magic link
router.post("/send-magic-link", authController.sendMagicLink);
router.post("/verify-magic-link", authController.verifyMagicLink);

// Firebase / social auth
router.post("/sync-firebase-user", authController.syncFirebaseUser);

// Biometrics
router.post("/save-passkey", authController.savePasskey);

router.get("/verify-email", authController.verifyEmailFromLink);
router.post("/check-verification", authController.checkVerificationStatus);

module.exports = router;
