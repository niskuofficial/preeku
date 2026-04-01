import { useState } from "react";

const LOGO_SOURCES = (symbol: string) => [
  `https://assets.smallcase.com/images/smallplains/200x200/${symbol}.png`,
  `https://kite.zerodha.com/static/images/instrument_logos/${symbol}.png`,
  `https://storage.googleapis.com/kite-public/logos/${symbol}.png`,
];

interface StockLogoProps {
  symbol: string;
  size?: number;
  className?: string;
}

function getAvatarColors(symbol: string) {
  const hue = (symbol.charCodeAt(0) * 47 + (symbol.charCodeAt(1) ?? 0) * 23) % 360;
  return {
    bg: `hsl(${hue},50%,22%)`,
    fg: `hsl(${hue},65%,70%)`,
  };
}

export default function StockLogo({ symbol, size = 32, className = "" }: StockLogoProps) {
  const sources = LOGO_SOURCES(symbol);
  const [sourceIndex, setSourceIndex] = useState(0);

  if (sourceIndex < sources.length) {
    return (
      <img
        key={sources[sourceIndex]}
        src={sources[sourceIndex]}
        alt={symbol}
        width={size}
        height={size}
        style={{
          width: size,
          height: size,
          borderRadius: 8,
          objectFit: "contain",
          background: "transparent",
          flexShrink: 0,
        }}
        className={className}
        onError={() => setSourceIndex((i) => i + 1)}
      />
    );
  }

  const { bg, fg } = getAvatarColors(symbol);
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: 8,
        background: bg,
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      className={className}
    >
      <span style={{ color: fg, fontWeight: 700, fontSize: size * 0.32, letterSpacing: -0.5 }}>
        {symbol.slice(0, 2).toUpperCase()}
      </span>
    </div>
  );
}
