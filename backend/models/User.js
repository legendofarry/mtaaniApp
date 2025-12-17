// backend/models/User.js

const mongoose = require("mongoose");

/* ======================================================
   LOCATION
====================================================== */
const locationSchema = new mongoose.Schema(
  {
    area: { type: String, required: true },
    estate: String,
    apartmentName: String,
    plotNumber: String,
    block: String,
    floor: String,
    houseNumber: String,
    landmark: String,
    gps: {
      lat: Number,
      lng: Number,
    },
    structureNumber: String,
  },
  { _id: false }
);

/* ======================================================
   BIOMETRICS / PASSKEY
====================================================== */
const biometricsSchema = new mongoose.Schema(
  {
    enabled: { type: Boolean, default: false },

    // 🔐 HASHED passkey (never raw)
    passkeyHash: { type: String },

    createdAt: { type: Date },
    lastUsed: { type: Date },
  },
  { _id: false }
);

/* ======================================================
   PREMIUM
====================================================== */
const premiumSchema = new mongoose.Schema(
  {
    status: { type: Boolean, default: false },
    expiresAt: Date,
    plan: {
      type: String,
      enum: ["basic", "pro", "vendor"],
      default: "basic",
    },
  },
  { _id: false }
);

/* ======================================================
   REPUTATION
====================================================== */
const reputationSchema = new mongoose.Schema(
  {
    score: { type: Number, default: 0 },
    votes: { type: Number, default: 0 },
  },
  { _id: false }
);

/* ======================================================
   USER
====================================================== */
const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
      trim: true,
    },

    phone: {
      type: String,
      unique: true,
      sparse: true,
    },

    passwordHash: {
      type: String,
      select: false,
    },

    /* ============================================
       SOCIAL AUTH
    ============================================ */
    firebaseUid: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },

    signupMethod: {
      type: String,
      enum: ["email", "google", "facebook"],
      default: "email",
    },

    /* ============================================
       FLOW FLAGS
    ============================================ */
    onboardingCompleted: {
      type: Boolean,
      default: false,
    },

    // Verification intentionally neutralized
    verified: {
      type: Boolean,
      default: true,
    },

    /* ============================================
       PROFILE
    ============================================ */
    gender: {
      type: String,
      enum: ["male", "female", "other"],
    },

    age: Number,

    location: locationSchema,

    /* ============================================
       METERS (FUTURE)
    ============================================ */
    meters: {
      water: [{ type: mongoose.Schema.Types.ObjectId, ref: "Meter" }],
      electricity: [{ type: mongoose.Schema.Types.ObjectId, ref: "Meter" }],
    },

    /* ============================================
       SECURITY
    ============================================ */
    biometrics: {
      type: biometricsSchema,
      default: () => ({ enabled: false }),
    },

    /* ============================================
       APP FEATURES
    ============================================ */
    premium: {
      type: premiumSchema,
      default: () => ({}),
    },

    reputation: {
      type: reputationSchema,
      default: () => ({}),
    },

    profileImageUrl: String,

    deviceTokens: [{ type: String }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
