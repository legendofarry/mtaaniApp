const mongoose = require("mongoose");

const TokenSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    meterId: { type: mongoose.Schema.Types.ObjectId, ref: "Meter" },
    type: { type: String, enum: ["water", "electricity"], required: true },
    amountKES: Number,
    units: Number,
    tokenCode: String,
    paymentMethod: String,
    transactionId: String,
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor" },
    source: String,
    detectedFromSMS: { type: Boolean, default: false },
    smsMessage: String,
    balanceAfterPurchase: Number,
    estimatedRunOut: Date,
    status: { type: String, default: "active" },
    purchasedAt: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Token", TokenSchema);
