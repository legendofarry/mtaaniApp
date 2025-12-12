import mongoose from "mongoose";

const OutageSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ["water", "electricity"], required: true },

    reporterId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    description: String,

    location: {
      country: String,
      county: String,
      town: String,
      estate: String,
      apartmentName: String,
      houseNumber: String,
      floor: String,
      latitude: Number,
      longitude: Number,
    },

    startTime: Date,
    estimatedEndTime: Date,

    status: {
      type: String,
      enum: ["reported", "confirmed", "fixing", "resolved"],
      default: "reported",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Outage", OutageSchema);
