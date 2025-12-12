import mongoose from "mongoose";

const BiometricSchema = new mongoose.Schema({
  passkeyRaw: { type: String }, // encrypted or hashed
  createdAt: { type: Date },
  lastUsed: { type: Date },
});

const LocationSchema = new mongoose.Schema({
  country: String,
  county: String,
  town: String,
  estate: String,
  apartmentName: String,
  houseNumber: String,
  floor: String,
  latitude: Number,
  longitude: Number,
});

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    email: { type: String, required: true, unique: true },
    phone: { type: String },

    signupMethod: {
      type: String,
      enum: ["email", "google", "facebook"],
      default: "email",
    },

    passwordHash: { type: String }, // only for email signups
    verified: { type: Boolean, default: false },

    premium: {
      isActive: { type: Boolean, default: false },
      expiresAt: { type: Date },
    },

    reputation: {
      score: { type: Number, default: 0 },
      badges: [String],
    },

    biometrics: BiometricSchema,

    meters: {
      water: [{ type: mongoose.Schema.Types.ObjectId, ref: "Meter" }],
      electricity: [{ type: mongoose.Schema.Types.ObjectId, ref: "Meter" }],
    },

    location: LocationSchema,
  },
  { timestamps: true }
);

export default mongoose.model("User", UserSchema);
