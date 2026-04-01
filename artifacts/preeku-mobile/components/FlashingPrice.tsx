import React, { useRef, useEffect, useState } from "react";
import { Animated, Text, View, TextStyle } from "react-native";
import { useColors } from "@/hooks/useColors";
import { useLivePrice } from "@/context/LivePricesContext";

interface FlashingPriceProps {
  value: number;
  symbol?: string;
  format?: (v: number) => string;
  style?: TextStyle;
}

function useFlashEffect(value: number, gainColor: string, lossColor: string) {
  const prevRef = useRef<number | undefined>(undefined);
  const flashOpacity = useRef(new Animated.Value(0)).current;
  const [flashColor, setFlashColor] = useState("transparent");

  useEffect(() => {
    if (prevRef.current === undefined) { prevRef.current = value; return; }
    if (value !== prevRef.current) {
      const color = value > prevRef.current ? gainColor + "55" : lossColor + "55";
      prevRef.current = value;
      setFlashColor(color);
      flashOpacity.setValue(1);
      Animated.timing(flashOpacity, { toValue: 0, duration: 900, useNativeDriver: true }).start();
    }
  }, [value]);

  return { flashOpacity, flashColor };
}

export function FlashingPrice({ value: propValue, symbol, format, style }: FlashingPriceProps) {
  const colors = useColors();
  const livePrice = useLivePrice(symbol);
  const value = livePrice?.ltp ?? propValue;
  const { flashOpacity, flashColor } = useFlashEffect(value, colors.gain, colors.loss);

  const label = format
    ? format(value)
    : "₹" + value.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <View style={{ position: "relative" }}>
      <Animated.View
        style={{ position: "absolute", top: -2, left: -4, right: -4, bottom: -2, backgroundColor: flashColor, borderRadius: 5, opacity: flashOpacity }}
        pointerEvents="none"
      />
      <Text style={style}>{label}</Text>
    </View>
  );
}

interface FlashingChangeProps {
  change: number;
  changePercent: number;
  symbol?: string;
  style?: TextStyle;
}

export function FlashingChange({ change: propChange, changePercent: propChangePct, symbol, style }: FlashingChangeProps) {
  const colors = useColors();
  const livePrice = useLivePrice(symbol);
  const change = livePrice?.change ?? propChange;
  const changePercent = livePrice?.changePercent ?? propChangePct;

  const prevRef = useRef<number | undefined>(undefined);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (prevRef.current === undefined) { prevRef.current = changePercent; return; }
    if (changePercent !== prevRef.current) {
      prevRef.current = changePercent;
      scaleAnim.setValue(1.1);
      Animated.spring(scaleAnim, { toValue: 1, friction: 4, tension: 120, useNativeDriver: true }).start();
    }
  }, [changePercent]);

  const isUp = changePercent >= 0;
  const color = isUp ? colors.gain : colors.loss;
  const sign = isUp ? "+" : "";

  return (
    <Animated.Text style={[style, { color, transform: [{ scale: scaleAnim }] }]}>
      {sign}{changePercent.toFixed(2)}% ({sign}₹{Math.abs(change).toFixed(2)})
    </Animated.Text>
  );
}

interface LiveChangeChipProps {
  symbol: string;
  changePercent: number;
  style?: TextStyle;
}

export function LiveChangeChip({ symbol, changePercent: propPct, style }: LiveChangeChipProps) {
  const colors = useColors();
  const livePrice = useLivePrice(symbol);
  const changePercent = livePrice?.changePercent ?? propPct;
  const isUp = changePercent >= 0;

  return (
    <Text style={[style, { color: isUp ? colors.gain : colors.loss }]}>
      {isUp ? "+" : ""}{changePercent.toFixed(2)}%
    </Text>
  );
}
