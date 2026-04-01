import { Router, type IRouter } from "express";
import { db, stocksTable } from "@workspace/db";
import { eq, ilike, or, sql } from "drizzle-orm";

const router: IRouter = Router();

router.get("/stocks", async (req, res) => {
  try {
    const search = req.query.search as string | undefined;
    let stocks;
    if (search && search.trim()) {
      stocks = await db.select().from(stocksTable).where(
        or(
          ilike(stocksTable.symbol, `%${search}%`),
          ilike(stocksTable.name, `%${search}%`)
        )
      );
    } else {
      stocks = await db.select().from(stocksTable);
    }

    res.json(stocks.map((s) => ({
      symbol: s.symbol,
      name: s.name,
      exchange: s.exchange,
      sector: s.sector,
      currentPrice: parseFloat(s.currentPrice),
      previousClose: parseFloat(s.previousClose),
      change: parseFloat(s.currentPrice) - parseFloat(s.previousClose),
      changePercent: ((parseFloat(s.currentPrice) - parseFloat(s.previousClose)) / parseFloat(s.previousClose)) * 100,
      high: parseFloat(s.high),
      low: parseFloat(s.low),
      volume: s.volume,
      marketCap: parseFloat(s.marketCap),
    })));
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

    const heatmap = Array.from(sectorMap.entries()).map(([sector, sectorStocks]) => {
      const avgChange = sectorStocks.reduce((acc, s) => {
        const chg = ((parseFloat(s.currentPrice) - parseFloat(s.previousClose)) / parseFloat(s.previousClose)) * 100;
        return acc + chg;
      }, 0) / sectorStocks.length;

      return {
        sector,
        changePercent: parseFloat(avgChange.toFixed(2)),
        stocks: sectorStocks.map((s) => ({
          symbol: s.symbol,
          name: s.name,
          changePercent: parseFloat((((parseFloat(s.currentPrice) - parseFloat(s.previousClose)) / parseFloat(s.previousClose)) * 100).toFixed(2)),
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

export default router;
