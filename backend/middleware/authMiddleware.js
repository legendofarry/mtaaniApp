// backend/middleware/authMiddleware.js

const jwt = require("jsonwebtoken");

/**
 * ======================================================
 * AUTH MIDDLEWARE
 * ------------------------------------------------------
 * - Validates JWT
 * - Extracts user ID
 * - Attaches req.user.id
 * - Does NOT load full user
 * ======================================================
 */
module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      success: false,
      message: "Authorization header missing",
    });
  }

  // Expected format: Bearer <token>
  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return res.status(401).json({
      success: false,
      message: "Invalid authorization format",
    });
  }

  const token = parts[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    if (!payload?.id) {
      return res.status(401).json({
        success: false,
        message: "Invalid token payload",
      });
    }

    // 🔑 Attach ONLY the identity
    req.user = { id: payload.id };

    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};
