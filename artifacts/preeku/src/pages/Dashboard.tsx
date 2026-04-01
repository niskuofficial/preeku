import { useGetPortfolioSummary, useGetMarketHeatmap, useListOrders, useGetWatchlist } from "@workspace/api-client-react";
import { useQuery } from "@tanstack/react-query";
import { formatINR, formatPercent, pnlClass } from "@/lib/format";
import { useTradingContext } from "@/context/TradingContext";
import { useLivePrices, useLivePrice } from "@/context/LivePricesContext";
import { LivePriceRow } from "@/components/FlashingPrice";
import { TrendingUp, TrendingDown, Wallet, BarChart3, ArrowUpRight, ArrowDownRight, Clock, Activity } from "lucide-react";
import StockLogo from "@/components/StockLogo";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useEffect, useRef, useState } from "react";

interface StockInfo { symbol: string; name: string; pnlPercent: number; }
interface SummaryType {
  totalInvested: number; currentValue: number; totalPnl: number; totalPnlPercent: number;
  dayPnl: number; dayPnlPercent: number; walletBalance: number;
  openPositions: number; totalHoldings: number; totalOrders: number;
  bestPerformer: StockInfo | null; worstPerformer: StockInfo | null;
}

interface IndexData { name: string; value: number; change: number; changePercent: number; }

function IndexCard({ idx }: { idx: IndexData }) {
  const up = idx.changePercent >= 0;
  const loading = idx.value === 0;
  const prevRef = useRef<number | undefined>(undefined);
  const [flashClass, setFlashClass] = useState("");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (prevRef.current === undefined) { prevRef.current = idx.value; return; }
    if (idx.value !== prevRef.current) {
      const isUp = idx.value > prevRef.current;
      prevRef.current = idx.value;
      if (timerRef.current) clearTimeout(timerRef.current);
      setFlashClass(isUp ? "flash-green" : "flash-red");
      timerRef.current = setTimeout(() => setFlashClass(""), 700);
    }
  }, [idx.value]);

  return (
    <div className={`flex-1 bg-card border rounded-xl p-4 ${loading ? "border-border" : up ? "border-green-500/20" : "border-red-500/20"}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{idx.name}</span>
        {loading ? (
          <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">Loading</span>
        ) : (
          <span className={`flex items-center gap-1 text-xs font-mono font-semibold px-2 py-0.5 rounded-full ${up ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}>
            {up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {up ? "+" : ""}{idx.changePercent.toFixed(2)}%
          </span>
        )}
      </div>
      <div className={`text-2xl font-bold font-mono ${flashClass} ${loading ? "text-muted-foreground" : "text-foreground"}`}>
        {loading ? "—" : idx.value.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
      </div>
      <div className={`text-xs mt-1 font-mono ${loading ? "text-muted-foreground" : up ? "text-green-400" : "text-red-400"}`}>
        {loading ? "Connecting..." : `${up ? "+" : ""}${idx.change.toFixed(2)} pts`}
      </div>
    </div>
  );
}

function FlashingStat({ label, value, sub, positive, icon: Icon }: {
  label: string; value: string; sub?: string; positive?: boolean;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-4" data-testid={`stat-card-${label.toLowerCase().replace(/\s+/g, '-')}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-muted-foreground text-xs uppercase tracking-wider font-medium">{label}</span>
        {Icon && <Icon className="w-4 h-4 text-muted-foreground" />}
      </div>
      <div className="text-2xl font-bold font-mono text-foreground">{value}</div>
      {sub && (
        <div className={`text-sm mt-1 flex items-center gap-1 ${positive === undefined ? "text-muted-foreground" : positive ? "text-green-400" : "text-red-400"}`}>
          {positive !== undefined && (positive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />)}
          {sub}
        </div>
      )}
    </div>
  );
}

function HeatmapBlock({ sector, stocks }: {
  sector: string;
  changePercent: number;
  stocks: { symbol: string; name: string; changePercent: number; marketCap: number }[];
}) {
  const { openOrderWindow } = useTradingContext();
  const { prices } = useLivePrices();

  const enriched = stocks
    .map((s) => ({ ...s, pct: prices[s.symbol]?.changePercent ?? s.changePercent, ltp: prices[s.symbol]?.ltp ?? 0 }))
    .filter((s) => s.pct !== 0)
    .sort((a, b) => b.marketCap - a.marketCap)
    .slice(0, 8);

  if (enriched.length === 0) return null;

  const liveSectorAvg = enriched.reduce((acc, s) => acc + s.pct, 0) / enriched.length;
  const isUp = liveSectorAvg >= 0;

  const getTileColors = (pct: number): { bg: string; border: string; text: string; badge: string } => {
    if (pct >= 3)  return { bg: "rgba(22,163,74,0.85)",  border: "rgba(74,222,128,0.4)", text: "#fff",        badge: "rgba(255,255,255,0.2)" };
    if (pct >= 1)  return { bg: "rgba(21,128,61,0.75)",  border: "rgba(74,222,128,0.3)", text: "#bbf7d0",     badge: "rgba(255,255,255,0.15)" };
    if (pct > 0)   return { bg: "rgba(20,83,45,0.70)",   border: "rgba(74,222,128,0.2)", text: "#86efac",     badge: "rgba(255,255,255,0.12)" };
    if (pct > -1)  return { bg: "rgba(127,29,29,0.70)",  border: "rgba(248,113,113,0.2)", text: "#fca5a5",    badge: "rgba(255,255,255,0.12)" };
    if (pct > -3)  return { bg: "rgba(153,27,27,0.78)",  border: "rgba(248,113,113,0.3)", text: "#fecaca",    badge: "rgba(255,255,255,0.15)" };
    return              { bg: "rgba(220,38,38,0.85)",  border: "rgba(248,113,113,0.4)", text: "#fff",        badge: "rgba(255,255,255,0.2)" };
  };

  return (
    <div className="mb-4">
      {/* Sector header */}
      <div className="flex items-center gap-2 mb-2 px-1">
        <div
          className="w-2 h-2 rounded-full flex-shrink-0"
          style={{ background: isUp ? "#4ade80" : "#f87171" }}
        />
        <span className="text-sm font-semibold text-foreground">{sector}</span>
        <div
          className="flex items-center gap-1 text-xs font-mono font-bold px-2 py-0.5 rounded-full"
          style={{
            background: isUp ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.12)",
            color: isUp ? "#4ade80" : "#f87171",
            border: `1px solid ${isUp ? "rgba(34,197,94,0.25)" : "rgba(239,68,68,0.25)"}`,
          }}
        >
          {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {isUp ? "+" : ""}{liveSectorAvg.toFixed(2)}%
        </div>
      </div>

      {/* Tiles grid */}
      <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${Math.min(enriched.length, 4)}, 1fr)` }}>
        {enriched.map((s) => {
          const colors = getTileColors(s.pct);
          return (
            <button
              key={s.symbol}
              onClick={() => openOrderWindow({ symbol: s.symbol, name: s.name, currentPrice: s.ltp })}
              data-testid={`heatmap-stock-${s.symbol}`}
              title={s.name}
              className="group relative rounded-lg p-2.5 text-left transition-all duration-150 cursor-pointer overflow-hidden"
              style={{
                background: colors.bg,
                border: `1px solid ${colors.border}`,
                minHeight: "64px",
              }}
            >
              {/* Hover shimmer */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                style={{ background: "rgba(255,255,255,0.07)" }}
              />
              <div className="relative z-10">
                <div
                  className="text-xs font-bold leading-tight truncate"
                  style={{ color: colors.text }}
                >
                  {s.symbol}
                </div>
                {s.ltp > 0 && (
                  <div
                    className="text-xs font-mono mt-0.5 truncate"
                    style={{ color: colors.text, opacity: 0.75 }}
                  >
                    ₹{s.ltp.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                  </div>
                )}
                <div
                  className="inline-flex items-center text-xs font-mono font-bold mt-1 px-1.5 py-0.5 rounded"
                  style={{ background: colors.badge, color: colors.text }}
                >
                  {s.pct >= 0 ? "+" : ""}{s.pct.toFixed(2)}%
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { data: summary } = useGetPortfolioSummary();
  const { data: heatmap } = useGetMarketHeatmap();
  const { data: orders } = useListOrders();
  const { data: watchlist } = useGetWatchlist();
  const { openOrderWindow } = useTradingContext();
  const { connected, prices } = useLivePrices();
  const [moversTab, setMoversTab] = useState<"gainers" | "losers">("gainers");

  const { data: indicesData } = useQuery<IndexData[]>({
    queryKey: ["market-indices"],
    queryFn: () => fetch("/api/market/indices").then((r) => r.json()),
    refetchInterval: 30000,
    staleTime: 15000,
  });

  const s = summary as SummaryType | undefined;
  const recentOrders = Array.isArray(orders) ? orders.slice(0, 5) : [];
  const heatmapData = Array.isArray(heatmap) ? heatmap : [];
  const watchlistItems = Array.isArray(watchlist) ? watchlist : [];

  type HeatmapStock = { symbol: string; name: string; changePercent: number; marketCap: number; sector?: string };
  const allMovers: HeatmapStock[] = heatmapData.flatMap(
    (sec: { sector: string; stocks: HeatmapStock[] }) =>
      sec.stocks.map((s) => ({ ...s, sector: sec.sector }))
  );
  const enriched = allMovers.map((s) => ({
    ...s,
    ltp: prices[s.symbol]?.ltp ?? 0,
    chgPct: prices[s.symbol]?.changePercent ?? s.changePercent,
  }));
  const topGainers = [...enriched].filter((s) => s.chgPct > 0).sort((a, b) => b.chgPct - a.chgPct).slice(0, 6);
  const topLosers = [...enriched].filter((s) => s.chgPct < 0).sort((a, b) => a.chgPct - b.chgPct).slice(0, 6);

  const indices: IndexData[] = indicesData && indicesData.length > 0 ? indicesData : [
    { name: "NIFTY 50", value: 0, change: 0, changePercent: 0 },
    { name: "SENSEX", value: 0, change: 0, changePercent: 0 },
  ];

  const baseValue = s ? (s.totalInvested || 1000000) : 1000000;
  const chartData = Array.from({ length: 30 }, (_, i) => ({
    day: `D${i + 1}`,
    value: parseFloat((baseValue + (Math.random() - 0.4) * baseValue * 0.02 + i * baseValue * 0.001).toFixed(2)),
  }));

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Your paper trading overview</p>
        </div>
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border ${connected ? "border-green-500/30 bg-green-500/10 text-green-400" : "border-yellow-500/30 bg-yellow-500/10 text-yellow-400"}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${connected ? "bg-green-400 animate-pulse" : "bg-yellow-400"}`} />
            {connected ? "Live" : "Connecting"}
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-secondary rounded-lg px-3 py-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span>9:15 AM – 3:30 PM IST</span>
          </div>
        </div>
      </div>

      {/* Index Cards */}
      <div className="flex gap-4">
        {indices.map((idx) => <IndexCard key={idx.name} idx={idx} />)}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <FlashingStat label="Wallet Balance" value={s ? formatINR(s.walletBalance) : "₹10,00,000"} sub="Available cash" icon={Wallet} />
        <FlashingStat label="Portfolio Value" value={s ? formatINR(s.currentValue) : "₹0"} sub={s ? formatPercent(s.totalPnlPercent) : undefined} positive={s ? s.totalPnl >= 0 : undefined} icon={BarChart3} />
        <FlashingStat label="Total P&L" value={s ? formatINR(s.totalPnl) : "₹0"} sub={s ? formatPercent(s.totalPnlPercent) : undefined} positive={s ? s.totalPnl >= 0 : undefined} icon={s && s.totalPnl >= 0 ? TrendingUp : TrendingDown} />
        <FlashingStat label="Day P&L" value={s ? formatINR(s.dayPnl) : "₹0"} sub={s ? formatPercent(s.dayPnlPercent) : undefined} positive={s ? s.dayPnl >= 0 : undefined} icon={Activity} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="xl:col-span-2 bg-card border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-foreground">Portfolio Performance</h2>
            <span className="text-xs text-muted-foreground">30 Day Simulated</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="portfolioGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(234 89% 74%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(234 89% 74%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" hide />
              <YAxis hide />
              <Tooltip
                contentStyle={{ background: "hsl(222 47% 7%)", border: "1px solid hsl(217 33% 14%)", borderRadius: "8px", fontSize: "12px" }}
                labelStyle={{ color: "hsl(215 20% 55%)" }}
                formatter={(v: number) => [formatINR(v), "Value"]}
              />
              <Area type="monotone" dataKey="value" stroke="hsl(234 89% 74%)" fill="url(#portfolioGrad)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Live Watchlist */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h2 className="font-semibold text-foreground mb-4">Watchlist</h2>
          {watchlistItems.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-8">No stocks in watchlist</p>
          ) : (
            <div className="space-y-1">
              {watchlistItems.slice(0, 6).map((w: { id: number; symbol: string; name: string; currentPrice: number; change: number; changePercent: number }) => (
                <LivePriceRow
                  key={w.symbol}
                  symbol={w.symbol}
                  name={w.name}
                  ltp={w.currentPrice}
                  change={w.change}
                  changePercent={w.changePercent}
                  onClick={() => openOrderWindow({ symbol: w.symbol, name: w.name, currentPrice: w.currentPrice })}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Top Movers */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {/* Tab bar */}
        <div className="flex border-b border-border">
          <button
            type="button"
            onClick={() => setMoversTab("gainers")}
            className="flex-1 py-3 text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
            style={{
              color: moversTab === "gainers" ? "#4ade80" : "var(--muted-foreground)",
              borderBottom: moversTab === "gainers" ? "2px solid #22c55e" : "2px solid transparent",
              background: moversTab === "gainers" ? "rgba(34,197,94,0.06)" : "transparent",
            }}
          >
            <TrendingUp className="w-4 h-4" />
            Top Gainers
          </button>
          <button
            type="button"
            onClick={() => setMoversTab("losers")}
            className="flex-1 py-3 text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
            style={{
              color: moversTab === "losers" ? "#f87171" : "var(--muted-foreground)",
              borderBottom: moversTab === "losers" ? "2px solid #ef4444" : "2px solid transparent",
              background: moversTab === "losers" ? "rgba(239,68,68,0.06)" : "transparent",
            }}
          >
            <TrendingDown className="w-4 h-4" />
            Top Losers
          </button>
        </div>

        {/* Stock rows */}
        <div className="divide-y divide-border/50">
          {(moversTab === "gainers" ? topGainers : topLosers).length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-6">
              {heatmapData.length === 0 ? "Loading live data..." : `No ${moversTab} right now`}
            </p>
          ) : (
            (moversTab === "gainers" ? topGainers : topLosers).map((stock) => (
              <div
                key={stock.symbol}
                className="flex items-center justify-between px-5 py-3 hover:bg-accent/30 cursor-pointer transition-colors"
                onClick={() => openOrderWindow({ symbol: stock.symbol, name: stock.name, currentPrice: stock.ltp })}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <StockLogo symbol={stock.symbol} size={32} />
                  <div className="min-w-0">
                    <div className="font-semibold text-foreground text-sm">{stock.symbol}</div>
                    <div className="text-muted-foreground text-xs truncate max-w-[140px]">{stock.sector}</div>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="font-mono font-semibold text-foreground text-sm">
                    {stock.ltp > 0 ? `₹${stock.ltp.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "—"}
                  </div>
                  <div
                    className="text-xs font-mono font-semibold px-1.5 py-0.5 rounded"
                    style={{
                      background: stock.chgPct >= 0 ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)",
                      color: stock.chgPct >= 0 ? "#4ade80" : "#f87171",
                    }}
                  >
                    {stock.chgPct >= 0 ? "+" : ""}{stock.chgPct.toFixed(2)}%
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Market Heatmap */}
      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-semibold text-foreground">Market Heatmap</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Sector-wise performance · sorted by market cap</p>
          </div>
          {/* Color legend */}
          <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
            <span>Loss</span>
            {["rgba(220,38,38,0.85)", "rgba(153,27,27,0.78)", "rgba(127,29,29,0.70)", "rgba(20,83,45,0.70)", "rgba(21,128,61,0.75)", "rgba(22,163,74,0.85)"].map((bg, i) => (
              <div key={i} className="w-5 h-4 rounded" style={{ background: bg }} />
            ))}
            <span>Gain</span>
          </div>
        </div>
        {heatmapData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 gap-2">
            <Activity className="w-8 h-8 text-muted-foreground/40" />
            <p className="text-muted-foreground text-sm">Loading live market data...</p>
          </div>
        ) : (
          <div data-testid="market-heatmap" className="space-y-3">
            {heatmapData
              .filter((sec: { sector: string; changePercent: number; stocks: { symbol: string; name: string; changePercent: number; marketCap: number }[] }) =>
                sec.stocks.some((s) => s.changePercent !== 0)
              )
              .map((sector: { sector: string; changePercent: number; stocks: { symbol: string; name: string; changePercent: number; marketCap: number }[] }) => (
                <HeatmapBlock key={sector.sector} {...sector} />
              ))}
          </div>
        )}
      </div>

      {/* Recent Orders */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h2 className="font-semibold text-foreground mb-4">Recent Orders</h2>
        {recentOrders.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-6">No orders yet. Start trading from the Markets page!</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {["Symbol", "Side", "Qty", "Price", "Status"].map((h) => (
                    <th key={h} className={`py-2 text-muted-foreground font-medium text-xs uppercase ${h === "Symbol" ? "text-left" : "text-right"}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order: { id: number; symbol: string; side: string; quantity: number; price: number; status: string }) => (
                  <tr key={order.id} className="border-b border-border/50 hover:bg-accent/50" data-testid={`order-row-${order.id}`}>
                    <td className="py-2.5 font-semibold text-foreground">{order.symbol}</td>
                    <td className="py-2.5 text-right">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded ${order.side === "BUY" ? "bg-green-500/15 text-green-400" : "bg-red-500/15 text-red-400"}`}>{order.side}</span>
                    </td>
                    <td className="py-2.5 text-right font-mono text-foreground">{order.quantity}</td>
                    <td className="py-2.5 text-right font-mono text-foreground">{formatINR(order.price)}</td>
                    <td className="py-2.5 text-right">
                      <span className={`text-xs px-2 py-0.5 rounded ${order.status === "EXECUTED" ? "bg-green-500/15 text-green-400" : order.status === "PENDING" ? "bg-amber-500/15 text-amber-400" : "bg-red-500/15 text-red-400"}`}>{order.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
