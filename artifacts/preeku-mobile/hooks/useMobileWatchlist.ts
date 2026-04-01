import { useState, useCallback, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "preeku_mobile_watchlist";

export interface MobileWatchlistItem {
  symbol: string;
  name: string;
  sector: string;
  exchange: string;
  addedAt: number;
}

function parse(raw: string | null): MobileWatchlistItem[] {
  try { return raw ? JSON.parse(raw) : []; } catch { return []; }
}

export function useMobileWatchlist() {
  const [items, setItems] = useState<MobileWatchlistItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      setItems(parse(raw));
      setLoaded(true);
    });
  }, []);

  const persist = useCallback((next: MobileWatchlistItem[]) => {
    setItems(next);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, []);

  const addItem = useCallback((stock: Omit<MobileWatchlistItem, "addedAt">) => {
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

  return { items, addItem, removeItem, has, loaded };
}
