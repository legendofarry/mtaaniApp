// backend\models\User.js
const mongoose = require("mongoose");

const locationSchema = new mongoose.Schema({
  area: { type: String, required: true },
  estate: { type: String },
  apartmentName: { type: String },
  plotNumber: { type: String },
  block: { type: String },
  floor: { type: String },
  houseNumber: { type: String },
  landmark: { type: String },
  gps: {
    lat: { type: Number },
    lng: { type: Number },
  },
  structureNumber: { type: String },
});

const biometricsSchema = new mongoose.Schema({
  enabled: { type: Boolean, default: false },
  passkeyRaw: { type: String },
  createdAt: { type: Date },
  lastUsed: { type: Date },
});

const premiumSchema = new mongoose.Schema({
  status: { type: Boolean, default: false },
  expiresAt: { type: Date },
  plan: { type: String, enum: ["basic", "pro", "vendor"] },
});

const reputationSchema = new mongoose.Schema({
  score: { type: Number, default: 0 },
  votes: { type: Number, default: 0 },
});

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, unique: true },
    passwordHash: { type: String },

    signupMethod: {
      type: String,
      enum: ["email", "google", "facebook"],
      default: "email",
    },

    verified: { type: Boolean, default: false },

    // ⭐ NEW: Track onboarding completion
    onboardingCompleted: { type: Boolean, default: false },

    // ⭐ NEW: Track profile completion fields
    gender: { type: String, enum: ["male", "female", "other"] },
    age: { type: Number },

    location: locationSchema,

    meters: {
      water: [{ type: mongoose.Schema.Types.ObjectId, ref: "Meter" }],
      electricity: [{ type: mongoose.Schema.Types.ObjectId, ref: "Meter" }],
    },

    biometrics: biometricsSchema,

    premium: premiumSchema,

    reputation: reputationSchema,

    profileImageUrl: { type: String },

    deviceTokens: [{ type: String }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
