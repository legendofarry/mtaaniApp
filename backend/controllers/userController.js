// backend/controllers/userController.js

const User = require("../models/User");

/* ======================================================
   GET CURRENT USER
====================================================== */
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-passwordHash");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      user,
    });
  } catch (err) {
    console.error("Get me error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user",
    });
  }
};

/* ======================================================
   UPDATE OWN PROFILE (NON-ONBOARDING)
====================================================== */
exports.updateProfile = async (req, res) => {
  try {
    // 🔐 Explicit allow-list (NO biometrics, NO flags)
    const updates = {};

    if (req.body.phone !== undefined) updates.phone = req.body.phone;
    if (req.body.gender !== undefined) updates.gender = req.body.gender;
    if (req.body.age !== undefined) updates.age = req.body.age;
    if (req.body.location !== undefined) updates.location = req.body.location;
    if (req.body.profileImageUrl !== undefined) {
      updates.profileImageUrl = req.body.profileImageUrl;
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select("-passwordHash");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      user,
    });
  } catch (err) {
    console.error("Update profile error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to update profile",
    });
  }
};
