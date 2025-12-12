// backend\routes\authRoutes.js
const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/request-otp", authController.requestOtp);
router.post("/verify-otp", authController.verifyOtp);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);

// placeholders for social login
router.post("/google", (req, res) =>
  res.status(501).json({ success: false, message: "Not implemented" })
);
router.post("/facebook", (req, res) =>
  res.status(501).json({ success: false, message: "Not implemented" })
);

module.exports = router;
