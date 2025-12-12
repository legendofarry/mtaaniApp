// backend/controllers/biometricController.js
const User = require("../models/User");

exports.createBiometric = async (req, res) => {
  // expects authenticated user
  const { passkeyRaw } = req.body;
  if (!req.user)
    return res.status(401).json({ success: false, message: "Unauthorized" });
  if (!passkeyRaw)
    return res
      .status(400)
      .json({ success: false, message: "Missing passkeyRaw" });

  req.user.biometrics = {
    passkeyRaw,
    createdAt: new Date(),
    lastUsed: null,
  };
  await req.user.save();
  return res.json({ success: true, message: "Biometric saved" });
};

exports.authBiometric = async (req, res) => {
  const { email, passkeyRaw } = req.body;
  if (!email || !passkeyRaw)
    return res.status(400).json({ success: false, message: "Missing fields" });

  const user = await User.findOne({ email });
  if (!user || !user.biometrics || !user.biometrics.passkeyRaw)
    return res
      .status(404)
      .json({ success: false, message: "Biometric not configured" });

  // Very simple check in this skeleton — in prod you'd verify signature/assertion
  if (user.biometrics.passkeyRaw !== passkeyRaw)
    return res
      .status(401)
      .json({ success: false, message: "Invalid biometric" });

  user.biometrics.lastUsed = new Date();
  await user.save();

  const token = require("../utils/jwt").sign({ id: user._id });
  return res.json({
    success: true,
    accessToken: token,
    user: { id: user._id, email: user.email },
  });
};
