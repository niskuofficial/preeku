import React, { useState } from "react";
import { View, Image, Text } from "react-native";

interface StockLogoProps {
  symbol: string;
  size?: number;
  borderRadius?: number;
  primaryColor?: string;
}

export default function StockLogo({ symbol, size = 40, borderRadius = 10, primaryColor = "#f05a28" }: StockLogoProps) {
  const [failed, setFailed] = useState(false);

  const logoUrl = `https://assets.smallcase.com/images/smallplains/200x200/${symbol}.png`;

  if (!failed) {
    return (
      <Image
        source={{ uri: logoUrl }}
        style={{ width: size, height: size, borderRadius }}
        onError={() => setFailed(true)}
        resizeMode="contain"
      />
    );
  }

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius,
        backgroundColor: primaryColor + "18",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text
        style={{
          color: primaryColor,
          fontSize: size * 0.32,
          fontWeight: "700",
          fontFamily: "Inter_700Bold",
        }}
      >
        {symbol.slice(0, 2)}
      </Text>
    </View>
  );
}
