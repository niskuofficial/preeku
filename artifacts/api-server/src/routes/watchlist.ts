import { Router, type IRouter } from "express";
import { db, watchlistTable, stocksTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

router.get("/watchlist", async (req, res) => {
  try {
    const watchlist = await db.select().from(watchlistTable);
    const symbols = watchlist.map((w) => w.symbol);

    if (symbols.length === 0) {
      res.json([]);
      return;
    }

    const stocks = await db.select().from(stocksTable);
    const stockMap = new Map(stocks.map((s) => [s.symbol, s]));

    const result = watchlist.map((w) => {
      const stock = stockMap.get(w.symbol);
      const currentPrice = stock ? parseFloat(stock.currentPrice) : 0;
      const previousClose = stock ? parseFloat(stock.previousClose) : 0;
      return {
        id: w.id,
        symbol: w.symbol,
        name: stock?.name ?? w.symbol,
        currentPrice,
        change: currentPrice - previousClose,
        changePercent: previousClose > 0 ? ((currentPrice - previousClose) / previousClose) * 100 : 0,
        addedAt: w.addedAt,
      };
    });

    res.json(result);
  } catch (err) {
    req.log.error({ err }, "Error fetching watchlist");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/watchlist", async (req, res) => {
  try {
    const { symbol } = req.body;
    if (!symbol) {
      res.status(400).json({ error: "Symbol is required" });
      return;
    }

    const upperSymbol = symbol.toUpperCase();
    const [stock] = await db.select().from(stocksTable).where(eq(stocksTable.symbol, upperSymbol));
    if (!stock) {
      res.status(404).json({ error: "Stock not found" });
      return;
    }

    const [existing] = await db.select().from(watchlistTable).where(eq(watchlistTable.symbol, upperSymbol));
    if (existing) {
      const currentPrice = parseFloat(stock.currentPrice);
      const previousClose = parseFloat(stock.previousClose);
      res.status(201).json({
        id: existing.id,
        symbol: existing.symbol,
        name: stock.name,
        currentPrice,
        change: currentPrice - previousClose,
        changePercent: ((currentPrice - previousClose) / previousClose) * 100,
        addedAt: existing.addedAt,
      });
      return;
    }

    const [item] = await db.insert(watchlistTable).values({ symbol: upperSymbol }).returning();
    const currentPrice = parseFloat(stock.currentPrice);
    const previousClose = parseFloat(stock.previousClose);
    res.status(201).json({
      id: item.id,
      symbol: item.symbol,
      name: stock.name,
      currentPrice,
      change: currentPrice - previousClose,
      changePercent: ((currentPrice - previousClose) / previousClose) * 100,
      addedAt: item.addedAt,
    });
  } catch (err) {
    req.log.error({ err }, "Error adding to watchlist");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/watchlist/:symbol", async (req, res) => {
  try {
    const { symbol } = req.params;
    await db.delete(watchlistTable).where(eq(watchlistTable.symbol, symbol.toUpperCase()));
    res.json({ message: "Removed from watchlist" });
  } catch (err) {
    req.log.error({ err }, "Error removing from watchlist");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
