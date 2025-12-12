const User = require("../models/User");

exports.getMe = async (req, res) => {
  const user = await User.findById(req.user._id).select("-passwordHash");
  res.json({ success: true, user });
};

exports.updateProfile = async (req, res) => {
  const updates = req.body;
  const user = await User.findByIdAndUpdate(req.user._id, updates, {
    new: true,
  }).select("-passwordHash");
  res.json({ success: true, user });
};

// ⭐ NEW: Update user by ID (for onboarding)
exports.updateUserById = async (req, res) => {
  try {
    const { userId } = req.params;
    const updates = req.body;

    // Find and update user
    const user = await User.findByIdAndUpdate(userId, updates, {
      new: true,
      runValidators: true,
    }).select("-passwordHash");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({ success: true, user });
  } catch (err) {
    console.error("Update user error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to update profile",
    });
  }
};
