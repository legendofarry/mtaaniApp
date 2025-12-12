import mongoose from "mongoose";

const TokenSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    meterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Meter",
      required: true,
    },

    amount: Number,
    units: Number,

    tokenNumber: String,
    providerRef: String,

    status: {
      type: String,
      enum: ["pending", "success", "failed"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Token", TokenSchema);
