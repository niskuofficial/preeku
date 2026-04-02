import http from "http";
import app from "./app";
import { logger } from "./lib/logger";
import { startPriceSync, startIndicesSync, startRealtimeSync } from "./angel/priceSync";
import { smartStream } from "./angel/smartstream";
import { createPriceHub } from "./angel/priceHub";
import { db, positionsTable } from "@workspace/db";

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
    logger.info("Starting Angel One price sync (batch 50 every 3s + indices every 1s + realtime top-35 every 3s)...");
    startPriceSync(3000);
    startIndicesSync(1000);
    startRealtimeSync(3000);

    logger.info("Connecting to Angel One SmartStream WebSocket...");
    try {
      await smartStream.start();

      // Auto-subscribe all portfolio/holdings stocks for real-time ticks
      await subscribePortfolioStocks();
    } catch (err) {
      logger.warn({ err }, "SmartStream failed to start — falling back to REST polling");
    }
  } else {
    logger.warn("Angel One credentials not configured — using mock prices");
  }
});

async function subscribePortfolioStocks() {
  try {
    const rows = await db
      .selectDistinct({ symbol: positionsTable.symbol })
      .from(positionsTable);
    const symbols = rows.map((r) => r.symbol);
    if (symbols.length > 0) {
      smartStream.addPortfolioTokens(symbols);
      logger.info({ symbols }, `Subscribed ${symbols.length} portfolio stocks to SmartStream`);
    }
  } catch (err) {
    logger.warn({ err }, "Could not subscribe portfolio stocks to SmartStream");
  }
}

// Export for use in orders route — call after any new BUY order
export function subscribeSymbolToSmartStream(symbol: string) {
  smartStream.addPortfolioTokens([symbol]);
}
