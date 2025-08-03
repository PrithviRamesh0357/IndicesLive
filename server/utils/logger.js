const winston = require("winston");

const { combine, timestamp, printf, colorize } = winston.format;

// Custom format for console logs
const consoleFormat = printf(({ level, message, timestamp, ...metadata }) => {
  let msg = `${timestamp} [${level}]: ${message}`;
  if (Object.keys(metadata).length) {
    msg += ` ${JSON.stringify(metadata)}`;
  }
  return msg;
});

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: combine(colorize(), timestamp({ format: "HH:mm:ss" }), consoleFormat),
  transports: [new winston.transports.Console()],
});

module.exports = logger;
