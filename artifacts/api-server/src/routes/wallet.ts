import { Router, type IRouter } from "express";
import { db, walletTable, positionsTable, stocksTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

router.get("/wallet", async (req, res) => {
  try {
    let [wallet] = await db.select().from(walletTable).limit(1);
    if (!wallet) {
      [wallet] = await db.insert(walletTable).values({ balance: "1000000", initialBalance: "1000000" }).returning();
    }

    const positions = await db.select().from(positionsTable);
    const symbols = [...new Set(positions.map((p) => p.symbol))];
    let totalInvested = 0;
    let currentValue = 0;

    if (symbols.length > 0) {
      const stocks = await db.select().from(stocksTable).where(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (stocksTable.symbol as any).in(symbols)
      );
      const priceMap = new Map(stocks.map((s) => [s.symbol, parseFloat(s.currentPrice)]));

      for (const pos of positions) {
        const inv = parseFloat(pos.avgBuyPrice) * pos.quantity;
        const curr = (priceMap.get(pos.symbol) ?? parseFloat(pos.avgBuyPrice)) * pos.quantity;
        totalInvested += inv;
        currentValue += curr;
      }
    }

    const totalPnl = currentValue - totalInvested;
    const totalPnlPercent = totalInvested > 0 ? (totalPnl / totalInvested) * 100 : 0;

    res.json({
      id: wallet.id,
      balance: parseFloat(wallet.balance),
      initialBalance: parseFloat(wallet.initialBalance),
      totalInvested,
      totalPnl,
      totalPnlPercent,
      updatedAt: wallet.updatedAt,
    });
  } catch (err) {
    req.log.error({ err }, "Error fetching wallet");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
