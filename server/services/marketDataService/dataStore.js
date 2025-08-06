//In-memory store for latest data
//We import Node.js's built-in EventEmitter. This is the foundation for our event-driven design.
const EventEmitter = require("events");
const logger = require("../../utils/logger");

/**
 * A simple in-memory store for the latest market data.
 * The data is stored in a Map where the key is the instrument key (e.g., "NSE_INDEX|Nifty 50")
 * and the value is the latest data object for that instrument.
 */
//By extending EventEmitter, our MarketDataStore class inherits all its capabilities, most importantly the .emit() and .on()
//We initialize our in-memory cache as a Map. A Map is generally preferred over a plain JavaScript {} Object for this use case because it's specifically optimized for frequent additions and lookups of keyed data.
class MarketDataStore extends EventEmitter {
  constructor() {
    super();
    this.store = new Map();
    logger.info("MarketDataStore initialized.");
  }

  /**
   * Updates the data for a specific instrument.
   * @param {string} instrumentKey - The key for the instrument (e.g., "NSE_INDEX|Nifty 50").
   * @param {object} data - The latest data object for the instrument.
   */
  updateInstrumentData(instrumentKey, data) {
    this.store.set(instrumentKey, data);

    // After updating, format the data and emit an event for WebSocket broadcasting
    const formattedData = this.getFormattedDataForEvent(instrumentKey);
    if (formattedData) {
      // Create a simpler key for the frontend, e.g., "NIFTY_50" from "NSE_INDEX|Nifty 50"
      const simpleKey = instrumentKey
        .split("|")[1]
        .replace(" ", "_")
        .toUpperCase();
      // Emit an event with the data ready for the frontend

      logger.info("Now emitting the data from DATA STORE*****");
      this.emit("newData", { [simpleKey]: formattedData });
    }
  }

  /**
   * Formats the data for a specific instrument to be sent in the WebSocket event.
   * @param {string} instrumentKey - The key for the instrument.
   * @returns {object | null} An object containing the formatted data, or null if formatting fails.
   */
  getFormattedDataForEvent(instrumentKey) {
    const data = this.store.get(instrumentKey);
    if (!data) {
      logger.warn(`No data found for instrument key: ${instrumentKey}`);
      return null;
    }

    const ltpc =
      data?.fullFeed?.indexFF?.ltpc || data?.fullFeed?.marketFF?.ltpc;

    if (ltpc && ltpc.ltp != null && ltpc.cp != null) {
      const change = ltpc.ltp - ltpc.cp;
      const percentChange = ((change / ltpc.cp) * 100).toFixed(2);
      logger.info("Data fetched successfully", {
        ltp: ltpc.ltp.toFixed(2),
        change: change.toFixed(2),
        percentChange,
      });

      return {
        value: ltpc.ltp.toFixed(2),
        change: change.toFixed(2),
        percentChange: `${percentChange > 0 ? "+" : ""}${percentChange}%`,
      };
    } else {
      logger.warn(
        `LTP or CP data missing for instrument key: ${instrumentKey}`
      );
      return null;
    }
  }
  /**
   * Retrieves the latest data for a specific instrument.
   * @param {string} instrumentKey - The key for the instrument.
   * @returns {object | undefined} The latest data or undefined if not found.
   */
  getInstrumentData(instrumentKey) {
    return this.store.get(instrumentKey);
  }

  /**
   * Retrieves all stored instrument data.
   * @returns {object} An object representation of the store.
   */
  getAllData() {
    return Object.fromEntries(this.store);
  }

  /**
   * Retrieves and formats all data in the store. Ideal for REST API endpoints.
   * @returns {object} An object where keys are simplified instrument names and values are formatted data.
   */
  getAllFormattedData() {
    const formatted = {};
    for (const instrumentKey of this.store.keys()) {
      const formattedData = this.getFormattedDataForEvent(instrumentKey);
      if (formattedData) {
        const simpleKey = instrumentKey
          .split("|")[1]
          .replace(" ", "_")
          .toUpperCase();
        formatted[simpleKey] = formattedData;
      }
    }
    return formatted;
  }
}

// Export a single instance (singleton pattern)
module.exports = new MarketDataStore();
