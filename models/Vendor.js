import mongoose from "mongoose";

const VendorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    category: { type: String, enum: ["water", "electricity"], required: true },

    phone: String,
    email: String,

    verified: { type: Boolean, default: false },

    rating: {
      average: { type: Number, default: 0 },
      count: { type: Number, default: 0 },
    },

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

    servicesOffered: [String],

    serviceRangeKm: { type: Number, default: 3 },
  },
  { timestamps: true }
);

export default mongoose.model("Vendor", VendorSchema);
