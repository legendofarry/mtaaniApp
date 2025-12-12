const { createLogger, format, transports } = require("winston");

const logger = createLogger({
  level: "info",
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    format.splat(),
    format.json()
  ),
  transports: [new transports.Console({ format: format.simple() })],
});

// for morgan
logger.stream = {
  write: (message) => logger.info(message.trim()),
};

module.exports = logger;
