const axios = require("axios");
const qs = require("qs");
const RedisService = require("./redisService");
const logger = require("../utils/logger");

const UpstoxSocketService = require("./marketDataService/upstoxSocket");
// --- Constants for configuration ---
const UPSTOX_TOKEN_URL = "https://api.upstox.com/v2/login/authorization/token";
const REDIS_ACCESS_TOKEN_KEY = "UPSTOX_ACCESS_TOKEN";
const ACCESS_TOKEN_TTL_SECONDS = 6 * 60 * 60; // 6 hours

async function exchangeCodeForToken(code) {
  try {
    logger.info("Entering exchangeCodeForToken function");

    logger.debug(`UPSTOX_REDIRECT_URI: ${process.env.UPSTOX_REDIRECT_URI}`);

    const payload = {
      code: code,
      grant_type: "authorization_code",
      client_id: process.env.UPSTOX_CLIENT_ID,
      client_secret: process.env.UPSTOX_CLIENT_SECRET,
      redirect_uri: process.env.UPSTOX_REDIRECT_URI,
    };

    logger.info("Exchanging authorization code for access token...");

    // The Upstox API expects the payload in a URL-encoded format, not JSON.
    // We use qs.stringify to convert the payload object into a query string.
    const response = await axios.post(UPSTOX_TOKEN_URL, qs.stringify(payload), {
      headers: {
        // This header specifies the format of the request body we are sending.
        "Content-Type": "application/x-www-form-urlencoded",
        // This header tells the server we accept a JSON response.
        accept: "application/json",
      },
    });

    const { access_token: accessToken } = response.data;

    if (!accessToken) {
      // This handles cases where the API responds with 200 OK but no token.
      logger.error("Upstox API response did not include an access token.", {
        responseData: response.data,
      });
      throw new Error("Access token not found in Upstox API response.");
    }

    // Security Best Practice: Confirm receipt of the token without logging the token itself.
    // This prevents sensitive credentials from being exposed in logs.
    logger.info("Received access token. Setting it in Redis...");

    await RedisService.set(
      REDIS_ACCESS_TOKEN_KEY,
      accessToken,
      ACCESS_TOKEN_TTL_SECONDS
    );
    logger.info(
      `Access token saved to Redis with key: ${REDIS_ACCESS_TOKEN_KEY}`
    );

    // Since the token is now stored in Redis, we can initialize the WebSocket connection.
    console.log("Initializing Upstox WebSocket connection...");

    UpstoxSocketService.connect();

    logger.info("Exiting from exchangeCodeForToken function");

    return accessToken;
  } catch (error) {
    logger.error("Failed to exchange code for token.", {
      // Log structured error details for better debugging
      isAxiosError: error.isAxiosError,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });
    // Re-throw the error to be handled by the calling function (e.g., in the route handler)
    throw error;
  }
}

module.exports = { exchangeCodeForToken };
