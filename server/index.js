const express = require("express");
const cors = require("cors");

const logger = require("./utils/logger");
const RedisService = require("./services/redisService");
const marketDataService = require("./services/marketDataService/upstoxSocket");

const app = express();

const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json()); // Middleware to parse JSON bodies

const authRoutes = require("./routes/auth");
app.use("/auth", authRoutes);

// Route to test setting a value in Redis
app.post("/test-redis/set", async (req, res) => {
  logger.info("Received request to set Redis key");
  // Ensure the request body contains the required fields
  try {
    const { key, value, ttl } = req.body; // ttl is optional (in seconds)
    if (!key || value === undefined) {
      return res
        .status(400)
        .send({ error: "Key and value are required in the body." });
    }
    // The third argument to `set` is the TTL in seconds.
    await RedisService.set(key, value, ttl);
    logger.info(`Set Redis key '${key}'${ttl ? ` with TTL ${ttl}s` : ""}`);
    res.send({ success: true, key, value });
  } catch (error) {
    logger.error("Error setting Redis key:", error);
    res.status(500).send({ error: "Failed to set Redis key." });
  }
});

// Route to test getting a value from Redis
app.get("/test-redis/get/:key", async (req, res) => {
  try {
    const { key } = req.params;
    const value = await RedisService.get(key);
    res.send({ key, value });
  } catch (error) {
    logger.error(`Error getting Redis key '${key}':`, error);
    res.status(500).send({ error: "Failed to get Redis key." });
  }
});
app.get("/", (req, res) => {
  res.send("Backend is running!");
});

app.get("/api/market", (req, res) => {
  const mockData = {
    NIFTY: {
      value: (19700 + Math.random() * 100).toFixed(2),
      change: (Math.random() * 50 - 25).toFixed(2),
    },
    SENSEX: {
      value: (66000 + Math.random() * 100).toFixed(2),
      change: (Math.random() * 50 - 25).toFixed(2),
    },
  };
  res.json(mockData);
});

app.listen(PORT, () => {
  logger.info(`Server is running and listening on PORT: ${PORT}`);
  // Once the server is running, initialize the WebSocket service.
  // This will handle reconnecting on server restarts if a token exists.
  //marketDataService.initialize();
});
