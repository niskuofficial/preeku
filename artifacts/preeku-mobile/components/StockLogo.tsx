import React from "react";
import { View, Text } from "react-native";

interface StockLogoProps {
  symbol: string;
  size?: number;
  borderRadius?: number;
  primaryColor?: string;
}

export default function StockLogo({ symbol, size = 40, borderRadius = 10 }: StockLogoProps) {
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
