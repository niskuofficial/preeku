import app from "./app";
import { logger } from "./lib/logger";
import { startPriceSync } from "./angel/priceSync";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");

  if (process.env.ANGEL_API_KEY && process.env.ANGEL_CLIENT_ID) {
    logger.info("Starting Angel One live price sync...");
    startPriceSync(30000);
  } else {
    logger.warn("Angel One credentials not configured — using mock prices");
  }
});
