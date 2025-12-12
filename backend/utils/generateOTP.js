// backend/utils/saveOtp.js
const Otp = require("../models/Otp");

async function saveOtp(email, code, purpose = "verify", ttlSeconds = 300) {
  const expiresAt = new Date(Date.now() + ttlSeconds * 1000);
  const otpDoc = new Otp({ email, code, purpose, expiresAt, used: false });
  await otpDoc.save();
  return otpDoc;
}

module.exports = saveOtp;
