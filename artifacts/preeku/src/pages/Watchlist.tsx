import { useState } from "react";
import { useGetWatchlist, useAddToWatchlist, useRemoveFromWatchlist, getGetWatchlistQueryKey } from "@workspace/api-client-react";
import { formatINR, formatPercent, pnlClass } from "@/lib/format";
import { useTradingContext } from "@/context/TradingContext";
import { useLivePrices } from "@/context/LivePricesContext";
import { useRecentSearches } from "@/hooks/useRecentSearches";
import { Plus, Trash2, BookMarked, Clock, X, TrendingUp, TrendingDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import StockLogo from "@/components/StockLogo";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface WatchlistItem {
  id: number; symbol: string; name: string;
  currentPrice: number; change: number; changePercent: number; addedAt: string;
}

export default function Watchlist() {
  const [newSymbol, setNewSymbol] = useState("");
  const { data: watchlist } = useGetWatchlist();
  const addToWatchlist = useAddToWatchlist();
  const removeFromWatchlist = useRemoveFromWatchlist();
  const { openOrderWindow } = useTradingContext();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { prices } = useLivePrices();
  const { recents, removeRecent, clearAll } = useRecentSearches();

  const items: WatchlistItem[] = Array.isArray(watchlist) ? watchlist : [];
  const watchlistSymbols = new Set(items.map((i) => i.symbol));

  const handleAdd = (sym?: string) => {
    const symbol = (sym ?? newSymbol).trim().toUpperCase();
    if (!symbol) return;
    addToWatchlist.mutate({ data: { symbol } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetWatchlistQueryKey() });
        if (!sym) setNewSymbol("");
        toast({ title: "Added to Watchlist", description: `${symbol} added` });
      },
      onError: () => {
        toast({ title: "Error", description: "Stock not found or already in watchlist", variant: "destructive" });
      }
    });
  };

  const handleRemove = (symbol: string) => {
    removeFromWatchlist.mutate({ symbol }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetWatchlistQueryKey() });
        toast({ title: "Removed", description: `${symbol} removed from watchlist` });
      }
    });
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BookMarked className="w-5 h-5 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Watchlist</h1>
        </div>
        <span className="text-muted-foreground text-sm">{items.length} stocks</span>
      </div>

      <div className="flex gap-2">
        <Input
          placeholder="Enter symbol (e.g. RELIANCE, TCS, WIPRO)"
          value={newSymbol}
          onChange={(e) => setNewSymbol(e.target.value.toUpperCase())}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          className="bg-card border-border text-foreground font-mono uppercase placeholder:normal-case placeholder:font-normal"
          data-testid="input-add-watchlist"
        />
        <Button onClick={() => handleAdd()} disabled={addToWatchlist.isPending} data-testid="btn-add-watchlist" className="shrink-0">
          <Plus className="w-4 h-4 mr-1" />
          Add
        </Button>
      </div>

      {/* ── Recent Searches ── */}
      {recents.length > 0 && (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-semibold text-foreground">Recently Searched</span>
            </div>
            <button
              onClick={clearAll}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Clear all
            </button>
          </div>
          <div className="divide-y divide-border/50">
            {recents.map((stock) => {
              const live = prices[stock.symbol];
              const ltp = live?.ltp ?? 0;
              const chg = live?.change ?? 0;
              const chgPct = live?.changePercent ?? 0;
              const inWatchlist = watchlistSymbols.has(stock.symbol);
              return (
                <div
                  key={stock.symbol}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-accent/20 transition-colors group"
                >
                  <StockLogo symbol={stock.symbol} logoUrl={(stock as any).logoUrl} size={32} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground text-sm">{stock.symbol}</span>
                      <span className="text-xs bg-secondary text-muted-foreground px-1.5 py-0.5 rounded">{stock.exchange}</span>
                    </div>
                    <div className="text-xs text-muted-foreground truncate mt-0.5">{stock.name}</div>
                  </div>

                  <div className="text-right min-w-[90px]">
                    <div className="font-mono font-semibold text-sm text-foreground">
                      {ltp > 0 ? formatINR(ltp) : <span className="text-muted-foreground">—</span>}
                    </div>
                    {ltp > 0 && (
                      <div className={`text-xs font-mono flex items-center justify-end gap-0.5 ${pnlClass(chgPct)}`}>
                        {chgPct >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {formatPercent(chgPct)}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 ml-2">
                    <button
                      onClick={() => openOrderWindow({ symbol: stock.symbol, name: stock.name, currentPrice: ltp }, "BUY")}
                      className="px-2 py-1 text-xs font-semibold bg-green-500/15 text-green-400 border border-green-500/30 rounded hover:bg-green-500/25 transition-colors"
                    >BUY</button>
                    <button
                      onClick={() => openOrderWindow({ symbol: stock.symbol, name: stock.name, currentPrice: ltp }, "SELL")}
                      className="px-2 py-1 text-xs font-semibold bg-red-500/15 text-red-400 border border-red-500/30 rounded hover:bg-red-500/25 transition-colors"
                    >SELL</button>
                    {!inWatchlist && (
                      <button
                        onClick={() => handleAdd(stock.symbol)}
                        title="Add to Watchlist"
                        className="px-2 py-1 text-xs font-semibold bg-primary/10 text-primary border border-primary/30 rounded hover:bg-primary/20 transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={() => removeRecent(stock.symbol)}
                      className="p-1 rounded text-muted-foreground hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Watchlist ── */}
      {items.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground bg-card border border-border rounded-xl">
          <BookMarked className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">Your watchlist is empty</p>
          <p className="text-sm mt-1">Add stocks above or use the bookmark icon in Markets</p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-border">
              <tr>
                {["Symbol", "Company", "Price", "Change", "% Change", "Actions"].map((h) => (
                  <th key={h} className={`py-3 px-4 text-muted-foreground font-medium text-xs uppercase tracking-wider ${["Symbol", "Company"].includes(h) ? "text-left" : "text-right"}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const live = prices[item.symbol];
                const ltp = live?.ltp ?? item.currentPrice;
                const chg = live?.change ?? item.change;
                const chgPct = live?.changePercent ?? item.changePercent;
                return (
                <tr key={item.id} className="border-b border-border/50 hover:bg-accent/30 transition-colors" data-testid={`watchlist-row-${item.symbol}`}>
                  <td className="py-3 px-4 font-bold text-foreground">{item.symbol}</td>
                  <td className="py-3 px-4 text-muted-foreground text-sm max-w-[180px] truncate">{item.name}</td>
                  <td className="py-3 px-4 text-right font-mono font-semibold text-foreground">{formatINR(ltp)}</td>
                  <td className={`py-3 px-4 text-right font-mono text-sm ${pnlClass(chg)}`}>
                    {chg >= 0 ? "+" : ""}{formatINR(Math.abs(chg))}
                  </td>
                  <td className={`py-3 px-4 text-right font-mono text-sm font-medium ${pnlClass(chgPct)}`}>
                    {formatPercent(chgPct)}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-1.5 justify-end">
                      <button onClick={() => openOrderWindow({ symbol: item.symbol, name: item.name, currentPrice: ltp }, "BUY")} data-testid={`watchlist-buy-${item.symbol}`} className="px-2.5 py-1 text-xs font-semibold bg-green-500/15 text-green-400 border border-green-500/30 rounded hover:bg-green-500/25 transition-colors">BUY</button>
                      <button onClick={() => openOrderWindow({ symbol: item.symbol, name: item.name, currentPrice: ltp }, "SELL")} data-testid={`watchlist-sell-${item.symbol}`} className="px-2.5 py-1 text-xs font-semibold bg-red-500/15 text-red-400 border border-red-500/30 rounded hover:bg-red-500/25 transition-colors">SELL</button>
                      <button onClick={() => handleRemove(item.symbol)} data-testid={`watchlist-remove-${item.symbol}`} className="px-2 py-1 text-xs text-muted-foreground hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
