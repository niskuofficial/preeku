interface StockLogoProps {
  symbol: string;
  logoUrl?: string | null;
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
