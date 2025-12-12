import mongoose from "mongoose";

const WaterReportSchema = new mongoose.Schema(
  {
    reporterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    issueType: {
      type: String,
      enum: ["shortage", "leakage", "contamination", "outage", "other"],
      required: true,
    },

    description: String,

    images: [String],

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

    urgency: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },

    status: {
      type: String,
      enum: ["open", "in-progress", "resolved"],
      default: "open",
    },
  },
  { timestamps: true }
);

export default mongoose.model("WaterReport", WaterReportSchema);
