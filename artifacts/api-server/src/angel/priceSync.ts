import { db, stocksTable } from "@workspace/db";
import { getMarketQuotes } from "./client";
import { eq } from "drizzle-orm";
import { smartStream } from "./smartstream";
import type { PriceTick } from "./smartstream";

const SYMBOL_TOKEN_MAP: Record<string, { token: string; exchange: string; angelSymbol: string }> = {
  RELIANCE: { token: "2885", exchange: "NSE", angelSymbol: "RELIANCE-EQ" },
  TCS: { token: "11536", exchange: "NSE", angelSymbol: "TCS-EQ" },
  HDFCBANK: { token: "1333", exchange: "NSE", angelSymbol: "HDFCBANK-EQ" },
  INFY: { token: "1594", exchange: "NSE", angelSymbol: "INFY-EQ" },
  HINDUNILVR: { token: "1394", exchange: "NSE", angelSymbol: "HINDUNILVR-EQ" },
  ICICIBANK: { token: "4963", exchange: "NSE", angelSymbol: "ICICIBANK-EQ" },
  KOTAKBANK: { token: "1922", exchange: "NSE", angelSymbol: "KOTAKBANK-EQ" },
  BAJFINANCE: { token: "317", exchange: "NSE", angelSymbol: "BAJFINANCE-EQ" },
  SBIN: { token: "3045", exchange: "NSE", angelSymbol: "SBIN-EQ" },
  BHARTIARTL: { token: "10604", exchange: "NSE", angelSymbol: "BHARTIARTL-EQ" },
  ITC: { token: "1660", exchange: "NSE", angelSymbol: "ITC-EQ" },
  WIPRO: { token: "3787", exchange: "NSE", angelSymbol: "WIPRO-EQ" },
  HCLTECH: { token: "7229", exchange: "NSE", angelSymbol: "HCLTECH-EQ" },
  MARUTI: { token: "10999", exchange: "NSE", angelSymbol: "MARUTI-EQ" },
  SUNPHARMA: { token: "3351", exchange: "NSE", angelSymbol: "SUNPHARMA-EQ" },
  TITAN: { token: "3506", exchange: "NSE", angelSymbol: "TITAN-EQ" },
  ADANIENT: { token: "25", exchange: "NSE", angelSymbol: "ADANIENT-EQ" },
  BAJAJFINSV: { token: "16675", exchange: "NSE", angelSymbol: "BAJAJFINSV-EQ" },
  NESTLEIND: { token: "17963", exchange: "NSE", angelSymbol: "NESTLEIND-EQ" },
  ASIANPAINT: { token: "236", exchange: "NSE", angelSymbol: "ASIANPAINT-EQ" },
  TATASTEEL: { token: "3499", exchange: "NSE", angelSymbol: "TATASTEEL-EQ" },
  ONGC: { token: "2475", exchange: "NSE", angelSymbol: "ONGC-EQ" },
  COALINDIA: { token: "20374", exchange: "NSE", angelSymbol: "COALINDIA-EQ" },
  POWERGRID: { token: "14977", exchange: "NSE", angelSymbol: "POWERGRID-EQ" },
  NTPC: { token: "11630", exchange: "NSE", angelSymbol: "NTPC-EQ" },
  LTIM: { token: "17818", exchange: "NSE", angelSymbol: "LTIM-EQ" },
  TECHM: { token: "13538", exchange: "NSE", angelSymbol: "TECHM-EQ" },
};

let lastSyncAt = 0;
let syncing = false;

export function getTokenMap() {
  return SYMBOL_TOKEN_MAP;
}

export async function syncPrices(force = false): Promise<{ synced: number; errors: string[] }> {
  const now = Date.now();
  if (!force && (syncing || now - lastSyncAt < 15000)) {
    return { synced: 0, errors: [] };
  }

  syncing = true;
  const errors: string[] = [];
  let synced = 0;

  try {
    const nseTokens = Object.values(SYMBOL_TOKEN_MAP).map((v) => v.token);
    const quotes = await getMarketQuotes(nseTokens);

    for (const [symbol, meta] of Object.entries(SYMBOL_TOKEN_MAP)) {
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
      const tick: PriceTick = {
        token: meta.token,
        symbol,
        ltp: quote.ltp,
        open: quote.open ?? 0,
        high: quote.high ?? 0,
        low: quote.low ?? 0,
        close: prevClose,
        volume: quote.volume ?? 0,
        change,
        changePercent: prevClose > 0 ? (change / prevClose) * 100 : 0,
        timestamp: Date.now(),
      };
      smartStream.emit("tick", tick);

      synced++;
    }

    lastSyncAt = Date.now();
  } catch (err) {
    errors.push(err instanceof Error ? err.message : String(err));
  } finally {
    syncing = false;
  }

  return { synced, errors };
}

export function startPriceSync(intervalMs = 30000) {
  syncPrices(true).catch(console.error);
  const id = setInterval(() => {
    syncPrices().catch(console.error);
  }, intervalMs);
  return id;
}
