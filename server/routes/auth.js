const express = require("express");
const router = express.Router();

const {
  exchangeCodeForToken,
  getAccessToken,
} = require("../services/authService");

router.get("/callback", async (req, res) => {
  const code = req.query.code;
  console.log("Received code:", code);

  try {
    const token = await exchangeCodeForToken(code);
    res.json({ access_token: token });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Token exchange failed" });
  }
});

module.exports = router;
