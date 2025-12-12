const mongoose = require("mongoose");

const AdSchema = new mongoose.Schema(
  {
    businessId: { type: mongoose.Schema.Types.ObjectId },
    type: {
      type: String,
      enum: [
        "vendor-boost",
        "local-banner",
        "sponsored-alert",
        "map-highlight",
        "homepage-card",
      ],
    },
    title: String,
    subtitle: String,
    imageUrl: String,
    targetArea: {
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
    schedule: {
      startsAt: Date,
      endsAt: Date,
      active: { type: Boolean, default: true },
    },
    pricing: {
      amount: Number,
      currency: { type: String, default: "KES" },
      method: String,
    },
    performance: { impressions: Number, clicks: Number, conversions: Number },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Ad", AdSchema);
