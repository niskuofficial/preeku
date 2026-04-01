import { WebSocketServer, WebSocket } from "ws";
import { IncomingMessage } from "http";
import { Server } from "net";
import { smartStream, type PriceTick } from "./smartstream";
import { syncPrices } from "./priceSync";

const clients: Set<WebSocket> = new Set();
let wss: WebSocketServer | null = null;

function broadcast(data: unknown) {
  const payload = JSON.stringify(data);
  for (const client of clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  }
}

export function createPriceHub(server: Server) {
  wss = new WebSocketServer({ noServer: true });

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

    const snapshot = smartStream.getLatestPrices();
    if (Object.keys(snapshot).length > 0) {
      ws.send(JSON.stringify({ type: "snapshot", data: snapshot }));
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
    broadcast({ type: "tick", data: tick });
  });

  console.log("[PriceHub] WebSocket server ready at /ws/prices");
}

export function broadcastFallback(prices: Record<string, { symbol: string; currentPrice: number; change: number; changePercent: number; high: number; low: number; volume: number }>) {
  if (clients.size > 0) {
    broadcast({ type: "snapshot", data: prices });
  }
}
