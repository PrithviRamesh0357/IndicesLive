//Encapsulates Redis operations with optional TTL support.
const redisClient = require("../config/redisClient");

const RedisService = {
  async set(key, value, ttl = null) {
    try {
      await redisClient.set(key, JSPN.stringify(value));
      if (ttl) {
        await redisClient.expire(key, ttl);
      }
    } catch (error) {
      console.error(`Error setting key ${key}:`, error);
      throw error;
    }
  },

  async get(key) {
    return await redisClient.get(key);
  },
  async del(key) {
    return await redisClient.del(key);
  },
  async exists(key) {
    return await redisClient.exists(key);
  },
};

module.exports = RedisService;
// Note: Ensure to handle JSON parsing when retrieving data.
