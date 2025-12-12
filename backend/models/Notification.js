const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // null = broadcast
    title: String,
    message: String,
    type: {
      type: String,
      enum: ["system", "outage", "token", "promotion", "vendor", "warning"],
    },
    read: { type: Boolean, default: false },
    locationContext: {
      area: String,
      estate: String,
      apartmentName: String,
      plotNumber: String,
      block: String,
      floor: String,
      houseNumber: String,
      landmark: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", NotificationSchema);
