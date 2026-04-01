import { useGetPortfolioSummary, useGetMarketHeatmap, useListOrders, useGetWatchlist } from "@workspace/api-client-react";
import { formatINR, formatPercent, pnlClass, formatINRCompact } from "@/lib/format";
import { useTradingContext } from "@/context/TradingContext";
import { TrendingUp, TrendingDown, Wallet, BarChart3, ArrowUpRight, ArrowDownRight, Clock } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

interface StockInfo { symbol: string; name: string; pnlPercent: number; }
interface SummaryType {
  totalInvested: number; currentValue: number; totalPnl: number; totalPnlPercent: number;
  dayPnl: number; dayPnlPercent: number; walletBalance: number;
  openPositions: number; totalHoldings: number; totalOrders: number;
  bestPerformer: StockInfo | null; worstPerformer: StockInfo | null;
}

function StatCard({ label, value, sub, positive, icon: Icon }: {
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
  stocks: { symbol: string; name: string; changePercent: number; marketCap: number }[];
}) {
  const sectorChange = stocks.length > 0 ? stocks.reduce((acc, s) => acc + s.changePercent, 0) / stocks.length : 0;
  const { openOrderWindow } = useTradingContext();

  const getColor = (pct: number) => {
    if (pct > 2) return "bg-green-500";
    if (pct > 1) return "bg-green-600";
    if (pct > 0) return "bg-green-800";
    if (pct > -1) return "bg-red-800";
    if (pct > -2) return "bg-red-600";
    return "bg-red-500";
  };

  return (
    <div className="rounded-lg p-3 border border-border/50 bg-background/50">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-foreground">{sector}</span>
        <span className={`text-xs font-mono ${sectorChange >= 0 ? "text-green-400" : "text-red-400"}`}>
          {formatPercent(sectorChange)}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-1">
        {stocks.slice(0, 4).map((s) => (
          <button
            key={s.symbol}
            onClick={() => openOrderWindow({ symbol: s.symbol, name: s.name, currentPrice: 0 })}
            data-testid={`heatmap-stock-${s.symbol}`}
            className={`${getColor(s.changePercent)} rounded p-1.5 text-left transition-opacity hover:opacity-80`}
          >
            <div className="text-white text-xs font-bold">{s.symbol}</div>
            <div className="text-white/80 text-xs font-mono">{formatPercent(s.changePercent)}</div>
          </button>
        ))}
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

  const s = summary as SummaryType | undefined;
  const recentOrders = Array.isArray(orders) ? orders.slice(0, 5) : [];
  const heatmapData = Array.isArray(heatmap) ? heatmap : [];
  const watchlistItems = Array.isArray(watchlist) ? watchlist : [];

  // Build simulated portfolio chart data
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
        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-secondary rounded-lg px-3 py-1.5">
          <Clock className="w-3.5 h-3.5" />
          <span>Market: 9:15 AM - 3:30 PM IST</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Wallet Balance" value={s ? formatINRCompact(s.walletBalance) : "₹10,00,000"} sub="Available cash" icon={Wallet} />
        <StatCard label="Portfolio Value" value={s ? formatINRCompact(s.currentValue) : "₹0"} sub={s ? formatPercent(s.totalPnlPercent) : undefined} positive={s ? s.totalPnl >= 0 : undefined} icon={BarChart3} />
        <StatCard label="Total P&L" value={s ? formatINRCompact(s.totalPnl) : "₹0"} sub={s ? formatPercent(s.totalPnlPercent) : undefined} positive={s ? s.totalPnl >= 0 : undefined} icon={s && s.totalPnl >= 0 ? TrendingUp : TrendingDown} />
        <StatCard label="Day P&L" value={s ? formatINRCompact(s.dayPnl) : "₹0"} sub={s ? formatPercent(s.dayPnlPercent) : undefined} positive={s ? s.dayPnl >= 0 : undefined} />
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

        {/* Watchlist Quick */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h2 className="font-semibold text-foreground mb-4">Watchlist</h2>
          {watchlistItems.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-8">No stocks in watchlist</p>
          ) : (
            <div className="space-y-1">
              {watchlistItems.slice(0, 6).map((w: { id: number; symbol: string; name: string; currentPrice: number; change: number; changePercent: number }) => (
                <button
                  key={w.symbol}
                  className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-accent cursor-pointer transition-colors text-left"
                  onClick={() => openOrderWindow({ symbol: w.symbol, name: w.name, currentPrice: w.currentPrice })}
                  data-testid={`watchlist-item-${w.symbol}`}
                >
                  <div>
                    <div className="font-semibold text-sm text-foreground">{w.symbol}</div>
                    <div className="text-muted-foreground text-xs">{w.name.split(" ").slice(0, 2).join(" ")}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-sm text-foreground">{formatINR(w.currentPrice)}</div>
                    <div className={`text-xs font-mono ${pnlClass(w.changePercent)}`}>{formatPercent(w.changePercent)}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Market Heatmap */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h2 className="font-semibold text-foreground mb-4">Market Heatmap</h2>
        {heatmapData.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-6">Loading heatmap...</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3" data-testid="market-heatmap">
            {heatmapData.map((sector: { sector: string; changePercent: number; stocks: { symbol: string; name: string; changePercent: number; marketCap: number }[] }) => (
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
