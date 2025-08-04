// Import required modules
const WebSocket = require("ws").WebSocket;
//const protobuf = require("protobufjs");
const axios = require("axios");
const logger = require("../../utils/logger");

// Initialize global variables
// let protobufRoot = null;

// Function to authorize the market data feed
const getMarketFeedUrl = async (accessToken) => {
  const url = "https://api.upstox.com/v3/feed/market-data-feed/authorize";
  const headers = {
    Accept: "application/json",
    Authorization: `Bearer ${accessToken}`,
  };
  const response = await axios.get(url, { headers });
  logger.info("getMarketFeed:", response.data.data.authorizedRedirectUri);
  return response.data.data.authorizedRedirectUri;
};

// Function to establish WebSocket connection
const connectWebSocket = async (wsUrl) => {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(wsUrl, {
      followRedirects: true,
    });

    // WebSocket event handlers
    ws.on("open", () => {
      console.log("connected");
      resolve(ws); // Resolve the promise once connected

      // Set a timeout to send a subscription message after 1 second
      setTimeout(() => {
        const data = {
          guid: "someguid",
          method: "sub",
          data: {
            mode: "full",
            instrumentKeys: ["NSE_INDEX|Nifty Bank", "NSE_INDEX|Nifty 50"],
          },
        };
        ws.send(Buffer.from(JSON.stringify(data)));
      }, 1000);
    });

    ws.on("close", () => {
      console.log("disconnected");
    });

    ws.on("message", (data) => {
      logger.info(`Data reeived, need to decode it now`);
      //console.log(JSON.stringify(decodeProfobuf(data))); // Decode the protobuf message on receiving it
    });

    ws.on("error", (error) => {
      console.log("error:", error);
      reject(error); // Reject the promise on error
    });
  });
};

// Function to initialize the protobuf part
// const initProtobuf = async () => {
//   protobufRoot = await protobuf.load(__dirname + "/MarketDataFeedV3.proto");
//   console.log("Protobuf part initialization complete");
// };

// Function to decode protobuf message
// const decodeProfobuf = (buffer) => {
//   if (!protobufRoot) {
//     console.warn("Protobuf part not initialized yet!");
//     return null;
//   }

//   const FeedResponse = protobufRoot.lookupType(
//     "com.upstox.marketdatafeederv3udapi.rpc.proto.FeedResponse"
//   );
//   return FeedResponse.decode(buffer);
// };

// Main function to initiate the WebSocket connection
const connectToUpstoxV3 = async (accessToken) => {
  if (!accessToken) {
    logger.error("Cannot connect to V3 WebSocket: No access token provided.");
    return;
  }

  try {
    logger.info("Initiating Upstox V3 WebSocket connection...");
    // await initProtobuf(); // Initialize protobuf
    const wsUrl = await getMarketFeedUrl(accessToken); // Get the market feed URL
    logger.info("Now connecting to websocket");
    const ws = await connectWebSocket(wsUrl); // Connect to the WebSocket
    logger.info("Upstox V3 WebSocket connection process started successfully.");
  } catch (error) {
    logger.error("An error occurred during V3 WebSocket connection:", {
      message: error.message,
      response: error.response?.data,
    });
  }
};

module.exports = { connectToUpstoxV3 };
