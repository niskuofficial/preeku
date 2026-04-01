import { useState } from "react";
import { useListStocks, getListStocksQueryKey } from "@workspace/api-client-react";
import { formatINR, formatPercent, pnlClass } from "@/lib/format";
import { useTradingContext } from "@/context/TradingContext";
import { useLivePrices } from "@/context/LivePricesContext";
import { Search, TrendingUp, TrendingDown } from "lucide-react";
import { Input } from "@/components/ui/input";

interface Stock {
  symbol: string; name: string; exchange: string; sector: string;
  currentPrice: number; previousClose: number; change: number; changePercent: number;
  high: number; low: number; volume: number; marketCap: number;
}

export default function Markets() {
  const [search, setSearch] = useState("");
  const { data: stocks } = useListStocks(search ? { search } : undefined, {
    query: { queryKey: getListStocksQueryKey(search ? { search } : undefined) }
  });
  const { openOrderWindow } = useTradingContext();
  const { prices } = useLivePrices();

  const stockList: Stock[] = Array.isArray(stocks) ? stocks : [];

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Markets</h1>
        <div className="text-xs text-muted-foreground">{stockList.length} stocks</div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search by symbol or name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 bg-card border-border text-foreground placeholder:text-muted-foreground"
          data-testid="input-market-search"
        />
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Gainers", count: stockList.filter((s) => s.changePercent >= 0).length, color: "text-green-400" },
          { label: "Losers", count: stockList.filter((s) => s.changePercent < 0).length, color: "text-red-400" },
          { label: "Total", count: stockList.length, color: "text-foreground" },
        ].map(({ label, count, color }) => (
          <div key={label} className="bg-card border border-border rounded-lg p-3 text-center">
            <div className={`text-xl font-bold font-mono ${color}`}>{count}</div>
            <div className="text-xs text-muted-foreground">{label}</div>
          </div>
        ))}
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-border">
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
                <td className="py-3 px-4 text-muted-foreground max-w-[150px] truncate text-sm">{stock.name}</td>
                <td className="py-3 px-4 text-right">
                  <span className="text-xs bg-secondary text-muted-foreground px-2 py-0.5 rounded">{stock.exchange}</span>
                </td>
                <td className="py-3 px-4 text-right font-mono font-semibold text-foreground">{formatINR(ltp)}</td>
                <td className={`py-3 px-4 text-right font-mono text-sm ${pnlClass(chg)}`}>
                  <span className="flex items-center justify-end gap-1">
                    {chg >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {chg >= 0 ? "+" : ""}{formatINR(Math.abs(chg))}
                  </span>
                </td>
                <td className={`py-3 px-4 text-right font-mono text-sm ${pnlClass(chgPct)}`}>
                  {formatPercent(chgPct)}
                </td>
                <td className="py-3 px-4 text-right font-mono text-muted-foreground text-xs">
                  {(live?.volume ?? stock.volume).toLocaleString("en-IN")}
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
          </tbody>
        </table>
      </div>
    </div>
  );
}
