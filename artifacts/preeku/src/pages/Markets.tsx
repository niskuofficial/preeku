import { useState, useRef } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { formatINR, formatPercent, pnlClass } from "@/lib/format";
import { useTradingContext } from "@/context/TradingContext";
import { useLivePrices } from "@/context/LivePricesContext";
import { useMarketStatus } from "@/hooks/useMarketStatus";
import { Search, TrendingUp, TrendingDown, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";

const INITIAL_SIZE = 20;
const LOAD_MORE_SIZE = 10;

interface Stock {
  symbol: string; name: string; exchange: string; sector: string;
  currentPrice: number; previousClose: number; change: number; changePercent: number;
  high: number; low: number; volume: number; marketCap: number;
}

async function fetchStocks(search: string, offset: number, limit: number): Promise<Stock[]> {
  const params = new URLSearchParams({ limit: String(limit), offset: String(offset) });
  if (search.trim()) params.set("search", search.trim());
  const res = await fetch(`/api/stocks?${params}`);
  return res.json();
}

export default function Markets() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const { openOrderWindow } = useTradingContext();
  const { prices } = useLivePrices();
  const { isOpen: marketOpen, label: marketLabel } = useMarketStatus();

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleSearch = (value: string) => {
    setSearch(value);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => setDebouncedSearch(value), 350);
  };


  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isFetching } = useInfiniteQuery<Stock[]>({
    queryKey: ["stocks-infinite", debouncedSearch],
    initialPageParam: { offset: 0, limit: INITIAL_SIZE },
    queryFn: ({ pageParam }) => {
      const { offset, limit } = pageParam as { offset: number; limit: number };
      return fetchStocks(debouncedSearch, offset, limit);
    },
    getNextPageParam: (lastPage, allPages, lastPageParam) => {
      const { limit } = lastPageParam as { offset: number; limit: number };
      if (!Array.isArray(lastPage) || lastPage.length < limit) return undefined;
      const totalLoaded = allPages.reduce((sum, p) => sum + p.length, 0);
      return { offset: totalLoaded, limit: LOAD_MORE_SIZE };
    },
    staleTime: 60000,
  });

  const stockList: Stock[] = data?.pages.flat() ?? [];

  const gainers = stockList.filter((s) => (prices[s.symbol]?.changePercent ?? s.changePercent) >= 0).length;
  const losers = stockList.length - gainers;

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Markets</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {isLoading ? "Loading..." : `${stockList.length} of 2,200+ NSE stocks`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {isFetching && !isFetchingNextPage && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
          <span className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border ${marketOpen ? "bg-green-500/10 text-green-400 border-green-500/30" : "bg-red-500/10 text-red-400 border-red-500/30"}`}>
            <span className={`w-2 h-2 rounded-full ${marketOpen ? "bg-green-400" : "bg-red-400"}`} />
            {marketLabel}
          </span>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search NSE stocks by symbol or name..."
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-10 bg-card border-border text-foreground placeholder:text-muted-foreground"
          data-testid="input-market-search"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "Gainers", count: gainers, color: "text-green-400" },
          { label: "Losers", count: losers, color: "text-red-400" },
        ].map(({ label, count, color }) => (
          <div key={label} className="bg-card border border-border rounded-lg p-3 text-center">
            <div className={`text-xl font-bold font-mono ${color}`}>{count}</div>
            <div className="text-xs text-muted-foreground">{label}</div>
          </div>
        ))}
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-border sticky top-0 bg-card z-10">
            <tr>
              {["Symbol", "Name", "Exch", "Price", "Change", "% Chg", "Volume", "Action"].map((h, i) => (
                <th key={h} className={`py-3 px-4 text-muted-foreground font-medium text-xs uppercase tracking-wider ${i <= 1 ? "text-left" : i === 7 ? "text-center" : "text-right"}`}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {stockList.map((stock) => {
              const live = prices[stock.symbol];
              const ltp = live?.ltp ?? stock.currentPrice;
              const chg = live?.change ?? stock.change;
              const chgPct = live?.changePercent ?? stock.changePercent;
              return (
                <tr key={stock.symbol} className="border-b border-border/50 hover:bg-accent/30 transition-colors" data-testid={`market-row-${stock.symbol}`}>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-foreground">{stock.symbol}</div>
                    <div className="text-muted-foreground text-xs">{stock.sector}</div>
                  </td>
                  <td className="py-3 px-4 text-muted-foreground max-w-[180px] truncate text-sm">{stock.name}</td>
                  <td className="py-3 px-4 text-right">
                    <span className="text-xs bg-secondary text-muted-foreground px-2 py-0.5 rounded">{stock.exchange}</span>
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-semibold text-foreground">
                    {ltp > 0 ? formatINR(ltp) : <span className="text-muted-foreground text-xs">—</span>}
                  </td>
                  <td className={`py-3 px-4 text-right font-mono text-sm ${chg !== 0 ? pnlClass(chg) : "text-muted-foreground"}`}>
                    {chg !== 0 ? (
                      <span className="flex items-center justify-end gap-1">
                        {chg >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {chg >= 0 ? "+" : ""}{formatINR(Math.abs(chg))}
                      </span>
                    ) : "—"}
                  </td>
                  <td className={`py-3 px-4 text-right font-mono text-sm ${chgPct !== 0 ? pnlClass(chgPct) : "text-muted-foreground"}`}>
                    {chgPct !== 0 ? formatPercent(chgPct) : "—"}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-muted-foreground text-xs">
                    {(live?.volume ?? stock.volume) > 0 ? (live?.volume ?? stock.volume).toLocaleString("en-IN") : "—"}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex gap-1.5 justify-center">
                      <button
                        onClick={() => openOrderWindow({ symbol: stock.symbol, name: stock.name, currentPrice: ltp }, "BUY")}
                        data-testid={`btn-buy-${stock.symbol}`}
                        className="px-3 py-1 text-xs font-semibold bg-green-500/15 text-green-400 border border-green-500/30 rounded hover:bg-green-500/25 transition-colors"
                      >BUY</button>
                      <button
                        onClick={() => openOrderWindow({ symbol: stock.symbol, name: stock.name, currentPrice: ltp }, "SELL")}
                        data-testid={`btn-sell-${stock.symbol}`}
                        className="px-3 py-1 text-xs font-semibold bg-red-500/15 text-red-400 border border-red-500/30 rounded hover:bg-red-500/25 transition-colors"
                      >SELL</button>
                    </div>
                  </td>
                </tr>
              );
            })}

            {isLoading && Array.from({ length: 8 }).map((_, i) => (
              <tr key={`skel-${i}`} className="border-b border-border/50 animate-pulse">
                {Array.from({ length: 8 }).map((__, j) => (
                  <td key={j} className="py-3 px-4"><div className="h-4 bg-accent rounded" /></td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        {/* Load More footer */}
        <div className="flex items-center justify-center p-4">
          {isFetchingNextPage ? (
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading 10 more stocks...
            </div>
          ) : hasNextPage ? (
            <button
              onClick={() => fetchNextPage()}
              className="px-5 py-2 text-sm font-semibold bg-card border border-border rounded-lg text-primary hover:bg-accent transition-colors"
            >
              Load More
            </button>
          ) : stockList.length > 0 && !isLoading ? (
            <p className="text-muted-foreground text-xs">All {stockList.length} stocks loaded</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
