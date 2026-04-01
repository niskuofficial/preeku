import http from "http";
import app from "./app";
import { logger } from "./lib/logger";
import { startPriceSync } from "./angel/priceSync";
import { smartStream } from "./angel/smartstream";
import { createPriceHub } from "./angel/priceHub";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error("PORT environment variable is required but was not provided.");
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

const server = http.createServer(app);

server.listen(port, async () => {
  logger.info({ port }, "Server listening");

  createPriceHub(server);

  if (process.env.ANGEL_API_KEY && process.env.ANGEL_CLIENT_ID) {
    logger.info("Starting Angel One price sync (REST every 5s)...");
    startPriceSync(5000);

    logger.info("Connecting to Angel One SmartStream WebSocket...");
    try {
      await smartStream.start();
    } catch (err) {
      logger.warn({ err }, "SmartStream failed to start — falling back to REST polling");
    }
  } else {
    logger.warn("Angel One credentials not configured — using mock prices");
  }
});
