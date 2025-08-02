//Encapsulates Redis operations with optional TTL support.
const redisClient = require("../config/redisClient");
const logger = require("../utils/logger");

const RedisService = {
  async set(key, value, ttl = null) {
    logger.info(` IN REDIS SERVICE +++++++++++++++++++++++`);
    logger.info(`Setting Redis key "${key}" with value "${value}"`);
    try {
      const options = {};
      if (ttl) {
        options.EX = ttl;
      }
      // If you need to store objects, stringify them before calling this service.
      const valueToStore =
        typeof value === "object" ? JSON.stringify(value) : value;
      await redisClient.set(key, valueToStore, options);
    } catch (error) {
      logger.error(`Error setting Redis key "${key}"`, {
        error: error.message,
      });
      // Re-throw the error so the route handler can catch it and send a 500 response.
      throw error;
    }
  },

  async get(key) {
    try {
      const value = await redisClient.get(key);
      if (value === null) return null;

      // Try to parse the value as JSON. If it's not valid JSON, return it as a raw string.
      try {
        return JSON.parse(value);
      } catch (e) {
        return value;
      }
    } catch (error) {
      logger.error(`Error getting Redis key "${key}"`, {
        error: error.message,
      });
      // Re-throw the error so the route handler can catch it.
      throw error;
    }
  },
};

module.exports = RedisService;
// Note: Ensure to handle JSON parsing when retrieving data.
