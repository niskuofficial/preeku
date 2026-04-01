import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

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

function buildWsUrl(): string {
  const proto = window.location.protocol === "https:" ? "wss:" : "ws:";
  return `${proto}//${window.location.host}/ws/prices`;
}

export function LivePricesProvider({ children }: { children: React.ReactNode }) {
  const [prices, setPrices] = useState<Record<string, LivePrice>>({});
  const [connected, setConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);

  const connect = useCallback(() => {
    if (!mountedRef.current) return;
    try {
      const ws = new WebSocket(buildWsUrl());
      wsRef.current = ws;

      ws.onopen = () => {
        if (!mountedRef.current) return;
        setConnected(true);
      };

      ws.onmessage = (event) => {
        if (!mountedRef.current) return;
        try {
          const msg = JSON.parse(event.data as string);
          if (msg.type === "snapshot") {
            const snap: Record<string, LivePrice> = {};
            for (const [sym, tick] of Object.entries(msg.data as Record<string, Omit<LivePrice, "symbol">>)) {
              snap[sym] = { symbol: sym, ...tick };
            }
            setPrices((prev) => ({ ...prev, ...snap }));
          } else if (msg.type === "tick") {
            const tick = msg.data as LivePrice;
            if (tick.symbol && tick.ltp > 0) {
              setPrices((prev) => ({ ...prev, [tick.symbol]: tick }));
            }
          }
        } catch { }
      };

      ws.onclose = () => {
        if (!mountedRef.current) return;
        setConnected(false);
        reconnectRef.current = setTimeout(() => connect(), 4000);
      };

      ws.onerror = () => ws.close();
    } catch {
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
