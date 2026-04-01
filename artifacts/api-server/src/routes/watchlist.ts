import { Router, type IRouter } from "express";
import { db, watchlistTable, stocksTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth } from "../middlewares/requireAuth";

const router: IRouter = Router();

router.get("/watchlist", requireAuth, async (req, res) => {
  const userId = (req as any).userId;
  try {
    const watchlist = await db.select().from(watchlistTable).where(eq(watchlistTable.userId, userId));
    if (watchlist.length === 0) { res.json([]); return; }

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

router.post("/watchlist", requireAuth, async (req, res) => {
  const userId = (req as any).userId;
  try {
    const { symbol } = req.body;
    if (!symbol) { res.status(400).json({ error: "Symbol is required" }); return; }

    const upperSymbol = symbol.toUpperCase();
    const [stock] = await db.select().from(stocksTable).where(eq(stocksTable.symbol, upperSymbol));
    if (!stock) { res.status(404).json({ error: "Stock not found" }); return; }

    const [existing] = await db.select().from(watchlistTable)
      .where(and(eq(watchlistTable.userId, userId), eq(watchlistTable.symbol, upperSymbol)));

    const currentPrice = parseFloat(stock.currentPrice);
    const previousClose = parseFloat(stock.previousClose);
    const payload = {
      id: existing?.id ?? 0,
      symbol: upperSymbol,
      name: stock.name,
      currentPrice,
      change: currentPrice - previousClose,
      changePercent: previousClose > 0 ? ((currentPrice - previousClose) / previousClose) * 100 : 0,
      addedAt: existing?.addedAt ?? new Date(),
    };

    if (existing) { res.status(201).json(payload); return; }

    const [item] = await db.insert(watchlistTable).values({ userId, symbol: upperSymbol }).returning();
    res.status(201).json({ ...payload, id: item.id, addedAt: item.addedAt });
  } catch (err) {
    req.log.error({ err }, "Error adding to watchlist");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/watchlist/:symbol", requireAuth, async (req, res) => {
  const userId = (req as any).userId;
  try {
    await db.delete(watchlistTable)
      .where(and(eq(watchlistTable.userId, userId), eq(watchlistTable.symbol, req.params.symbol.toUpperCase())));
    res.json({ message: "Removed from watchlist" });
  } catch (err) {
    req.log.error({ err }, "Error removing from watchlist");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
