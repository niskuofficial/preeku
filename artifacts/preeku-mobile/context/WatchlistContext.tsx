import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "preeku_mobile_watchlist";

export interface WatchlistItem {
  symbol: string;
  name: string;
  sector: string;
  exchange: string;
  addedAt: number;
}

interface WatchlistContextValue {
  items: WatchlistItem[];
  loaded: boolean;
  addItem: (stock: Omit<WatchlistItem, "addedAt">) => void;
  removeItem: (symbol: string) => void;
  has: (symbol: string) => boolean;
}

const WatchlistContext = createContext<WatchlistContextValue | null>(null);

function parse(raw: string | null): WatchlistItem[] {
  try { return raw ? JSON.parse(raw) : []; } catch { return []; }
}

export function WatchlistProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      setItems(parse(raw));
      setLoaded(true);
    });
  }, []);

  const addItem = useCallback((stock: Omit<WatchlistItem, "addedAt">) => {
    setItems((prev) => {
      if (prev.some((i) => i.symbol === stock.symbol)) return prev;
      const next = [{ ...stock, addedAt: Date.now() }, ...prev];
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const removeItem = useCallback((symbol: string) => {
    setItems((prev) => {
      const next = prev.filter((i) => i.symbol !== symbol);
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const has = useCallback((symbol: string) => items.some((i) => i.symbol === symbol), [items]);

  return (
    <WatchlistContext.Provider value={{ items, loaded, addItem, removeItem, has }}>
      {children}
    </WatchlistContext.Provider>
  );
}

export function useWatchlist() {
  const ctx = useContext(WatchlistContext);
  if (!ctx) throw new Error("useWatchlist must be used inside WatchlistProvider");
  return ctx;
}
