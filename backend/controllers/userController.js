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
