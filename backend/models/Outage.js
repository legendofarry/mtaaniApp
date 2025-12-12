const mongoose = require("mongoose");

const LocationSchema = new mongoose.Schema(
  {
    area: String,
    estate: String,
    apartmentName: String,
    plotNumber: String,
    block: String,
    floor: String,
    houseNumber: String,
    landmark: String,
    gps: { lat: Number, lng: Number },
  },
  { _id: false }
);

const OutageSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ["water", "electricity"], required: true },
    reportedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    reporterCount: { type: Number, default: 0 },
    verifiedByAdmin: { type: Boolean, default: false },
    verifiedByCommunity: { type: Boolean, default: false },
    location: LocationSchema,
    details: {
      description: String,
      cause: String,
      severity: {
        type: String,
        enum: ["low", "medium", "high"],
        default: "medium",
      },
    },
    timeline: {
      startTime: Date,
      endTime: Date,
      durationHours: Number,
    },
    status: {
      type: String,
      enum: ["active", "resolved", "under-investigation"],
      default: "active",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Outage", OutageSchema);
