// backend/models/MagicToken.js
const mongoose = require("mongoose");

const magicTokenSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
    },
    token: {
      type: String,
      required: true,
      unique: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      // Auto-delete expired tokens after 1 hour
      expires: 3600,
    },
    used: {
      type: Boolean,
      default: false,
    },
    device: {
      platform: String,
      userAgent: String,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster lookups
magicTokenSchema.index({ token: 1, expiresAt: 1 });
magicTokenSchema.index({ email: 1, used: 1 });

module.exports = mongoose.model("MagicToken", magicTokenSchema);
