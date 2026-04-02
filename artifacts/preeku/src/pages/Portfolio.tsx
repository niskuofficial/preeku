import { useState } from "react";
import { useGetPositions, useGetHoldings } from "@workspace/api-client-react";
import { formatINR, formatPercent, pnlClass, pnlBgClass } from "@/lib/format";
import { useTradingContext } from "@/context/TradingContext";
import { useLivePrices } from "@/context/LivePricesContext";
import { BarChart3, TrendingUp, TrendingDown } from "lucide-react";
import StockLogo from "@/components/StockLogo";

interface Position {
  id: number; symbol: string; stockName: string; quantity: number;
  avgBuyPrice: number; currentPrice: number; pnl: number; pnlPercent: number;
  currentValue: number; investedValue: number; productType: string;
}

interface Holding {
  id: number; symbol: string; stockName: string; quantity: number;
  avgBuyPrice: number; currentPrice: number; pnl: number; pnlPercent: number;
  currentValue: number; investedValue: number; dayChange: number; dayChangePercent: number;
}

type TabType = "positions" | "holdings";

export default function Portfolio() {
  const [activeTab, setActiveTab] = useState<TabType>("positions");
  const { data: positions } = useGetPositions();
  const { data: holdings } = useGetHoldings();
  const { openOrderWindow } = useTradingContext();
  const { prices } = useLivePrices();

  const positionList: Position[] = Array.isArray(positions) ? positions : [];
  const holdingList: Holding[] = Array.isArray(holdings) ? holdings : [];

  const livePositions = positionList.map((pos) => {
    const live = prices[pos.symbol];
    const livePrice = live?.ltp ?? pos.currentPrice;
    const liveValue = livePrice * pos.quantity;
    const livePnl = (livePrice - pos.avgBuyPrice) * pos.quantity;
    const livePnlPct = pos.investedValue > 0 ? (livePnl / pos.investedValue) * 100 : 0;
    return { ...pos, currentPrice: livePrice, currentValue: liveValue, pnl: livePnl, pnlPercent: livePnlPct };
  });

  const liveHoldings = holdingList.map((h) => {
    const live = prices[h.symbol];
    const livePrice = live?.ltp ?? h.currentPrice;
    const liveValue = livePrice * h.quantity;
    const livePnl = (livePrice - h.avgBuyPrice) * h.quantity;
    const livePnlPct = h.investedValue > 0 ? (livePnl / h.investedValue) * 100 : 0;
    const dayChgPct = live?.changePercent ?? h.dayChangePercent;
    return { ...h, currentPrice: livePrice, currentValue: liveValue, pnl: livePnl, pnlPercent: livePnlPct, dayChangePercent: dayChgPct };
  });

  const totalInvested = [...livePositions, ...liveHoldings].reduce((s, x) => s + x.investedValue, 0);
  const totalCurrentValue = [...livePositions, ...liveHoldings].reduce((s, x) => s + x.currentValue, 0);
  const totalPnl = totalCurrentValue - totalInvested;
  const totalPnlPct = totalInvested > 0 ? (totalPnl / totalInvested) * 100 : 0;
  const dayPnl = liveHoldings.reduce((s, h) => {
    const live = prices[h.symbol];
    return s + (live ? (live.ltp - live.close) * h.quantity : 0);
  }, 0);

  const hasAny = livePositions.length > 0 || liveHoldings.length > 0;

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-5">
      <div className="flex items-center gap-3">
        <BarChart3 className="w-5 h-5 text-primary" />
        <h1 className="text-2xl font-bold text-foreground">Portfolio</h1>
      </div>

      {hasAny && (
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
          {[
            { label: "Invested", value: formatINR(totalInvested), pnl: undefined },
            { label: "Current Value", value: formatINR(totalCurrentValue), pnl: undefined },
            { label: "Total P&L", value: `${totalPnl >= 0 ? "+" : ""}${formatINR(totalPnl)}`, pnl: totalPnl, pct: totalPnlPct },
            { label: "Day P&L", value: `${dayPnl >= 0 ? "+" : ""}${formatINR(dayPnl)}`, pnl: dayPnl, pct: undefined },
          ].map(({ label, value, pnl, pct }) => (
            <div key={label} className="bg-card border border-border rounded-xl p-4" data-testid={`portfolio-stat-${label.replace(/\s+/g, '-')}`}>
              <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">{label}</div>
              <div className={`text-lg font-bold font-mono ${pnl !== undefined ? pnlClass(pnl) : "text-foreground"}`}>{value}</div>
              {pnl !== undefined && pct !== undefined && (
                <div className={`text-xs mt-1 flex items-center gap-1 ${pnlClass(pnl)}`}>
                  {pnl >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {formatPercent(pct)}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-1 bg-card border border-border rounded-lg p-1 w-fit">
        {[
          { key: "positions", label: `Positions (${livePositions.length})` },
          { key: "holdings", label: `Holdings (${liveHoldings.length})` },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key as TabType)}
            data-testid={`tab-${key}`}
            className={`px-5 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >{label}</button>
        ))}
      </div>

      {activeTab === "positions" && (
        livePositions.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground bg-card border border-border rounded-xl">
            <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No open positions</p>
            <p className="text-sm mt-1">Place intraday trades to see them here</p>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="border-b border-border">
                <tr>
                  {["Symbol", "Qty", "Avg Buy", "LTP", "Invested", "Value", "P&L", "P&L %", ""].map((h, i) => (
                    <th key={`${h}-${i}`} className={`py-3 px-4 text-muted-foreground font-medium text-xs uppercase tracking-wider ${i === 0 ? "text-left" : i === 8 ? "text-center" : "text-right"}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {livePositions.map((pos) => (
                  <tr key={pos.id} className="border-b border-border/50 hover:bg-accent/30" data-testid={`position-row-${pos.symbol}`}>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <StockLogo symbol={pos.symbol} logoUrl={(pos as any).logoUrl} size={30} />
                        <div>
                          <div className="font-bold text-foreground">{pos.symbol}</div>
                          <div className="text-muted-foreground text-xs">{pos.productType}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-foreground">{pos.quantity}</td>
                    <td className="py-3 px-4 text-right font-mono text-foreground">{formatINR(pos.avgBuyPrice)}</td>
                    <td className="py-3 px-4 text-right font-mono font-semibold text-foreground">{formatINR(pos.currentPrice)}</td>
                    <td className="py-3 px-4 text-right font-mono text-muted-foreground">{formatINR(pos.investedValue)}</td>
                    <td className="py-3 px-4 text-right font-mono text-foreground">{formatINR(pos.currentValue)}</td>
                    <td className={`py-3 px-4 text-right font-mono font-semibold ${pnlClass(pos.pnl)}`}>
                      {pos.pnl >= 0 ? "+" : ""}{formatINR(pos.pnl)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className={`text-xs font-mono px-2 py-0.5 rounded ${pnlBgClass(pos.pnlPercent)}`}>{formatPercent(pos.pnlPercent)}</span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button onClick={() => openOrderWindow({ symbol: pos.symbol, name: pos.stockName, currentPrice: pos.currentPrice }, "SELL")} data-testid={`btn-exit-${pos.symbol}`} className="px-2.5 py-1 text-xs font-semibold bg-red-500/15 text-red-400 border border-red-500/30 rounded hover:bg-red-500/25 transition-colors">Exit</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      {activeTab === "holdings" && (
        liveHoldings.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground bg-card border border-border rounded-xl">
            <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No holdings</p>
            <p className="text-sm mt-1">Place delivery trades to build your portfolio</p>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="border-b border-border">
                <tr>
                  {["Symbol", "Qty", "Avg Cost", "LTP", "Invested", "Value", "P&L", "Day Chg", ""].map((h, i) => (
                    <th key={`${h}-${i}`} className={`py-3 px-4 text-muted-foreground font-medium text-xs uppercase tracking-wider ${i === 0 ? "text-left" : i === 8 ? "text-center" : "text-right"}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {liveHoldings.map((h) => (
                  <tr key={h.id} className="border-b border-border/50 hover:bg-accent/30" data-testid={`holding-row-${h.symbol}`}>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <StockLogo symbol={h.symbol} logoUrl={(h as any).logoUrl} size={30} />
                        <div>
                          <div className="font-bold text-foreground">{h.symbol}</div>
                          <div className="text-muted-foreground text-xs truncate max-w-[120px]">{h.stockName}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-foreground">{h.quantity}</td>
                    <td className="py-3 px-4 text-right font-mono text-foreground">{formatINR(h.avgBuyPrice)}</td>
                    <td className="py-3 px-4 text-right font-mono font-semibold text-foreground">{formatINR(h.currentPrice)}</td>
                    <td className="py-3 px-4 text-right font-mono text-muted-foreground">{formatINR(h.investedValue)}</td>
                    <td className="py-3 px-4 text-right font-mono text-foreground">{formatINR(h.currentValue)}</td>
                    <td className={`py-3 px-4 text-right font-mono font-semibold ${pnlClass(h.pnl)}`}>
                      {h.pnl >= 0 ? "+" : ""}{formatINR(h.pnl)}
                    </td>
                    <td className={`py-3 px-4 text-right font-mono text-xs ${pnlClass(h.dayChangePercent)}`}>{formatPercent(h.dayChangePercent)}</td>
                    <td className="py-3 px-4 text-center">
                      <button onClick={() => openOrderWindow({ symbol: h.symbol, name: h.stockName, currentPrice: h.currentPrice }, "SELL")} data-testid={`btn-sell-holding-${h.symbol}`} className="px-2.5 py-1 text-xs font-semibold bg-red-500/15 text-red-400 border border-red-500/30 rounded hover:bg-red-500/25 transition-colors">Sell</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}
    </div>
  );
}
