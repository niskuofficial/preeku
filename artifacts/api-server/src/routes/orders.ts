import { Router, type IRouter } from "express";
import { db, ordersTable, walletTable, positionsTable, stocksTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth } from "../middlewares/requireAuth";
import { getOrCreateWallet } from "./wallet";

const router: IRouter = Router();

router.get("/orders", requireAuth, async (req, res) => {
  const userId = (req as any).userId;
  try {
    const status = req.query.status as string | undefined;
    let orders;
    if (status && ["EXECUTED", "CANCELLED", "PENDING"].includes(status)) {
      orders = await db.select().from(ordersTable).where(and(eq(ordersTable.userId, userId), eq(ordersTable.status, status)));
    } else {
      orders = await db.select().from(ordersTable).where(eq(ordersTable.userId, userId));
    }
    res.json(orders.map(mapOrder));
  } catch (err) {
    req.log.error({ err }, "Error fetching orders");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/orders", requireAuth, async (req, res) => {
  const userId = (req as any).userId;
  try {
    const { symbol, orderType, side, productType, quantity, limitPrice } = req.body;

    if (!symbol || !orderType || !side || !productType || !quantity) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }

    const upperSymbol = symbol.toUpperCase();
    const [stock] = await db.select().from(stocksTable).where(eq(stocksTable.symbol, upperSymbol));
    if (!stock) {
      res.status(400).json({ error: "Stock not found" });
      return;
    }

    const executedPrice = orderType === "MARKET" ? parseFloat(stock.currentPrice) : (limitPrice ?? parseFloat(stock.currentPrice));
    const totalValue = executedPrice * quantity;

    const wallet = await getOrCreateWallet(userId);
    const currentBalance = parseFloat(wallet.balance);

    if (side === "BUY") {
      if (currentBalance < totalValue) {
        res.status(400).json({ error: `Insufficient funds. Available: ₹${currentBalance.toFixed(2)}, Required: ₹${totalValue.toFixed(2)}` });
        return;
      }

      await db.update(walletTable)
        .set({ balance: (currentBalance - totalValue).toFixed(2), updatedAt: new Date() })
        .where(eq(walletTable.id, wallet.id));

      const [existingPos] = await db.select().from(positionsTable)
        .where(and(eq(positionsTable.userId, userId), eq(positionsTable.symbol, upperSymbol), eq(positionsTable.productType, productType)));

      if (existingPos) {
        const newQty = existingPos.quantity + quantity;
        const newAvg = ((parseFloat(existingPos.avgBuyPrice) * existingPos.quantity) + (executedPrice * quantity)) / newQty;
        await db.update(positionsTable)
          .set({ quantity: newQty, avgBuyPrice: newAvg.toFixed(2), updatedAt: new Date() })
          .where(eq(positionsTable.id, existingPos.id));
      } else {
        await db.insert(positionsTable).values({
          userId,
          symbol: upperSymbol,
          stockName: stock.name,
          quantity,
          avgBuyPrice: executedPrice.toFixed(2),
          productType,
        });
      }
    } else if (side === "SELL") {
      const [existingPos] = await db.select().from(positionsTable)
        .where(and(eq(positionsTable.userId, userId), eq(positionsTable.symbol, upperSymbol), eq(positionsTable.productType, productType)));

      if (!existingPos || existingPos.quantity < quantity) {
        res.status(400).json({ error: `Insufficient holdings. Available: ${existingPos?.quantity ?? 0} shares` });
        return;
      }

      const pnl = (executedPrice - parseFloat(existingPos.avgBuyPrice)) * quantity;

      await db.update(walletTable)
        .set({ balance: (currentBalance + totalValue).toFixed(2), updatedAt: new Date() })
        .where(eq(walletTable.id, wallet.id));

      const newQty = existingPos.quantity - quantity;
      if (newQty === 0) {
        await db.delete(positionsTable).where(eq(positionsTable.id, existingPos.id));
      } else {
        await db.update(positionsTable)
          .set({ quantity: newQty, updatedAt: new Date() })
          .where(eq(positionsTable.id, existingPos.id));
      }

      const [order] = await db.insert(ordersTable).values({
        userId,
        symbol: upperSymbol,
        stockName: stock.name,
        orderType,
        side,
        productType,
        quantity,
        price: executedPrice.toFixed(2),
        executedPrice: executedPrice.toFixed(2),
        status: "EXECUTED",
        totalValue: totalValue.toFixed(2),
        pnl: pnl.toFixed(2),
        executedAt: new Date(),
      }).returning();

      res.status(201).json(mapOrder(order));
      return;
    }

    const [order] = await db.insert(ordersTable).values({
      userId,
      symbol: upperSymbol,
      stockName: stock.name,
      orderType,
      side,
      productType,
      quantity,
      price: executedPrice.toFixed(2),
      executedPrice: executedPrice.toFixed(2),
      status: "EXECUTED",
      totalValue: totalValue.toFixed(2),
      pnl: null,
      executedAt: new Date(),
    }).returning();

    res.status(201).json(mapOrder(order));
  } catch (err) {
    req.log.error({ err }, "Error placing order");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/orders/:id/cancel", requireAuth, async (req, res) => {
  const userId = (req as any).userId;
  try {
    const id = parseInt(req.params.id);
    const [order] = await db.select().from(ordersTable).where(and(eq(ordersTable.id, id), eq(ordersTable.userId, userId)));

    if (!order) {
      res.status(404).json({ error: "Order not found" });
      return;
    }

    if (order.status !== "PENDING") {
      res.status(400).json({ error: "Only pending orders can be cancelled" });
      return;
    }

    const [updated] = await db.update(ordersTable)
      .set({ status: "CANCELLED" })
      .where(eq(ordersTable.id, id))
      .returning();

    res.json(mapOrder(updated));
  } catch (err) {
    req.log.error({ err }, "Error cancelling order");
    res.status(500).json({ error: "Internal server error" });
  }
});

function mapOrder(order: typeof ordersTable.$inferSelect) {
  return {
    id: order.id,
    symbol: order.symbol,
    stockName: order.stockName,
    orderType: order.orderType,
    side: order.side,
    productType: order.productType,
    quantity: order.quantity,
    price: parseFloat(order.price),
    executedPrice: order.executedPrice ? parseFloat(order.executedPrice) : null,
    status: order.status,
    totalValue: parseFloat(order.totalValue),
    pnl: order.pnl ? parseFloat(order.pnl) : null,
    placedAt: order.placedAt,
    executedAt: order.executedAt ?? null,
  };
}

export default router;
