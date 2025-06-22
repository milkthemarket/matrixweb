/**
 * Firebase Cloud Function to fetch Alpaca Paper Account Info securely
 */

const { onRequest } = require("firebase-functions/v2/https");
const functions = require("firebase-functions");
const logger = require("firebase-functions/logger");
const fetch = require("node-fetch"); // Make sure to run 'npm install node-fetch' in the functions directory

// Example Hello World function (can be removed or left commented)
/*
exports.helloWorld = onRequest((request, response) => {
  logger.info("Hello logs!", {structuredData: true});
  response.send("Hello from Firebase!");
});
*/

// Alpaca Paper Trading Account Info Endpoint
exports.alpacaAccount = onRequest(async (request, response) => {
  const paperKey = functions.config().alpaca.paper_key;
  const paperSecret = functions.config().alpaca.paper_secret;
  const baseUrl = "https://paper-api.alpaca.markets";

  try {
    const res = await fetch(`${baseUrl}/v2/account`, {
      headers: {
        'APCA-API-KEY-ID': paperKey,
        'APCA-API-SECRET-KEY': paperSecret,
      },
    });

    if (!res.ok) {
      logger.error("Failed to fetch Alpaca account data:", await res.text());
      response.status(res.status).send("Error fetching Alpaca account info");
      return;
    }

    const data = await res.json();
    response.status(200).json(data);
  } catch (err) {
    logger.error("Exception fetching Alpaca account data:", err);
    response.status(500).send("Error fetching Alpaca account info");
  }
});
