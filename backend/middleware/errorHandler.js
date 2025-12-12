const logger = require("../config/logger");

module.exports = (err, req, res, next) => {
  logger.error(err);
  const status = err.status || 500;
  res.status(status).json({
    success: false,
    message: err.message || "Internal Server Error",
    details: process.env.NODE_ENV === "production" ? undefined : err.stack,
  });
};
