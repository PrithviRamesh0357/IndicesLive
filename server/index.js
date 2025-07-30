const express = require("express");
const cors = require("cors");
const PORT = process.env.PORT || 3000;

const app = express();

app.use(cors());
const authRoutes = require("./routes/auth");
app.use("/auth", authRoutes);
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
  console.log(`Server is running on http://localhost:${PORT}`);
});
