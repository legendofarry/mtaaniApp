// backend/models/Otp.js
const mongoose = require("mongoose");

const OtpSchema = new mongoose.Schema(
  {
    email: { type: String, index: true },
    code: String,
    purpose: { type: String, default: "verify" }, // verify | login | reset
    expiresAt: Date,
    attempts: { type: Number, default: 0 },
    used: { type: Boolean, default: false },
  },
  { timestamps: true }
);

OtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index if using Date

module.exports = mongoose.model("Otp", OtpSchema);
