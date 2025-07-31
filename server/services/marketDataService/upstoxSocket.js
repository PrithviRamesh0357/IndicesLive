//WebSocket Client logic module
// It will connect to Upstox websocket
//AUthenticate using our Access Token
//Subscribe to instruments

const WebSocket = require("ws");
const EventEmitter = require("events");

const marketEmitter = new EventEmitter();
const UPSTOX_WS_URL = "wss://api.upstox.com/feed/market-data-feed/v1/websocket";
const ACCESS_TOKEN = process.env.UPSTOX_ACCESS_TOKEN;

let ws;
function connectSocket() {
  //Create a new WebSocket
  ws = new WebSocket(UPSTOX_WS_URL, {
    headers: {
      Authorization: `Bearer ${ACCESS_TOKEN}`,
    },
  });

  //Listen to events:
  ws.on("open", () => {
    console.log("WebSocket connection established");
    // Subscribe to instruments here
    const subscribeMessage = {
      type: "subscribe",
      instruments: ["NSE_EQ:RELIANCE", "BSE_EQ:TCS"],
    };

    ws.send(JSON.stringify(subscribeMessage));
  });

  /*
  
      ws.on("open", () => {
        console.log("WebSocket connection established");
        // Subscribe to instruments here
        const subscribeMessage = {
        type: "subscribe",
        instruments: ["NSE_EQ:RELIANCE", "NSE_EQ:TCS"], // Example instruments
        };
        ws.send(JSON.stringify(subscribeMessage));
    });
    ws.on("message", (data) => {
        try {
            const message = JSON.parse(data);
            if (message.type === "data") {
                marketEmitter.emit("marketData", message.data);
            }
        } catch (error) {
            console.error("Error parsing WebSocket message:", error);
        }
    });
    ws.on("error", (error) => {
        console.error("WebSocket error:", error);
    });
    ws.on("close", () => {
        console.log("WebSocket connection closed, reconnecting...");
        setTimeout(connectWebSocket, 5000); // Reconnect after 5 seconds
    });

    */
}
