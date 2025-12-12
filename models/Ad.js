import mongoose from "mongoose";

const AdSchema = new mongoose.Schema(
  {
    title: String,
    imageUrl: String,
    advertiser: String,

    targetLocations: [
      {
        country: String,
        county: String,
        town: String,
        estate: String,
      },
    ],

    clicks: { type: Number, default: 0 },
    impressions: { type: Number, default: 0 },

    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("Ad", AdSchema);
