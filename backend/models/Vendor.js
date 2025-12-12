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

const VendorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    type: {
      type: String,
      enum: [
        "water-mkokoteni",
        "water-kiosk",
        "water-borehole",
        "water-truck",
        "electrician",
        "shop",
      ],
      default: "water-kiosk",
    },
    ownerName: String,
    phone: String,
    phoneVerified: { type: Boolean, default: false },
    pricing: {
      per20L: Number,
      serviceFee: Number,
      lastUpdated: Date,
    },
    location: LocationSchema,
    availability: {
      status: {
        type: String,
        enum: ["online", "offline", "busy"],
        default: "offline",
      },
      lastSeen: Date,
      activeHours: [String],
    },
    servicesOffered: [String],
    rating: { average: Number, reviewCount: Number },
    route: {
      enabled: Boolean,
      path: [{ lat: Number, lng: Number }],
    },
    vendorBoost: { boosted: Boolean, boostExpires: Date },
    verified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Vendor", VendorSchema);
