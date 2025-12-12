// backend\server.js
require("dotenv").config();
require("express-async-errors");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const logger = require("./config/logger");
const connectDB = require("./config/db");
const errorHandler = require("./middleware/errorHandler");

// routes
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const meterRoutes = require("./routes/meterRoutes");
const tokenRoutes = require("./routes/tokenRoutes");
const waterRoutes = require("./routes/waterReportRoutes");
const vendorRoutes = require("./routes/vendorRoutes");
const outageRoutes = require("./routes/outageRoutes");
const adRoutes = require("./routes/adRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const biometricRoutes = require("./routes/biometricRoutes");

const PORT = process.env.PORT || 4000;
const app = express();

// connect db
connectDB();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan("combined", { stream: logger.stream }));

// base route
app.get("/", (req, res) =>
  res.json({ ok: true, service: "mtaaniflow-backend" })
);

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/meters", meterRoutes);
app.use("/api/tokens", tokenRoutes);
app.use("/api/water", waterRoutes);
app.use("/api/vendors", vendorRoutes);
app.use("/api/outages", outageRoutes);
app.use("/api/ads", adRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/biometrics", biometricRoutes);

// error middleware (should be last)
app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});
