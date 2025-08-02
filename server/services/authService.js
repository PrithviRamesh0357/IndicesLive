const axios = require("axios");
const qs = require("qs");
require("dotenv").config();
const RedisService = require("./redisService");
const logger = require("../utils/logger");

async function exchangeCodeForToken(code) {
  try {
    console.log("Entering exchangeCodeForToken function");

    console.log("UPSTOX_REDIRECT_URI:", process.env.UPSTOX_REDIRECT_URI);

    const payload = {
      code: code,
      grant_type: "authorization_code",
      client_id: process.env.UPSTOX_CLIENT_ID,
      client_secret: process.env.UPSTOX_CLIENT_SECRET,
      redirect_uri: process.env.UPSTOX_REDIRECT_URI,
    };

    logger.info("Exchanging authorization code for access token...");

    //Cannot send the payload as JSON, as the Upstox API expects it in a URL-encoded format.i.e a string like `key1=value1&key2=value2`
    //So we use qs.stringify to convert the payload object into a query string format.
    const response = await axios.post(
      "https://api.upstox.com/v2/login/authorization/token",
      //
      qs.stringify(payload),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded", //We need response as a encoded string not a JSON object. It will look like a query string in URL
          accept: "application/json",
        },
      }
    );

    const accessToken = response.data.access_token;

    // Standardize on this key, as it's used by the WebSocket service.
    const redisKey = "UPSTOX_ACCESS_TOKEN";
    const sixHoursInSeconds = 6 * 60 * 60;

    logger.info("Received Access KEY...Setting it in Redis  " + accessToken);

    await RedisService.set(redisKey, accessToken, sixHoursInSeconds);
    logger.info(`Access token saved to Redis with key: ${redisKey}`);

    logger.info("Exiting from exchangeCodeForTokn function");

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
