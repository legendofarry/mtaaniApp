const User = require("../models/User");

/* ================= GET CURRENT USER ================= */
exports.getMe = async (req, res) => {
  const user = await User.findById(req.user._id).select("-passwordHash");
  res.json({ success: true, user });
};

/* ================= UPDATE OWN PROFILE ================= */
exports.updateProfile = async (req, res) => {
  try {
    const allowedUpdates = {
      phone: req.body.phone,
      gender: req.body.gender,
      age: req.body.age,
      location: req.body.location,
      avatar: req.body.avatar,
      onboardingCompleted: req.body.onboardingCompleted,
    };

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: allowedUpdates },
      { new: true, runValidators: true }
    ).select("-passwordHash");

    res.json({ success: true, user });
  } catch (err) {
    console.error("Update profile error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to update profile",
    });
  }
};

/* ================= UPDATE USER BY ID (ONBOARDING) ================= */
exports.updateUserById = async (req, res) => {
  try {
    const { userId } = req.params;

    const allowedUpdates = {
      phone: req.body.phone,
      gender: req.body.gender,
      age: req.body.age,
      location: req.body.location,
      onboardingCompleted: req.body.onboardingCompleted,
      avatar: req.body.avatar,
      biometrics: req.body.biometrics,
    };

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: allowedUpdates },
      { new: true, runValidators: true }
    ).select("-passwordHash");

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
