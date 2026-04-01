import { useEffect, useRef, useState } from "react";
import { useLivePrice } from "@/context/LivePricesContext";
import { formatINR, formatPercent, pnlClass } from "@/lib/format";

interface FlashingPriceProps {
  value: number;
  symbol?: string;
  format?: (v: number) => string;
  className?: string;
}

export function FlashingPrice({ value: propValue, symbol, format, className }: FlashingPriceProps) {
  const livePrice = useLivePrice(symbol);
  const value = livePrice?.ltp ?? propValue;

  const prevRef = useRef<number | undefined>(undefined);
  const [flashClass, setFlashClass] = useState("");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (prevRef.current === undefined) { prevRef.current = value; return; }
    if (value !== prevRef.current) {
      const isUp = value > prevRef.current;
      prevRef.current = value;
      if (timerRef.current) clearTimeout(timerRef.current);
      setFlashClass(isUp ? "flash-green" : "flash-red");
      timerRef.current = setTimeout(() => setFlashClass(""), 700);
    }
  }, [value]);

  const label = format ? format(value) : formatINR(value);

  return (
    <span className={`transition-colors duration-100 ${flashClass} ${className ?? ""}`}>
      {label}
    </span>
  );
}

interface LivePriceRowProps {
  symbol: string;
  name: string;
  ltp: number;
  change: number;
  changePercent: number;
  onClick?: () => void;
  compact?: boolean;
}

export function LivePriceRow({ symbol, name, ltp: propLtp, change: propChange, changePercent: propPct, onClick, compact }: LivePriceRowProps) {
  const live = useLivePrice(symbol);
  const ltp = live?.ltp ?? propLtp;
  const change = live?.change ?? propChange;
  const changePercent = live?.changePercent ?? propPct;

  const prevRef = useRef<number | undefined>(undefined);
  const [flashClass, setFlashClass] = useState("");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (prevRef.current === undefined) { prevRef.current = ltp; return; }
    if (ltp !== prevRef.current) {
      const isUp = ltp > prevRef.current;
      prevRef.current = ltp;
      if (timerRef.current) clearTimeout(timerRef.current);
      setFlashClass(isUp ? "flash-green" : "flash-red");
      timerRef.current = setTimeout(() => setFlashClass(""), 700);
    }
  }, [ltp]);

  return (
    <button
      className={`w-full flex items-center justify-between ${compact ? "p-2" : "p-3"} rounded-lg hover:bg-accent cursor-pointer transition-colors text-left`}
      onClick={onClick}
      data-testid={`watchlist-item-${symbol}`}
    >
      <div>
        <div className="font-semibold text-sm text-foreground">{symbol}</div>
        {!compact && <div className="text-muted-foreground text-xs">{name.split(" ").slice(0, 3).join(" ")}</div>}
      </div>
      <div className={`text-right transition-colors duration-100 ${flashClass}`}>
        <div className="font-mono text-sm text-foreground">{formatINR(ltp)}</div>
        <div className={`text-xs font-mono ${pnlClass(changePercent)}`}>
          {formatPercent(changePercent)}
          {!compact && <span className="ml-1 text-muted-foreground">({change >= 0 ? "+" : ""}{change.toFixed(2)})</span>}
        </div>
      </div>
    </button>
  );
}
