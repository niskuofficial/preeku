import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
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

interface RecentSearchesContextValue {
  recents: RecentSearchItem[];
  addRecent: (stock: Omit<RecentSearchItem, "viewedAt">) => void;
  removeRecent: (symbol: string) => void;
  clearAll: () => void;
}

const RecentSearchesContext = createContext<RecentSearchesContextValue | null>(null);

function parse(raw: string | null): RecentSearchItem[] {
  try { return raw ? JSON.parse(raw) : []; } catch { return []; }
}

export function RecentSearchesProvider({ children }: { children: React.ReactNode }) {
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

  return (
    <RecentSearchesContext.Provider value={{ recents, addRecent, removeRecent, clearAll }}>
      {children}
    </RecentSearchesContext.Provider>
  );
}

export function useRecentSearches() {
  const ctx = useContext(RecentSearchesContext);
  if (!ctx) throw new Error("useRecentSearches must be used inside RecentSearchesProvider");
  return ctx;
}
