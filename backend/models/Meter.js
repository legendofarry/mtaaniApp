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

const MeterSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    type: { type: String, enum: ["water", "electricity"], required: true },
    meterNumber: { type: String, required: true },
    nickname: String,
    provider: String,
    location: LocationSchema,
    lastReading: Number,
    lastReadingAt: Date,
    averageDailyUsage: Number,
    predictedRunOut: Date,
    isSmartMeter: { type: Boolean, default: false },
    firmwareVersion: String,
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Meter", MeterSchema);
