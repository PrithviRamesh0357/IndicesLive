//WebSocket Client logic module (Serer is the upstox)
// It will connect to Upstox websocket
//Authenticate using our Access Token
//Subscribe to instruments
// The upstoxSocket.js module is now responsible for one thing: connecting to the Upstox feed and translating its raw messages into clean, application-level events.

const WebSocket = require("ws");
const EventEmitter = require("events");
const RedisService = require("../redisService");
const logger = require("../../utils/logger");

const UPSTOX_WS_URL = "wss://api-v2.upstox.com/feed/market-data-feed";
const REDIS_ACCESS_TOKEN_KEY = "UPSTOX_ACCESS_TOKEN";

class UpstoxSocketService {
  constructor() {
    this.ws = null;
    this.accessToken = null;
    // This emitter provides a clean abstraction layer for the rest of the app.
    //This is important as if this singleto patter changes in future then also the multiple instances will have their own event emitter. If it was not there then all the instances will have same event emitter and that will cause issues.
    this.marketEmitter = new EventEmitter();
  }

  async connect() {
    try {
      // CRITICAL: Always fetch the latest access token from Redis before connecting.
      logger.info(
        "In connect function of WS.. This needsto be called only once"
      );
      // This ensures we always use the most up-to-date token.
      logger.info("Fetching access token from Redis...");

      this.accessToken = await RedisService.get(REDIS_ACCESS_TOKEN_KEY);
      if (!this.accessToken) {
        logger.error(
          "Cannot connect to WebSocket: Access token not found in Redis. Please authenticate first."
        );
        return;
      }

      logger.info("Attempting to connect to Upstox WebSocket...");
      //This initiates the WebSocket connection/ handshake to Upstox.It sends an HTTP request to the UPSTOX_WS_URL with a special Upgrade: websocket header.
      this.ws = new WebSocket(UPSTOX_WS_URL, {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          "Api-Version": "2.0", // Required for v2 API
        },
      });

      // Set up event listeners for the WebSocket connection.is prepare for the conversation with Upstox.At this moment the Websocket is live. We do this because do not want to miss out any events importantly the initial open event which tells the handshake is successful and we can start sending messages.
      logger.info("Setting up event listeners for WebSocket...");
      this.setupEventListeners();
    } catch (error) {
      logger.error("Failed to initialize WebSocket connection.", {
        message: error.message,
      });
    }
  }

  //Imp: We are handling ou fnction calls to ws library.. So context is needed. At some time..When the WebSocket connection finally opens, the ws library looks at your note for function  and calls the function. But it calls it from its own context. It has no idea that this function "belongs" to your UpstoxSocketService instance. Thats why we use arrow functions here. Arrow functions do not have their own context, so they will always use the context of the UpstoxSocketService instance. () => ... does not have its own this. Instead, it "captures" the this from its surrounding environment. When this line runs inside setupEventListeners, this correctly points to the UpstoxSocketService instance. The arrow function captures that this and holds onto it. Later, when the ws library calls the simple arrow function, the arrow function turns around and calls this.onOpen(), using the this it remembered.Earlier to () ES6 we used to use .bind(this) to bind the context of the function to the UpstoxSocketService instance.

  setupEventListeners() {
    logger.info("Setting up WebSocket event listeners...");
    this.ws.on("open", () => this.onOpen());
    this.ws.on("message", (data) => this.onMessage(data));
    this.ws.on("error", (error) => this.onError(error));
    this.ws.on("close", (code, reason) => this.onClose(code, reason));
    logger.info("WebSocket event listeners set up successfully.");
  }

  onOpen() {
    logger.info(
      "This will trigger when the WebSocket connection is established. Whnthe handshake is successful, the WebSocket connection is open, and we can start sending messages."
    );
    logger.info("Upstox WebSocket connection established successfully.");
    logger.info("Subscribing to instruments...");
    // After the connection is open, we can subscribe to instruments.
    this.subscribeToInstruments();
  }

  onMessage(data) {
    // NOTE: The live feed sends binary data (protobuf), not JSON.
    // The logic to decode this will go into `decoder.js`.
    // For now, we'll log the raw data.
    logger.debug("Received raw WebSocket data.", { data: data.toString() });

    // Placeholder for when the decoder is implemented:
    // const decodedData = Decoder.decode(data);
    // this.marketEmitter.emit("marketData", decodedData);
  }

  onError(error) {
    logger.error("Upstox WebSocket error:", { message: error.message });
  }

  onClose(code, reason) {
    // The reason is often a Buffer, so we convert it to a string for logging.
    const reasonStr = reason ? reason.toString() : "No reason given";
    logger.warn("Upstox WebSocket connection closed.", {
      code,
      reason: reasonStr,
    });
    this.ws = null; // Clear the old socket instance
  }

  subscribeToInstruments() {
    const subscribeMessage = {
      guid: "market-tracker-1", // A unique identifier for the subscription request
      method: "sub",
      data: {
        mode: "full", // Can be 'ltpc', 'quote', or 'full'
        instrumentKeys: ["NSE_EQ|INE002A01018", "NSE_EQ|INE049A01021"], // Example: Reliance, TCS
      },
    };
    this.ws.send(JSON.stringify(subscribeMessage));
    logger.info("Subscription message sent for instruments.", {
      instruments: subscribeMessage.data.instrumentKeys,
    });
  }
}

// Export a single instance (singleton pattern) so the rest of the app uses the same connection.
module.exports = new UpstoxSocketService();
