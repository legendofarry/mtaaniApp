// backend/utils/jwt.js

const jwt = require("jsonwebtoken");

/**
 * ======================================================
 * JWT SIGN
 * ------------------------------------------------------
 * - Requires payload.id
 * - Centralizes token expiry
 * ======================================================
 */
const sign = (payload) => {
  if (!payload || !payload.id) {
    throw new Error("JWT payload must contain user id");
  }

  return jwt.sign({ id: payload.id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

/**
 * ======================================================
 * JWT VERIFY (OPTIONAL USE)
 * ------------------------------------------------------
 * - Used by auth middleware or other services
 * ======================================================
 */
const verify = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

module.exports = {
  sign,
  verify,
};
