import { useEffect, useState } from "react";
import socket from "./clientSocketService";
//import logger from "../../../server/utils/logger";
import axios from "axios";

const MarketWidget = () => {
  const [data, setData] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  const fetchData = async () => {
    try {
      console.log("Fetching data...");

      const res = await axios.get("http://localhost:3000/api/market");
      setData(res.data);
    } catch (err) {
      console.error("Error fetching market data:", err);
    }
  };

  useEffect(() => {
    console.log("In Use effect...");
    console.log("SOCKET DATA:", socket);
    fetchData();

    function onConnect() {
      console.log("In onConnect...");
      setIsConnected(true);
      console.log(isConnected);
    }
    function onDisconnect() {
      console.log("In onDisconnect...");
      setIsConnected(false);
    }

    function onNewData(value) {
      console.log("In onNewData...IMPORTANT", value);
      //setData(value);
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("newData", onNewData);

    //Cleanup on unmount
    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("newData", onNewData);
    };
  }, []);

  if (!data) {
    return (
      <div
        style={{ padding: "10px", color: "#f0f0f0", fontFamily: "sans-serif" }}
      >
        Connecting and waiting for data...
      </div>
    );
  }

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
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span>📈 Market Tracker</span>
        <span
          title={isConnected ? "Connected" : "Disconnected"}
          style={{
            height: "10px",
            width: "10px",
            backgroundColor: isConnected ? "#4ade80" : "#f87171", // green or red
            borderRadius: "50%",
            display: "inline-block",
          }}
        ></span>
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

/* Ecplination 

Here is a step-by-step explanation of what happens when your MarketWidget component runs:

Socket Initialization (Happens first!): Before your component even renders, the import socket from "./clientSocketService" line is processed. This runs the code in clientSocketService.js. That file creates a single, global socket instance using io(SERVER_URL, ...) and, because autoConnect is true, it immediately starts trying to connect to your server at http://localhost:3000 in the background.

Component Renders: Your MarketWidget component renders for the first time. Since data is initially null, it displays the "Connecting and waiting for data..." message.

useEffect Runs: After the component is on the screen, React runs the code inside your useEffect hook.

Registering the Event Listener: This is the key part. The line socket.on("connect", onConnect); does not call the onConnect function right away. Instead, it acts like you're giving the socket object a set of instructions. You are telling it:

"Hey, you're currently trying to connect to the server. I don't know when it will happen, but when you finally succeed, please execute the onConnect function for me."

The Connection Happens: A moment later (hopefully!), the socket object successfully establishes a connection with your server. The socket.io-client library recognizes this success and internally emits a special, built-in event named "connect".

The Callback is Triggered: Because you registered a listener for the "connect" event in step 4, the socket object now invokes your onConnect function.

State is Updated: The onConnect function runs, calling setIsConnected(true). This updates the component's state, causing a re-render, and your connection status indicator turns green.

In short, socket.on() is for setting up a "listener" or "subscription" for a future event. It prepares your component to react to something that will happen asynchronously, which is perfect for handling network connections.


Handshake:
Request URL
ws://localhost:3000/socket.io/?EIO=4&transport=websocket
Request Method
GET
Status Code
101 Switching Protocols

Ressp method: 
HTTP/1.1 101 Switching Protocols
Upgrade: websocket
Connection: Upgrade
access-control-allow-origin
*


This 101 status is the key. It's the server's successful response to the client's initial HTTP request, saying, "Okay, I agree. Let's switch from the HTTP protocol to the WebSocket protocol for the rest of our conversation." Once you see that, the handshake is complete, and the connection is live. You can then click on that request and look at the "Messages" or "Frames" tab to see the actual data being sent back and forth.

["newData", {NIFTY_BANK: {value: "55170.70", change: "-350.45", percentChange: "-0.63%"}}]

On the Server (In Your Terminal)
Your server also knows when a handshake is successful because it's the one that approves it. The socket.io library on the server emits its own connection event at that moment.

You can see this by adding a log inside your server's connection event handler. In your webSocketServer.js file, you likely have a block that looks like this:

io.on('connection', (socket) => { ... });

If you place a console.log right inside that handler, like console.log('A client has connected successfully! Socket ID:', socket.id);, it will print a message in your terminal every single time a new client completes the handshake. This is the server-side confirmation that the connection was established.

Server side: New client connected: jcRjjJduXcFbbCGUAAAD


*/
