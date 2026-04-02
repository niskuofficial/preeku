import React, { useState } from "react";
import { View, Image, Text } from "react-native";

const CDN_SOURCES = (symbol: string) => [
  `https://assets.smallcase.com/images/smallplains/200x200/${symbol}.png`,
  `https://kite.zerodha.com/static/images/instrument_logos/${symbol}.png`,
  `https://storage.googleapis.com/kite-public/logos/${symbol}.png`,
];

interface StockLogoProps {
  symbol: string;
  logoUrl?: string | null;
  size?: number;
  borderRadius?: number;
}

export default function StockLogo({ symbol, logoUrl, size = 40, borderRadius = 10 }: StockLogoProps) {
  const sources = logoUrl ? [logoUrl, ...CDN_SOURCES(symbol)] : CDN_SOURCES(symbol);
  const [sourceIndex, setSourceIndex] = useState(0);

  if (sourceIndex < sources.length) {
    return (
      <Image
        key={sources[sourceIndex]}
        source={{ uri: sources[sourceIndex] }}
        style={{ width: size, height: size, borderRadius }}
        onError={() => setSourceIndex((i) => i + 1)}
        resizeMode="contain"
      />
    );
  }

  const hue = (symbol.charCodeAt(0) * 47 + (symbol.charCodeAt(1) ?? 0) * 23) % 360;
  const bg = `hsl(${hue},55%,28%)`;
  const fg = `hsl(${hue},70%,75%)`;
  const letter = symbol.slice(0, 2).toUpperCase();

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius,
        backgroundColor: bg,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text
        style={{
          color: fg,
          fontSize: size * 0.32,
          fontWeight: "700",
          letterSpacing: -0.5,
        }}
      >
        {letter}
      </Text>
    </View>
  );
}
