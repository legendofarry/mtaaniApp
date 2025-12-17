// backend/server.js
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

// Connect DB
connectDB();

// Security - Allow cross-origin for mobile apps
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// ==================== CORS CONFIGURATION ====================
// Allow multiple origins for development and production
const allowedOrigins = [
  "http://localhost:8081", // Expo web dev
  "http://localhost:19006", // Alternative Expo port
  "http://localhost:19000", // Expo dev server
  "http://10.0.2.2:8081", // Android emulator
  "http://10.0.2.2:19006", // Android emulator alt
  "http://127.0.0.1:8081", // Localhost alternative
  process.env.FRONTEND_URL, // Production frontend from env
  "https://fluxflow.netlify.app", // Your production domain (if any)
  "https://fluxflow.netlify.app", // WWW variant
];

// Filter out undefined values
const validOrigins = allowedOrigins.filter(
  (origin) => origin && origin !== "undefined"
);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman, curl, etc.)
      if (!origin) {
        return callback(null, true);
      }

      // Check if origin is in allowed list
      if (validOrigins.includes(origin)) {
        callback(null, true);
      } else {
        // In development, allow all but log
        if (process.env.NODE_ENV !== "production") {
          logger.warn(
            `⚠️ CORS: Allowing non-whitelisted origin in dev: ${origin}`
          );
          callback(null, true);
        } else {
          logger.error(`❌ CORS blocked origin: ${origin}`);
          callback(new Error("Not allowed by CORS"));
        }
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(morgan("combined", { stream: logger.stream }));

// ==================== BASE ROUTE ====================
app.get("/", (req, res) => {
  res.json({
    ok: true,
    service: "mtaaniflow-backend",
    version: "1.0.0",
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: "/api/auth",
      users: "/api/users",
      meters: "/api/meters",
      tokens: "/api/tokens",
      water: "/api/water",
      vendors: "/api/vendors",
      outages: "/api/outages",
      ads: "/api/ads",
      notifications: "/api/notifications",
      biometrics: "/api/biometrics",
    },
  });
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// ==================== API ROUTES ====================
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

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    path: req.path,
  });
});

// Error middleware (should be last)
app.use(errorHandler);

// ==================== START SERVER ====================
app.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT}`);
  logger.info(`📧 Environment: ${process.env.NODE_ENV || "development"}`);
  logger.info(`🌐 API URL: ${process.env.API_URL || "Not set"}`);
  logger.info(`🔗 Frontend URL: ${process.env.FRONTEND_URL || "Not set"}`);
});

module.exports = app;
