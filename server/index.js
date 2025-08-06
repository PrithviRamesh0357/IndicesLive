const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const http = require("http");
const { Server } = require("socket.io");
dotenv.config();

const logger = require("./utils/logger");
const RedisService = require("./services/redisService");
const {
  connectToUpstoxV3,
} = require("./services/marketDataService/upstoxSocketV3");
const { REDIS_ACCESS_TOKEN_KEY } = require("./services/authService");
const dataStore = require("./services/marketDataService/dataStore");
const { initWebSocketServer } = require("./services/webSocketServer");

const app = express();

//Because we need a single PORT for both app and websockets to listen to events
//This creates a server for express
const server = http.createServer(app);

const PORT = process.env.PORT || 3000;

//Initialize the webSocket Server and pass it the http server. This i simportant
initWebSocketServer(server);

logger.debug("Debug log");
logger.info("Info log");
logger.warn("Warning log");
logger.error("Error log");

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
  // const allData = dataStore.getAllData();
  // const formattedData = {};

  // for (const instrumentKey in allData) {
  //   const instrumentData = allData[instrumentKey];
  //   // Safely access nested properties
  //   const ltpc = instrumentData?.fullFeed?.indexFF?.ltpc;

  //   if (ltpc && ltpc.ltp != null && ltpc.cp != null) {
  //     const change = ltpc.ltp - ltpc.cp;
  //     const percentChange = ((change / ltpc.cp) * 100).toFixed(2);

  //     // Create a simpler key for the frontend, e.g., "NIFTY_50" from "NSE_INDEX|Nifty 50"
  //     const simpleKey = instrumentKey
  //       .split("|")[1]
  //       .replace(" ", "_")
  //       .toUpperCase();

  //     formattedData[simpleKey] = {
  //       value: ltpc.ltp.toFixed(2),
  //       change: change.toFixed(2),
  //       percentChange: `${percentChange > 0 ? "+" : ""}${percentChange}%`,
  //     };
  //   }
  // }
  // This now uses the new helper function in dataStore
  const formattedData = dataStore.getAllFormattedData();
  res.json(formattedData);
});

app.get("/api/mock-data", (req, res) => {
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

//Listen on the http server not the app
server.listen(PORT, async () => {
  logger.info(`Server is running and listening on PORT: ${PORT}`);

  // On server startup, check if a token exists and try to connect to the WebSocket.
  try {
    const accessToken = await RedisService.get(REDIS_ACCESS_TOKEN_KEY);
    if (accessToken) {
      logger.info(
        "Access token found in Redis on startup. Attempting to connect to WebSocket..."
      );
      connectToUpstoxV3(accessToken);
    } else {
      logger.warn(
        "No access token found in Redis. Please log in via /auth/login to establish a WebSocket connection."
      );
    }
  } catch (error) {
    logger.error(
      "Failed to initialize WebSocket connection on startup.",
      error
    );
  }
});
