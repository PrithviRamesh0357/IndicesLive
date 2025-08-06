const { Server } = require("socket.io");
const logger = require("../utils/logger");
const dataStore = require("./marketDataService/dataStore");

let io = null;

/**
 * Initializes the WebSocket server and sets up event listeners.
 * @param {http.Server} httpServer - The HTTP server instance to attach to.
 */
function initWebSocketServer(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: "*", // Be more specific in production, e.g., 'http://localhost:3001'
      methods: ["GET", "POST"],
    },
  });

  logger.info("WebSocket server initialized");

  io.on("connection", (socket) => {
    logger.info(`New client connected: ${socket.id}`);

    socket.on("disconnect", () => {
      logger.info(`Client disconnected: ${socket.id}`);
    });
  });

  // Listen for 'newData' events from the dataStore
  dataStore.on("newData", (data) => {
    // The data is already formatted with a simple key, e.g., { NIFTY_50: { ... } }
    logger.info("Data being emitted*********TO THE CLIENT NOW", data);
    broadcast({ type: "newData", payload: data });
  });

  return io;
}

function broadcast(data) {
  if (io) {
    io.emit(data.type, data.payload);
    logger.info(`Broadcasting event '${data.type}' to all clients.`, {
      payload: data.payload,
    });
  } else {
    logger.warn(
      "Attempted to broadcast, but WebSocket server is not initialized."
    );
  }
}

module.exports = { initWebSocketServer, broadcast };
