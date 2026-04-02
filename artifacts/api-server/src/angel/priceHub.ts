import { WebSocketServer, WebSocket } from "ws";
import { IncomingMessage } from "http";
import { Server } from "net";
import { smartStream, type PriceTick } from "./smartstream";
import { db, stocksTable } from "@workspace/db";

const clients: Set<WebSocket> = new Set();
let wss: WebSocketServer | null = null;

// Global price store — union of SmartStream ticks + REST batch snapshots
const globalPriceStore: Record<string, Omit<PriceTick, "token">> = {};

function mergeIntoStore(prices: Record<string, Omit<PriceTick, "token">>) {
  for (const [sym, tick] of Object.entries(prices)) {
    if (tick.ltp > 0) {
      globalPriceStore[sym] = tick;
    }
  }
}

function broadcast(data: unknown) {
  const payload = JSON.stringify(data);
  for (const client of clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  }
}

// Preload all stock prices from DB so new clients get complete data immediately
async function preloadDbPrices() {
  try {
    const stocks = await db.select({
      symbol: stocksTable.symbol,
      currentPrice: stocksTable.currentPrice,
      previousClose: stocksTable.previousClose,
      high: stocksTable.high,
      low: stocksTable.low,
      volume: stocksTable.volume,
    }).from(stocksTable);

    let loaded = 0;
    for (const s of stocks) {
      const ltp = parseFloat(s.currentPrice ?? "0");
      if (ltp <= 0) continue;
      const prevClose = parseFloat(s.previousClose ?? "0") || ltp;
      const change = ltp - prevClose;
      const changePercent = prevClose > 0 ? (change / prevClose) * 100 : 0;
      globalPriceStore[s.symbol] = {
        symbol: s.symbol,
        ltp,
        open: 0,
        high: parseFloat(s.high ?? "0") || ltp,
        low: parseFloat(s.low ?? "0") || ltp,
        close: prevClose,
        volume: s.volume ?? 0,
        change,
        changePercent,
        timestamp: Date.now(),
      };
      loaded++;
    }
    console.log(`[PriceHub] Preloaded ${loaded} stock prices from DB`);
  } catch (err) {
    console.error("[PriceHub] DB preload error:", err);
  }
}

export function createPriceHub(server: Server) {
  wss = new WebSocketServer({ noServer: true });

  // Preload DB prices on startup
  preloadDbPrices().catch(console.error);

  server.on("upgrade", (request: IncomingMessage, socket, head) => {
    const url = new URL(request.url ?? "/", `http://${request.headers.host}`);
    if (url.pathname === "/ws/prices") {
      wss!.handleUpgrade(request, socket, head, (ws) => {
        wss!.emit("connection", ws, request);
      });
    } else {
      socket.destroy();
    }
  });

  wss.on("connection", (ws: WebSocket) => {
    clients.add(ws);
    console.log(`[PriceHub] Client connected. Total: ${clients.size}`);

    // Send full snapshot: DB preload + SmartStream + REST batch combined
    const combined = { ...globalPriceStore, ...smartStream.getLatestPrices() };
    if (Object.keys(combined).length > 0) {
      ws.send(JSON.stringify({ type: "snapshot", data: combined }));
      console.log(`[PriceHub] Sent snapshot with ${Object.keys(combined).length} prices`);
    }

    ws.on("close", () => {
      clients.delete(ws);
      console.log(`[PriceHub] Client disconnected. Total: ${clients.size}`);
    });

    ws.on("error", () => {
      clients.delete(ws);
    });
  });

  smartStream.on("tick", (tick: PriceTick) => {
    // Update global store with SmartStream tick
    const { token: _token, ...tickData } = tick;
    if (tick.ltp > 0) {
      globalPriceStore[tick.symbol] = tickData;
    }
    broadcast({ type: "tick", data: tick });
  });

  smartStream.on("batchPrices", (prices: Record<string, Omit<PriceTick, "token">>) => {
    // Update global store with REST batch prices
    mergeIntoStore(prices);
    if (clients.size > 0) {
      broadcast({ type: "snapshot", data: prices });
    }
  });

  console.log("[PriceHub] WebSocket server ready at /ws/prices");
}

export function broadcastFallback(prices: Record<string, { symbol: string; currentPrice: number; change: number; changePercent: number; high: number; low: number; volume: number }>) {
  if (clients.size > 0) {
    broadcast({ type: "snapshot", data: prices });
  }
}
