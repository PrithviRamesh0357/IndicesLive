const express = require("express");
const cors = require("cors");
const PORT = process.env.PORT || 3000;

const logger = require("./utils/logger");
const RedisService = require("./services/redisService");
const marketDataService = require("./services/marketDataService/upstoxSocket");

const app = express();

app.use(cors());
const authRoutes = require("./routes/auth");
app.use("/auth", authRoutes);

app.get("/test-token", async (req, res) => {
  const token = await RedisService.get("UPSTOX_ACCESS_TOKEN");
  res.send({ token });
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

app.listen(PORT, "0.0.0.0", () => {
  logger.info(`Server is running and listening on PORT: ${PORT}`);
  // Once the server is running, initialize the WebSocket service.
  // This will handle reconnecting on server restarts if a token exists.
  marketDataService.initialize();
});
