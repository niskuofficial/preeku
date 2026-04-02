import WebSocket from "ws";
import { EventEmitter } from "events";
import { getSession } from "./client";
import { FULL_SYMBOL_TOKEN_MAP } from "./symbolTokenMap";

const SMARTSTREAM_URL = "wss://smartapisocket.angelone.in/smart-stream";
const BATCH_SIZE = 500; // tokens per subscription message

export interface PriceTick {
  token: string;
  symbol: string;
  ltp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  change: number;
  changePercent: number;
  timestamp: number;
}

// Build full NSE reverse map: token → symbol (2131 stocks + indices)
const NSE_TOKEN_SYMBOL_MAP: Record<string, string> = {
  "26000": "NIFTY50",
  "26009": "BANKNIFTY",
};
for (const [symbol, entry] of Object.entries(FULL_SYMBOL_TOKEN_MAP)) {
  NSE_TOKEN_SYMBOL_MAP[entry.token] = symbol;
}

// BSE index tokens (exchangeType 3)
const BSE_TOKEN_SYMBOL_MAP: Record<string, string> = {
  "1": "SENSEX",
};

function chunkArray<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

export class SmartStream extends EventEmitter {
  private ws: WebSocket | null = null;
  private heartbeatInterval: ReturnType<typeof setInterval> | null = null;
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
  private isRunning = false;
  private latestPrices: Map<string, PriceTick> = new Map();
  private tickCount = 0;

  async start() {
    this.isRunning = true;
    await this.connect();
    console.log("[SmartStream] Started");
  }

  stop() {
    this.isRunning = false;
    if (this.heartbeatInterval) clearInterval(this.heartbeatInterval);
    if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout);
    if (this.ws) this.ws.terminate();
  }

  getLatestPrices(): Record<string, PriceTick> {
    return Object.fromEntries(this.latestPrices);
  }

  private async connect() {
    try {
      const session = await getSession();
      const ws = new WebSocket(SMARTSTREAM_URL, {
        headers: {
          Authorization: `Bearer ${session.jwtToken}`,
          "x-api-key": process.env.ANGEL_API_KEY!,
          "x-client-code": process.env.ANGEL_CLIENT_ID!,
          "x-feed-token": session.feedToken,
        },
      });
      this.ws = ws;

      ws.on("open", () => {
        console.log("[SmartStream] Connected to Angel One");
        this.subscribeAll();
        this.startHeartbeat();
      });

      ws.on("message", (data: Buffer | ArrayBuffer | Buffer[], isBinary: boolean) => {
        let buf: Buffer;
        if (Buffer.isBuffer(data)) {
          buf = data;
        } else if (data instanceof ArrayBuffer) {
          buf = Buffer.from(data);
        } else if (Array.isArray(data)) {
          buf = Buffer.concat(data as Buffer[]);
        } else if (typeof data === "string") {
          return;
        } else {
          return;
        }
        if (buf.length >= 10) {
          this.parseBinary(buf);
        }
      });

      ws.on("close", (code, reason) => {
        console.log(`[SmartStream] Disconnected: ${code} ${reason}`);
        if (this.heartbeatInterval) clearInterval(this.heartbeatInterval);
        if (this.isRunning) {
          this.reconnectTimeout = setTimeout(() => this.connect(), 5000);
        }
      });

      ws.on("error", (err) => {
        console.error("[SmartStream] WS error:", err.message);
      });

    } catch (err) {
      console.error("[SmartStream] Connect error:", err);
      if (this.isRunning) {
        this.reconnectTimeout = setTimeout(() => this.connect(), 10000);
      }
    }
  }

  // Subscribe ALL 2131 NSE stocks + SENSEX in batches of 500
  private subscribeAll() {
    const allNseTokens = Object.keys(NSE_TOKEN_SYMBOL_MAP);
    const batches = chunkArray(allNseTokens, BATCH_SIZE);
    const bseTokens = Object.keys(BSE_TOKEN_SYMBOL_MAP);

    console.log(`[SmartStream] Subscribing ${allNseTokens.length} NSE + ${bseTokens.length} BSE tokens in ${batches.length} batches...`);

    batches.forEach((batch, i) => {
      setTimeout(() => {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
        const tokenList: { exchangeType: number; tokens: string[] }[] = [
          { exchangeType: 1, tokens: batch },
        ];
        // Attach BSE tokens to the first batch
        if (i === 0 && bseTokens.length > 0) {
          tokenList.push({ exchangeType: 3, tokens: bseTokens });
        }
        const payload = {
          correlationID: `preeku_batch_${i}`,
          action: 1,
          params: { mode: 2, tokenList },
        };
        this.ws!.send(JSON.stringify(payload));
        if (i === batches.length - 1) {
          console.log(`[SmartStream] All ${allNseTokens.length} NSE + ${bseTokens.length} BSE tokens subscribed (${batches.length} batches)`);
        }
      }, i * 250); // 250ms between batches to avoid flood
    });
  }

  // Keep for backward compat — most stocks already subscribed via subscribeAll
  addPortfolioTokens(symbols: string[]) {
    const newTokens: string[] = [];
    for (const symbol of symbols) {
      const entry = FULL_SYMBOL_TOKEN_MAP[symbol];
      if (entry && !NSE_TOKEN_SYMBOL_MAP[entry.token]) {
        NSE_TOKEN_SYMBOL_MAP[entry.token] = symbol;
        newTokens.push(entry.token);
      }
    }
    if (newTokens.length > 0 && this.ws?.readyState === WebSocket.OPEN) {
      const payload = {
        correlationID: "preeku_portfolio",
        action: 1,
        params: { mode: 2, tokenList: [{ exchangeType: 1, tokens: newTokens }] },
      };
      this.ws.send(JSON.stringify(payload));
      console.log(`[SmartStream] Added ${newTokens.length} extra portfolio tokens`);
    }
  }

  private startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send("ping");
      }
    }, 25000);
  }

  private parseBinary(buf: Buffer) {
    try {
      const mode = buf.readUInt8(0);
      const exchangeType = buf.readUInt8(1);

      const tokenRaw = buf.subarray(2, 27).toString("utf8").replace(/\0/g, "").trim();
      const symbol = exchangeType === 3
        ? BSE_TOKEN_SYMBOL_MAP[tokenRaw]
        : NSE_TOKEN_SYMBOL_MAP[tokenRaw];

      if (!symbol) return;

      const ltp = Number(buf.readBigInt64LE(43)) / 100;

      if (ltp <= 0 || ltp > 10000000) return;

      let open = 0, high = 0, low = 0, close = 0, volume = 0;
      if (mode === 2 && buf.length >= 123) {
        open = Number(buf.readBigInt64LE(91)) / 100;
        high = Number(buf.readBigInt64LE(99)) / 100;
        low = Number(buf.readBigInt64LE(107)) / 100;
        close = Number(buf.readBigInt64LE(115)) / 100;
        volume = Number(buf.readBigUInt64LE(67));
      }

      const prevClose = close > 0 ? close : this.latestPrices.get(symbol)?.close ?? ltp;
      const change = ltp - prevClose;
      const changePercent = prevClose > 0 ? (change / prevClose) * 100 : 0;

      const tick: PriceTick = {
        token: tokenRaw,
        symbol,
        ltp,
        open,
        high,
        low,
        close: prevClose,
        volume,
        change,
        changePercent,
        timestamp: Date.now(),
      };

      this.latestPrices.set(symbol, tick);
      this.emit("tick", tick);
      this.tickCount++;

      if (this.tickCount <= 10) {
        console.log(`[SmartStream] tick #${this.tickCount}: ${symbol} ltp=${ltp}`);
      } else if (this.tickCount % 500 === 0) {
        console.log(`[SmartStream] ${this.tickCount} total ticks received`);
      }
    } catch (e) {
      if (this.tickCount <= 3) console.error("[SmartStream] parse error:", e);
    }
  }
}

export const smartStream = new SmartStream();
