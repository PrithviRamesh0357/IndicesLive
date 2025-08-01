const axios = require("axios");
const qs = require("qs");
require("dotenv").config();
//const RedisService = require("./redisService");
const logger = require("../utils/logger");

async function exchangeCodeForToken(code) {
  console.log("Entering exchangeCodeForToken function");

  console.log("UPSTOX_CLIENT_ID:", process.env.UPSTOX_CLIENT_ID);
  console.log("UPSTOX_CLIENT_SECRET:", process.env.UPSTOX_CLIENT_SECRET);
  console.log("UPSTOX_REDIRECT_URI:", process.env.UPSTOX_REDIRECT_URI);

  // const payload = {
  //   code: code,
  //   grant_type: "authorization_code",
  //   client_id: process.env.UPSTOX_CLIENT_ID,
  //   client_secret: process.env.UPSTOX_CLIENT_SECRET,
  //   redirect_uri: process.env.UPSTOX_REDIRECT_URI,
  // };

  const payload = {
    code: code,
    grant_type: "authorization_code",
    client_id: "f4f1d4a9-20fa-4543-a12d-960194a0385d",
    client_secret: "s4ar716g3g",
    redirect_uri: "https://indiceslive.onrender.com/auth/callback",
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

  logger.info("Received Access KEY... " + accessToken);

  //await RedisService.set(redisKey, accessToken, sixHoursInSeconds);
  //logger.info(`Access token saved to Redis with key: ${redisKey}`);

  logger.info("Exiting from exchangeCodeForTokn function");

  return accessToken;
}

module.exports = { exchangeCodeForToken };
