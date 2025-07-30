const axios = require("axios");
const qs = require("qs");
require("dotenv").config();

let accessToken = null;

async function exchangeCodeForToken(code) {
  const startTime = new Date();
  console.log("Exchanging code for token:IMPORTANT:", code);
  const payload = {
    code: code,
    grant_type: "authorization_code",
    client_id: process.env.UPSTOX_CLIENT_ID,
    client_secret: process.env.UPSTOX_CLIENT_SECRET,
    redirect_uri: process.env.UPSTOX_REDIRECT_URI,
  };

  const response = await axios.post(
    "https://api.upstox.com/v2/login/authorization/token",
    qs.stringify(payload),
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        accept: "application/json",
      },
    }
  );
  console.log("Response:", response.data);
  const endTime = new Date();
  console.log("Time taken for token exchange:", endTime - startTime, "ms");

  accessToken = response.data.access_token;
  console.log("AccessToken:", accessToken);

  return accessToken;
}

function getAccessToken() {
  return accessToken;
}

module.exports = { exchangeCodeForToken, getAccessToken };
