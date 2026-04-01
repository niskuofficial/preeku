import { useState, useCallback, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "preeku_mobile_recent_searches";
const MAX = 8;

export interface RecentSearchItem {
  symbol: string;
  name: string;
  sector: string;
  exchange: string;
  viewedAt: number;
}

function parse(raw: string | null): RecentSearchItem[] {
  try { return raw ? JSON.parse(raw) : []; } catch { return []; }
}

export function useMobileRecentSearches() {
  const [recents, setRecents] = useState<RecentSearchItem[]>([]);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => setRecents(parse(raw)));
  }, []);

  const addRecent = useCallback((stock: Omit<RecentSearchItem, "viewedAt">) => {
    setRecents((prev) => {
      const filtered = prev.filter((s) => s.symbol !== stock.symbol);
      const next = [{ ...stock, viewedAt: Date.now() }, ...filtered].slice(0, MAX);
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const removeRecent = useCallback((symbol: string) => {
    setRecents((prev) => {
      const next = prev.filter((s) => s.symbol !== symbol);
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const clearAll = useCallback(() => {
    AsyncStorage.setItem(STORAGE_KEY, "[]");
    setRecents([]);
  }, []);

  return { recents, addRecent, removeRecent, clearAll };
}
