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

const WaterReportSchema = new mongoose.Schema(
  {
    reporterId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    issueType: {
      type: String,
      enum: ["shortage", "leakage", "contamination", "outage", "other"],
      required: true,
    },
    description: String,
    images: [String],
    location: LocationSchema,
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
    communityUpvotes: { type: Number, default: 0 },
    downvotes: { type: Number, default: 0 },
    verifiedByCommunity: { type: Boolean, default: false },
    verifiedByAdmin: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("WaterReport", WaterReportSchema);
