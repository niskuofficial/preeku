import { Router, type IRouter } from "express";
import { db, stocksTable } from "@workspace/db";
import { desc, eq, ilike, or, sql } from "drizzle-orm";
import { getMarketQuotes } from "../angel/client";

const router: IRouter = Router();

function mapStock(s: typeof stocksTable.$inferSelect) {
  const cur = parseFloat(s.currentPrice);
  const prev = parseFloat(s.previousClose);
  return {
    symbol: s.symbol,
    name: s.name,
    exchange: s.exchange,
    sector: s.sector,
    currentPrice: cur,
    previousClose: prev,
    change: prev > 0 ? cur - prev : 0,
    changePercent: prev > 0 ? ((cur - prev) / prev) * 100 : 0,
    high: parseFloat(s.high),
    low: parseFloat(s.low),
    volume: s.volume,
    marketCap: parseFloat(s.marketCap),
  };
}

router.get("/stocks", async (req, res) => {
  try {
    const search = (req.query.search as string | undefined)?.trim();
    const limit = Math.min(parseInt(req.query.limit as string || "100", 10), 500);
    const offset = parseInt(req.query.offset as string || "0", 10);
    const whereClause = search ? or(ilike(stocksTable.symbol, `%${search}%`), ilike(stocksTable.name, `%${search}%`)) : undefined;

    const [stocks, [{ total }]] = await Promise.all([
      db.select().from(stocksTable).where(whereClause).orderBy(desc(stocksTable.marketCap)).limit(limit).offset(offset),
      db.select({ total: sql<number>`count(*)::int` }).from(stocksTable).where(whereClause),
    ]);

    res.setHeader("X-Total-Count", String(total));
    res.setHeader("X-Has-More", String(offset + stocks.length < total));
    res.json(stocks.map(mapStock));
  } catch (err) {
    req.log.error({ err }, "Error fetching stocks");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/stocks/:symbol", async (req, res) => {
  try {
    const { symbol } = req.params;
    const [stock] = await db.select().from(stocksTable).where(eq(stocksTable.symbol, symbol.toUpperCase()));
    if (!stock) {
      res.status(404).json({ error: "Stock not found" });
      return;
    }

    const currentPrice = parseFloat(stock.currentPrice);
    const previousClose = parseFloat(stock.previousClose);

    // Generate simulated price history for the day (intraday)
    const priceHistory = generatePriceHistory(previousClose, currentPrice);

    res.json({
      symbol: stock.symbol,
      name: stock.name,
      exchange: stock.exchange,
      sector: stock.sector,
      currentPrice,
      previousClose,
      change: currentPrice - previousClose,
      changePercent: ((currentPrice - previousClose) / previousClose) * 100,
      high: parseFloat(stock.high),
      low: parseFloat(stock.low),
      volume: stock.volume,
      marketCap: parseFloat(stock.marketCap),
      priceHistory,
    });
  } catch (err) {
    req.log.error({ err }, "Error fetching stock");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/market/heatmap", async (req, res) => {
  try {
    const stocks = await db.select().from(stocksTable);
    const sectorMap = new Map<string, typeof stocks>();

    for (const s of stocks) {
      const existing = sectorMap.get(s.sector) ?? [];
      existing.push(s);
      sectorMap.set(s.sector, existing);
    }

    function safePct(cur: number, prev: number): number {
      if (!prev || !isFinite(prev) || !isFinite(cur)) return 0;
      const pct = ((cur - prev) / prev) * 100;
      return isFinite(pct) ? parseFloat(pct.toFixed(2)) : 0;
    }

    const heatmap = Array.from(sectorMap.entries()).map(([sector, sectorStocks]) => {
      const stocksWithPrices = sectorStocks.filter((s) => parseFloat(s.previousClose) > 0);
      const avgChange = stocksWithPrices.length > 0
        ? stocksWithPrices.reduce((acc, s) => acc + safePct(parseFloat(s.currentPrice), parseFloat(s.previousClose)), 0) / stocksWithPrices.length
        : 0;

      return {
        sector,
        changePercent: parseFloat(avgChange.toFixed(2)),
        stocks: sectorStocks.map((s) => ({
          symbol: s.symbol,
          name: s.name,
          changePercent: safePct(parseFloat(s.currentPrice), parseFloat(s.previousClose)),
          marketCap: parseFloat(s.marketCap),
        })),
      };
    });

    res.json(heatmap);
  } catch (err) {
    req.log.error({ err }, "Error fetching heatmap");
    res.status(500).json({ error: "Internal server error" });
  }
});

function generatePriceHistory(open: number, close: number, points = 78) {
  const history = [];
  const now = new Date();
  const marketOpen = new Date(now);
  marketOpen.setHours(9, 15, 0, 0);

  let price = open;
  const drift = (close - open) / points;

  for (let i = 0; i < points; i++) {
    const t = new Date(marketOpen.getTime() + i * 5 * 60 * 1000);
    const noise = (Math.random() - 0.5) * open * 0.004;
    price = price + drift + noise;
    price = Math.max(open * 0.85, Math.min(open * 1.15, price));
    history.push({
      time: t.toISOString(),
      price: parseFloat(price.toFixed(2)),
      volume: Math.floor(Math.random() * 50000 + 10000),
    });
  }
  // Force last point to be close
  history[history.length - 1].price = close;
  return history;
}

// Cache indices for 15s to avoid hammering Angel API
let indicesCache: { data: unknown; ts: number } | null = null;

router.get("/market/indices", async (req, res) => {
  try {
    if (indicesCache && Date.now() - indicesCache.ts < 15000) {
      res.json(indicesCache.data);
      return;
    }
    // Fetch separately to avoid key collision — one NSE token, one BSE token
    const [nseQuotes, bseQuotes] = await Promise.all([
      getMarketQuotes(["26000"], []),
      getMarketQuotes([], ["1"]),
    ]);
    const allNse = Object.values(nseQuotes);
    const allBse = Object.values(bseQuotes);
    const nifty = allNse[0] ?? null;
    const sensex = allBse[0] ?? null;
    const data = [
      {
        name: "NIFTY 50",
        value: nifty?.ltp ?? 0,
        change: nifty?.close > 0 ? nifty.ltp - nifty.close : 0,
        changePercent: nifty?.close > 0 ? ((nifty.ltp - nifty.close) / nifty.close) * 100 : 0,
        open: nifty?.open ?? 0, high: nifty?.high ?? 0, low: nifty?.low ?? 0,
      },
      {
        name: "SENSEX",
        value: sensex?.ltp ?? 0,
        change: sensex?.close > 0 ? sensex.ltp - sensex.close : 0,
        changePercent: sensex?.close > 0 ? ((sensex.ltp - sensex.close) / sensex.close) * 100 : 0,
        open: sensex?.open ?? 0, high: sensex?.high ?? 0, low: sensex?.low ?? 0,
      },
    ];
    indicesCache = { data, ts: Date.now() };
    res.json(data);
  } catch (err) {
    req.log.error({ err }, "Error fetching indices");
    res.status(500).json({ error: "Failed to fetch indices" });
  }
});

export default router;
