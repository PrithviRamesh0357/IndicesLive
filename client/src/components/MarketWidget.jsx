import { useEffect, useState } from "react";
import axios from "axios";

const MarketWidget = () => {
  const [data, setData] = useState(null);

  const fetchData = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/market");
      setData(res.data);
    } catch (err) {
      console.error("Error fetching market data:", err);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!data)
    return (
      <div style={{ color: "#ccc", padding: "10px" }}>
        Loading market data...
      </div>
    );

  return (
    <div
      style={{
        width: "300px",
        border: "1px solid #444",
        borderRadius: "8px",
        backgroundColor: "#1e1e1e", // ✅ Dark background
        color: "#f0f0f0", // ✅ Light text
        overflow: "hidden",
        fontFamily: "sans-serif",
      }}
    >
      {/* ✅ Draggable Header */}
      <div
        style={{
          WebkitAppRegion: "drag",
          backgroundColor: "#333",
          padding: "8px",
          fontWeight: "bold",
          cursor: "move",
          borderBottom: "1px solid #444",
        }}
      >
        📈 Market Tracker
      </div>

      {/* ❌ Non-draggable Content */}
      <div style={{ WebkitAppRegion: "no-drag", padding: "10px" }}>
        <table
          style={{
            width: "100%",
            fontSize: "14px",
            borderCollapse: "collapse",
          }}
        >
          <thead>
            <tr>
              <th style={{ textAlign: "left", paddingBottom: "6px" }}>Index</th>
              <th style={{ textAlign: "left", paddingBottom: "6px" }}>Value</th>
              <th style={{ textAlign: "left", paddingBottom: "6px" }}>
                Change
              </th>
              <th style={{ textAlign: "left", paddingBottom: "6px" }}>%</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(data).map(([key, { value, change }]) => {
              const percent = ((change / value) * 100).toFixed(2);
              const isUp = parseFloat(change) >= 0;
              const color = isUp ? "#4ade80" : "#f87171"; // green or red

              return (
                <tr key={key}>
                  <td>{key}</td>
                  <td>₹{value}</td>
                  <td style={{ color }}>
                    {isUp ? "▲" : "▼"} {Math.abs(change)}
                  </td>
                  <td style={{ color }}>
                    {isUp ? "+" : "-"}
                    {Math.abs(percent)}%
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MarketWidget;
