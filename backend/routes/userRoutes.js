// backend/routes/userRoutes.js

const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const userController = require("../controllers/userController");

/**
 * Get current authenticated user
 */
router.get("/me", authMiddleware, userController.getMe);

/**
 * Update own profile (non-onboarding)
 */
router.put("/me", authMiddleware, userController.updateProfile);

module.exports = router;
