import { useState, useCallback } from "react";

const STORAGE_KEY = "preeku_recent_searches";
const MAX_ITEMS = 8;

export interface RecentSearchStock {
  symbol: string;
  name: string;
  sector: string;
  exchange: string;
  viewedAt: number;
}

function load(): RecentSearchStock[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function save(items: RecentSearchStock[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {}
}

export function useRecentSearches() {
  const [recents, setRecents] = useState<RecentSearchStock[]>(load);

  const addRecent = useCallback((stock: RecentSearchStock) => {
    setRecents((prev) => {
      const filtered = prev.filter((s) => s.symbol !== stock.symbol);
      const next = [{ ...stock, viewedAt: Date.now() }, ...filtered].slice(0, MAX_ITEMS);
      save(next);
      return next;
    });
  }, []);

  const removeRecent = useCallback((symbol: string) => {
    setRecents((prev) => {
      const next = prev.filter((s) => s.symbol !== symbol);
      save(next);
      return next;
    });
  }, []);

  const clearAll = useCallback(() => {
    save([]);
    setRecents([]);
  }, []);

  return { recents, addRecent, removeRecent, clearAll };
}
