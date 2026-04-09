import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";
import { WS_BASE } from "@/constants/api";

export interface LivePrice {
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

interface LivePricesContextType {
  prices: Record<string, LivePrice>;
  connected: boolean;
  getPrice: (symbol: string) => LivePrice | undefined;
}

const LivePricesContext = createContext<LivePricesContextType>({
  prices: {},
  connected: false,
  getPrice: () => undefined,
});

export function useLivePrices() {
  return useContext(LivePricesContext);
}

export function useLivePrice(symbol: string | undefined) {
  const { prices } = useLivePrices();
  return symbol ? prices[symbol] : undefined;
}

const WS_URL = `${WS_BASE}/ws/prices`;

export function LivePricesProvider({ children }: { children: React.ReactNode }) {
  const [prices, setPrices] = useState<Record<string, LivePrice>>({});
  const [connected, setConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);

  const connect = useCallback(() => {
    if (!WS_URL || !mountedRef.current) return;

    try {
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        if (!mountedRef.current) return;
        setConnected(true);
        console.log("[LivePrices] WebSocket connected");
      };

      ws.onmessage = (event) => {
        if (!mountedRef.current) return;
        try {
          const msg = JSON.parse(event.data);

          if (msg.type === "snapshot") {
            const snapshot: Record<string, LivePrice> = {};
            for (const [sym, tick] of Object.entries(msg.data as Record<string, { ltp: number; open: number; high: number; low: number; close: number; volume: number; change: number; changePercent: number; timestamp: number }>)) {
              snapshot[sym] = { symbol: sym, ...tick };
            }
            setPrices((prev) => ({ ...prev, ...snapshot }));
          } else if (msg.type === "tick") {
            const tick = msg.data as LivePrice;
            if (tick.symbol && tick.ltp > 0) {
              setPrices((prev) => ({
                ...prev,
                [tick.symbol]: tick,
              }));
            }
          }
        } catch { }
      };

      ws.onclose = () => {
        if (!mountedRef.current) return;
        setConnected(false);
        console.log("[LivePrices] WebSocket disconnected, reconnecting...");
        reconnectRef.current = setTimeout(() => connect(), 4000);
      };

      ws.onerror = () => {
        ws.close();
      };
    } catch (err) {
      console.error("[LivePrices] Connect error:", err);
      reconnectRef.current = setTimeout(() => connect(), 5000);
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    connect();
    return () => {
      mountedRef.current = false;
      if (reconnectRef.current) clearTimeout(reconnectRef.current);
      wsRef.current?.close();
    };
  }, [connect]);

  const getPrice = useCallback((symbol: string) => prices[symbol], [prices]);

  return (
    <LivePricesContext.Provider value={{ prices, connected, getPrice }}>
      {children}
    </LivePricesContext.Provider>
  );
}
