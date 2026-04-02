import { db, stocksTable } from "@workspace/db";
import { getMarketQuotes } from "./client";
import { eq } from "drizzle-orm";
import { smartStream } from "./smartstream";
import type { PriceTick } from "./smartstream";
import { FULL_SYMBOL_TOKEN_MAP } from "./symbolTokenMap";

const REALTIME_SYMBOLS = new Set([
  "RELIANCE","TCS","HDFCBANK","INFY","HINDUNILVR","ICICIBANK","KOTAKBANK",
  "BAJFINANCE","SBIN","BHARTIARTL","ITC","WIPRO","HCLTECH","MARUTI",
  "SUNPHARMA","TITAN","ADANIENT","BAJAJFINSV","NESTLEIND","ASIANPAINT",
  "TATASTEEL","ONGC","COALINDIA","POWERGRID","NTPC","LTIM","TECHM",
]);

const BATCH_SIZE = 50;
const ALL_ENTRIES = Object.entries(FULL_SYMBOL_TOKEN_MAP);
let batchIndex = 0;
let syncing = false;

async function syncBatch(entries: [string, { token: string; angelSymbol: string }][]): Promise<number> {
  const nseTokens = entries.map(([, v]) => v.token);
  let quotes: Record<string, { ltp: number; open: number; high: number; low: number; close: number; volume: number }>;
  try {
    quotes = await getMarketQuotes(nseTokens);
  } catch (err) {
    console.error(`[PriceSync] getMarketQuotes error:`, err);
    return 0;
  }
  const quotedCount = Object.keys(quotes).length;
  if (quotedCount === 0) {
    console.warn(`[PriceSync] No quotes returned for batch of ${entries.length} tokens (batchIndex=${batchIndex})`);
  }
  let synced = 0;

  const batchPrices: Record<string, Omit<PriceTick, "token">> = {};

  for (const [symbol, meta] of entries) {
    const quote = quotes[meta.angelSymbol] ?? quotes[symbol] ?? quotes[symbol + "-EQ"];
    if (!quote || !quote.ltp || quote.ltp === 0) continue;

    await db
      .update(stocksTable)
      .set({
        currentPrice: quote.ltp.toFixed(2),
        previousClose: quote.close > 0 ? quote.close.toFixed(2) : undefined,
        high: quote.high > 0 ? quote.high.toFixed(2) : undefined,
        low: quote.low > 0 ? quote.low.toFixed(2) : undefined,
        volume: quote.volume > 0 ? quote.volume : undefined,
        updatedAt: new Date(),
      })
      .where(eq(stocksTable.symbol, symbol));

    const prevClose = quote.close > 0 ? quote.close : quote.ltp;
    const change = quote.ltp - prevClose;
    const changePercent = prevClose > 0 ? (change / prevClose) * 100 : 0;

    batchPrices[symbol] = {
      symbol,
      ltp: quote.ltp,
      open: quote.open ?? 0,
      high: quote.high > 0 ? quote.high : quote.ltp,
      low: quote.low > 0 ? quote.low : quote.ltp,
      close: prevClose,
      volume: quote.volume ?? 0,
      change,
      changePercent,
      timestamp: Date.now(),
    };

    if (REALTIME_SYMBOLS.has(symbol)) {
      const tick: PriceTick = { token: meta.token, ...batchPrices[symbol]! };
      smartStream.emit("tick", tick);
    }

    synced++;
  }

  if (Object.keys(batchPrices).length > 0) {
    smartStream.emit("batchPrices", batchPrices);
    console.log(`[PriceSync] Batch done: ${synced}/${entries.length} stocks, broadcast ${Object.keys(batchPrices).length} prices via WS`);
  } else {
    console.warn(`[PriceSync] Batch done: 0 prices to broadcast. Quotes returned: ${quotedCount}, entries: ${entries.length}`);
  }

  return synced;
}

export async function syncPrices(force = false): Promise<{ synced: number; errors: string[] }> {
  if (syncing) return { synced: 0, errors: [] };

  syncing = true;
  const errors: string[] = [];
  let synced = 0;

  try {
    const batch = ALL_ENTRIES.slice(batchIndex, batchIndex + BATCH_SIZE);
    if (batch.length === 0) {
      batchIndex = 0;
      syncing = false;
      return { synced: 0, errors: [] };
    }

    synced = await syncBatch(batch);
    batchIndex = (batchIndex + BATCH_SIZE) % ALL_ENTRIES.length;
  } catch (err) {
    errors.push(err instanceof Error ? err.message : String(err));
  } finally {
    syncing = false;
  }

  return { synced, errors };
}

export function getTokenMap() {
  return FULL_SYMBOL_TOKEN_MAP;
}

export function startPriceSync(intervalMs = 5000) {
  syncPrices(true).catch(console.error);
  const id = setInterval(() => {
    syncPrices().catch(console.error);
  }, intervalMs);
  return id;
}
