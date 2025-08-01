//Encapsulates Redis operations with optional TTL support.
//const redisClient = require("../config/redisClient");
const logger = require("../utils/logger");

const RedisService = {
  // async set(key, value, ttl = null) {
  //   try {
  //     const options = {};
  //     if (ttl) {
  //       // Use the 'EX' option for an atomic set-with-expiration.
  //       // This is more efficient and safer than two separate commands.
  //       options.EX = ttl;
  //     }
  //     // The value is expected to be a string or a Buffer.
  //     // If you need to store objects, stringify them before calling this service.
  //     await redisClient.set(key, value, options);
  //   } catch (error) {
  //     logger.error(`Error setting Redis key "${key}"`, { error: error.message });
  //     // We log the error but don't re-throw it. A cache failure
  //     // shouldn't necessarily crash the entire application.
  //   }
  // },
  // async get(key) {
  //   try {
  //     return await redisClient.get(key);
  //   } catch (error) {
  //     logger.error(`Error getting Redis key "${key}"`, { error: error.message });
  //     return null; // Return null on error to prevent unexpected crashes.
  //   }
  // },
  // async del(key) {
  //   try {
  //     return await redisClient.del(key);
  //   } catch (error) {
  //     logger.error(`Error deleting Redis key "${key}"`, { error: error.message });
  //     return 0; // `del` returns the number of keys deleted. 0 is a safe default.
  //   }
  // },
  // async exists(key) {
  //   try {
  //     return await redisClient.exists(key);
  //   } catch (error) {
  //     logger.error(`Error checking existence of Redis key "${key}"`, { error: error.message });
  //     return 0; // `exists` returns the number of keys that exist. 0 is a safe default.
  //   }
  // },
};

module.exports = RedisService;
// Note: Ensure to handle JSON parsing when retrieving data.
