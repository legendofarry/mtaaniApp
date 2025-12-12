const jwt = require("jsonwebtoken");
const User = require("../models/User");

module.exports = async (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth)
    return res
      .status(401)
      .json({ success: false, message: "Missing auth header" });

  const token = auth.split(" ")[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(payload.id).select("-passwordHash");
    if (!req.user)
      return res
        .status(401)
        .json({ success: false, message: "User not found" });
    next();
  } catch (err) {
    return res
      .status(401)
      .json({ success: false, message: "Invalid or expired token" });
  }
};
