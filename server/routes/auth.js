const express = require("express");
const router = express.Router();
const logger = require("../utils/logger");

const { exchangeCodeForToken } = require("../services/authService");
const { connectSocket } = require("../services/marketDataService/upstoxSocket");

router.get("/callback", async (req, res) => {
  const code = req.query.code;
  logger.info(`Received authorization code. ${code}`);

  try {
    const token = await exchangeCodeForToken(code);
    // The token is now saved to Redis within the authService.
    logger.info(
      "Authentication successful. Triggering WebSocket connection...Commented it"
    );
    //connectSocket(); // Initiate the market data feed connection.
    res.json({ access_token: token });
  } catch (error) {
    // Log more detailed error information from the API response if it exists.
    // This will show the exact error message from the Upstox API.
    const errorDetails = error.response
      ? error.response.data
      : { message: error.message };
    logger.error("Token exchange failed. API Response:", { errorDetails });

    res
      .status(500)
      .json({ error: "Token exchange failed", details: errorDetails });
  }
});

module.exports = router;
