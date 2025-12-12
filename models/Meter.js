import mongoose from "mongoose";

const MeterSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    meterNumber: { type: String, required: true },
    meterType: { type: String, enum: ["water", "electricity"], required: true },

    provider: String,

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

    status: { type: String, default: "active" },
  },
  { timestamps: true }
);

export default mongoose.model("Meter", MeterSchema);
