const Otp = require("../models/Otp");

/**
 * Save OTP with expiration
 * @param {string} email
 * @param {string} code
 * @param {string} purpose verify | reset
 * @param {number} ttlSeconds
 */
module.exports = async function saveOtp(
  email,
  code,
  purpose,
  ttlSeconds = 600
) {
  const expiresAt = new Date(Date.now() + ttlSeconds * 1000);

  const otp = new Otp({
    email,
    code,
    purpose,
    expiresAt,
    used: false,
  });

  await otp.save();
  return otp;
};
