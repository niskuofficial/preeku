import { Router, type IRouter } from "express";
import { db, walletTable, positionsTable, stocksTable, ordersTable } from "@workspace/db";
import { eq, inArray, and } from "drizzle-orm";
import { requireAuth } from "../middlewares/requireAuth";

const router: IRouter = Router();

async function getOrCreateWallet(userId: string) {
  const [wallet] = await db.select().from(walletTable).where(eq(walletTable.userId, userId)).limit(1);
  if (wallet) return wallet;
  const [created] = await db.insert(walletTable).values({ userId, balance: "1000000", initialBalance: "1000000" }).returning();
  return created;
}

router.get("/wallet", requireAuth, async (req, res) => {
  const userId = (req as any).userId;
  try {
    const wallet = await getOrCreateWallet(userId);
    const positions = await db.select().from(positionsTable).where(eq(positionsTable.userId, userId));
    const symbols = [...new Set(positions.map((p) => p.symbol))];
    let totalInvested = 0;
    let currentValue = 0;

    if (symbols.length > 0) {
      const stocks = await db.select().from(stocksTable).where(inArray(stocksTable.symbol, symbols));
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

router.post("/wallet/add-balance", requireAuth, async (req, res) => {
  const userId = (req as any).userId;
  try {
    const amount = parseFloat(req.body.amount);
    if (isNaN(amount) || amount <= 0 || amount > 10000000) {
      res.status(400).json({ error: "Invalid amount. Must be between ₹1 and ₹1,00,00,000." });
      return;
    }
    const wallet = await getOrCreateWallet(userId);
    const newBalance = parseFloat(wallet.balance) + amount;
    await db.update(walletTable).set({ balance: String(newBalance), updatedAt: new Date() }).where(eq(walletTable.id, wallet.id));
    res.json({ success: true, balance: newBalance });
  } catch (err) {
    req.log.error({ err }, "Error adding balance");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/account/reset", requireAuth, async (req, res) => {
  const userId = (req as any).userId;
  try {
    await db.delete(ordersTable).where(eq(ordersTable.userId, userId));
    await db.delete(positionsTable).where(eq(positionsTable.userId, userId));
    const wallet = await getOrCreateWallet(userId);
    await db.update(walletTable)
      .set({ balance: "1000000", updatedAt: new Date() })
      .where(eq(walletTable.id, wallet.id));
    res.json({ success: true, message: "Account reset successfully" });
  } catch (err) {
    req.log.error({ err }, "Error resetting account");
    res.status(500).json({ error: "Internal server error" });
  }
});

export { getOrCreateWallet };
export default router;
