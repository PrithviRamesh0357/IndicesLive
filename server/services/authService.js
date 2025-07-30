const axios = require("axios");
const qs = require("qs");
require("dotenv").config();

let accessToken = null;

async function exchangeCodeForToken(code) {
  const payload = {
    grant_type: "authorization_code",
    client_id: process.env.UPSTOX_CLIENT_ID,
    client_secret: process.env.UPSTOX_CLIENT_SECRET,
    redirect_uri: process.env.UPSTOX_REDIRECT_URI,
  };

  const response = await axios.post(
    "https://api.upstox.com/index/oauth/token",
    qs.stringify(payload),
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );

  accessToken = response.data.access_token;
  return accessToken;
}

function getAccessToken() {
  return accessToken;
}

module.exports = { exchangeCodeForToken, getAccessToken };
