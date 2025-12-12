const mongoose = require("mongoose");
const logger = require("./logger");

const connectDB = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    logger.error("MONGO_URI not set in environment");
    process.exit(1);
  }
  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    logger.info("MongoDB connected");
  } catch (err) {
    logger.error("MongoDB connection error:", err);
    process.exit(1);
  }
};

module.exports = connectDB;
