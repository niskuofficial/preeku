import React, { useState } from "react";
import { View, Image, Text } from "react-native";

const LOGO_SOURCES = (symbol: string) => [
  `https://assets.smallcase.com/images/smallplains/200x200/${symbol}.png`,
  `https://kite.zerodha.com/static/images/instrument_logos/${symbol}.png`,
  `https://storage.googleapis.com/kite-public/logos/${symbol}.png`,
];

interface StockLogoProps {
  symbol: string;
  size?: number;
  borderRadius?: number;
  primaryColor?: string;
}

export default function StockLogo({ symbol, size = 40, borderRadius = 10, primaryColor = "#f05a28" }: StockLogoProps) {
  const sources = LOGO_SOURCES(symbol);
  const [sourceIndex, setSourceIndex] = useState(0);

  if (sourceIndex < sources.length) {
    return (
      <Image
        source={{ uri: sources[sourceIndex] }}
        style={{ width: size, height: size, borderRadius }}
        onError={() => setSourceIndex((i) => i + 1)}
        resizeMode="contain"
      />
    );
  }

  const letter = symbol.slice(0, 2).toUpperCase();
  const hue = (symbol.charCodeAt(0) * 47 + symbol.charCodeAt(1 % symbol.length) * 23) % 360;
  const bg = `hsl(${hue},55%,28%)`;
  const fg = `hsl(${hue},70%,75%)`;

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
          fontFamily: "Inter_700Bold",
          letterSpacing: -0.5,
        }}
      >
        {letter}
      </Text>
    </View>
  );
}
