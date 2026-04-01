import { Router, type IRouter } from "express";
import { db, positionsTable, stocksTable, walletTable, ordersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

router.get("/portfolio/positions", async (req, res) => {
  try {
    const positions = await db.select().from(positionsTable).where(eq(positionsTable.productType, "INTRADAY"));
    if (positions.length === 0) {
      res.json([]);
      return;
    }

    const symbols = [...new Set(positions.map((p) => p.symbol))];
    const stocks = await db.select().from(stocksTable);
    const priceMap = new Map(stocks.map((s) => [s.symbol, parseFloat(s.currentPrice)]));

    res.json(positions.map((p) => {
      const currentPrice = priceMap.get(p.symbol) ?? parseFloat(p.avgBuyPrice);
      const avgBuyPrice = parseFloat(p.avgBuyPrice);
      const investedValue = avgBuyPrice * p.quantity;
      const currentValue = currentPrice * p.quantity;
      const pnl = currentValue - investedValue;
      const pnlPercent = investedValue > 0 ? (pnl / investedValue) * 100 : 0;
      return {
        id: p.id,
        symbol: p.symbol,
        stockName: p.stockName,
        quantity: p.quantity,
        avgBuyPrice,
        currentPrice,
        pnl,
        pnlPercent,
        currentValue,
        investedValue,
        productType: p.productType,
      };
    }));
  } catch (err) {
    req.log.error({ err }, "Error fetching positions");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/portfolio/holdings", async (req, res) => {
  try {
    const holdings = await db.select().from(positionsTable).where(eq(positionsTable.productType, "DELIVERY"));
    if (holdings.length === 0) {
      res.json([]);
      return;
    }

    const stocks = await db.select().from(stocksTable);
    const stockMap = new Map(stocks.map((s) => [s.symbol, s]));

    res.json(holdings.map((h) => {
      const stock = stockMap.get(h.symbol);
      const currentPrice = stock ? parseFloat(stock.currentPrice) : parseFloat(h.avgBuyPrice);
      const previousClose = stock ? parseFloat(stock.previousClose) : currentPrice;
      const avgBuyPrice = parseFloat(h.avgBuyPrice);
      const investedValue = avgBuyPrice * h.quantity;
      const currentValue = currentPrice * h.quantity;
      const pnl = currentValue - investedValue;
      const pnlPercent = investedValue > 0 ? (pnl / investedValue) * 100 : 0;
      const dayChange = (currentPrice - previousClose) * h.quantity;
      const dayChangePercent = previousClose > 0 ? ((currentPrice - previousClose) / previousClose) * 100 : 0;
      return {
        id: h.id,
        symbol: h.symbol,
        stockName: h.stockName,
        quantity: h.quantity,
        avgBuyPrice,
        currentPrice,
        pnl,
        pnlPercent,
        currentValue,
        investedValue,
        dayChange,
        dayChangePercent,
      };
    }));
  } catch (err) {
    req.log.error({ err }, "Error fetching holdings");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/portfolio/summary", async (req, res) => {
  try {
    const positions = await db.select().from(positionsTable);
    const stocks = await db.select().from(stocksTable);
    const [wallet] = await db.select().from(walletTable).limit(1);
    const orders = await db.select().from(ordersTable);

    const stockMap = new Map(stocks.map((s) => [s.symbol, s]));

    let totalInvested = 0;
    let currentValue = 0;
    let dayPnl = 0;

    const positionPnls: { symbol: string; name: string; pnlPercent: number }[] = [];

    for (const pos of positions) {
      const stock = stockMap.get(pos.symbol);
      const currentPrice = stock ? parseFloat(stock.currentPrice) : parseFloat(pos.avgBuyPrice);
      const previousClose = stock ? parseFloat(stock.previousClose) : currentPrice;
      const avgBuyPrice = parseFloat(pos.avgBuyPrice);
      const inv = avgBuyPrice * pos.quantity;
      const curr = currentPrice * pos.quantity;
      const prev = previousClose * pos.quantity;
      totalInvested += inv;
      currentValue += curr;
      dayPnl += curr - prev;

      const pnlPercent = inv > 0 ? ((curr - inv) / inv) * 100 : 0;
      positionPnls.push({ symbol: pos.symbol, name: pos.stockName, pnlPercent });
    }

    const totalPnl = currentValue - totalInvested;
    const totalPnlPercent = totalInvested > 0 ? (totalPnl / totalInvested) * 100 : 0;
    const dayPnlPercent = totalInvested > 0 ? (dayPnl / totalInvested) * 100 : 0;
    const walletBalance = wallet ? parseFloat(wallet.balance) : 1000000;

    positionPnls.sort((a, b) => b.pnlPercent - a.pnlPercent);
    const bestPerformer = positionPnls.length > 0 ? positionPnls[0] : null;
    const worstPerformer = positionPnls.length > 1 ? positionPnls[positionPnls.length - 1] : null;

    res.json({
      totalInvested,
      currentValue,
      totalPnl,
      totalPnlPercent,
      dayPnl,
      dayPnlPercent,
      walletBalance,
      openPositions: positions.filter((p) => p.productType === "INTRADAY").length,
      totalHoldings: positions.filter((p) => p.productType === "DELIVERY").length,
      totalOrders: orders.length,
      bestPerformer,
      worstPerformer,
    });
  } catch (err) {
    req.log.error({ err }, "Error fetching portfolio summary");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
