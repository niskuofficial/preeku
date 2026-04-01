import { useState } from "react";

interface StockLogoProps {
  symbol: string;
  size?: number;
  className?: string;
}

export default function StockLogo({ symbol, size = 32, className = "" }: StockLogoProps) {
  const [failed, setFailed] = useState(false);
  const logoUrl = `https://assets.smallcase.com/images/smallplains/200x200/${symbol}.png`;

  if (!failed) {
    return (
      <img
        src={logoUrl}
        alt={symbol}
        width={size}
        height={size}
        style={{ width: size, height: size, borderRadius: 8, objectFit: "contain", background: "transparent" }}
        className={className}
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <div
      style={{ width: size, height: size, borderRadius: 8 }}
      className={`bg-primary/10 flex items-center justify-center flex-shrink-0 ${className}`}
    >
      <span className="text-primary font-bold" style={{ fontSize: size * 0.32 }}>
        {symbol.slice(0, 2)}
      </span>
    </div>
  );
}
