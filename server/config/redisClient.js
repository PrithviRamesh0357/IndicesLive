// const redis = require("redis");
// const logger = require("../utils/logger");

// const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

// logger.info("Redis URL in RENDER IS", redisUrl);

// const redisClient = redis.createClient({
//   url: redisUrl,
//   // The redis client has a built-in reconnection strategy.
//   // You can customize it if needed.
// });

// redisClient.on("error", (err) => {
//   logger.error(`❌ Redis error: ${err}`);
// });
// //Result of connect() below.. It is handled by the event here
// redisClient.on("connect", () => {
//   logger.info("Connecting to Redis...");
// });

// //This is wehn connection is truly established and any commands in queue are now processed
// redisClient.on("ready", () => {
//   logger.info(`✅ Connected to Redis at ${redisUrl}`);
// });

// redisClient.on("end", () => {
//   logger.warn("Redis connection ended.");
// });

// // The connect() method is asynchronous.
// // Commands sent before the connection is established are queued.
// redisClient.connect().catch((err) => {
//   logger.error(`❌ Initial Redis connection failed: ${err}`);
// });

// // Graceful shutdown
// const gracefulShutdown = async () => {
//   logger.info("Gracefully shutting down...");
//   await redisClient.quit();
//   logger.info("Redis client disconnected.");
//   process.exit(0);
// };

// process.on("SIGINT", gracefulShutdown);
// process.on("SIGTERM", gracefulShutdown);

// module.exports = redisClient;
