import WebSocket from "ws";
import { EventEmitter } from "events";
import { getSession } from "./client";

const SMARTSTREAM_URL = "wss://smartapisocket.angelone.in/smart-stream";

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

const TOKEN_SYMBOL_MAP: Record<string, string> = {
  "2885": "RELIANCE",
  "11536": "TCS",
  "1333": "HDFCBANK",
  "1594": "INFY",
  "1394": "HINDUNILVR",
  "4963": "ICICIBANK",
  "1922": "KOTAKBANK",
  "317": "BAJFINANCE",
  "3045": "SBIN",
  "10604": "BHARTIARTL",
  "1660": "ITC",
  "3787": "WIPRO",
  "7229": "HCLTECH",
  "10999": "MARUTI",
  "3351": "SUNPHARMA",
  "3506": "TITAN",
  "25": "ADANIENT",
  "16675": "BAJAJFINSV",
  "17963": "NESTLEIND",
  "236": "ASIANPAINT",
  "3499": "TATASTEEL",
  "2475": "ONGC",
  "20374": "COALINDIA",
  "14977": "POWERGRID",
  "11630": "NTPC",
  "17818": "LTIM",
  "13538": "TECHM",
};

const NSE_TOKENS = Object.keys(TOKEN_SYMBOL_MAP);

export class SmartStream extends EventEmitter {
  private ws: WebSocket | null = null;
  private heartbeatInterval: ReturnType<typeof setInterval> | null = null;
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
  private isRunning = false;
  private latestPrices: Map<string, PriceTick> = new Map();

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
        this.subscribe();
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

  private subscribe() {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    const payload = {
      correlationID: "preeku_ltp",
      action: 1,
      params: {
        mode: 2,
        tokenList: [{ exchangeType: 1, tokens: NSE_TOKENS }],
      },
    };
    this.ws.send(JSON.stringify(payload));
    console.log(`[SmartStream] Subscribed to ${NSE_TOKENS.length} tokens (Quote mode)`);
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

      const tokenRaw = buf.subarray(2, 27).toString("utf8").replace(/\0/g, "").trim();
      const symbol = TOKEN_SYMBOL_MAP[tokenRaw];

      if (!symbol) return;

      const ltp = Number(buf.readBigInt64LE(43)) / 100;

      if (ltp <= 0 || ltp > 1000000) return;

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

      if (this.tickCount <= 5) {
        console.log(`[SmartStream] tick: ${symbol} ltp=${ltp}`);
      }
    } catch (e) {
      if (this.tickCount <= 3) console.error("[SmartStream] parse error:", e);
    }
  }
}

export const smartStream = new SmartStream();
