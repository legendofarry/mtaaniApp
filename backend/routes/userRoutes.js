const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const userController = require("../controllers/userController");

router.get("/me", authMiddleware, userController.getMe);
router.put("/me", authMiddleware, userController.updateProfile);

// ⭐ NEW: Update user by ID (for onboarding - can add authMiddleware if needed)
router.put("/:userId", userController.updateUserById);

module.exports = router;
