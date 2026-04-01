import React, { useRef, useEffect, useState } from "react";
import { Animated, Text, View, TextStyle } from "react-native";
import { useColors } from "@/hooks/useColors";

interface FlashingPriceProps {
  value: number;
  format?: (v: number) => string;
  style?: TextStyle;
}

export function FlashingPrice({ value, format, style }: FlashingPriceProps) {
  const colors = useColors();
  const prevRef = useRef<number | undefined>(undefined);
  const flashOpacity = useRef(new Animated.Value(0)).current;
  const [flashColor, setFlashColor] = useState("transparent");

  useEffect(() => {
    if (prevRef.current === undefined) {
      prevRef.current = value;
      return;
    }
    if (value !== prevRef.current) {
      const color = value > prevRef.current ? colors.gain + "55" : colors.loss + "55";
      prevRef.current = value;
      setFlashColor(color);
      flashOpacity.setValue(1);
      Animated.timing(flashOpacity, {
        toValue: 0,
        duration: 900,
        useNativeDriver: true,
      }).start();
    }
  }, [value]);

  const label = format
    ? format(value)
    : "₹" + value.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <View style={{ position: "relative" }}>
      <Animated.View
        style={{
          position: "absolute",
          top: -2, left: -4, right: -4, bottom: -2,
          backgroundColor: flashColor,
          borderRadius: 5,
          opacity: flashOpacity,
        }}
        pointerEvents="none"
      />
      <Text style={style}>{label}</Text>
    </View>
  );
}

interface FlashingChangeProps {
  change: number;
  changePercent: number;
  style?: TextStyle;
}

export function FlashingChange({ change, changePercent, style }: FlashingChangeProps) {
  const colors = useColors();
  const isUp = changePercent >= 0;
  const prevRef = useRef<number | undefined>(undefined);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (prevRef.current === undefined) {
      prevRef.current = changePercent;
      return;
    }
    if (changePercent !== prevRef.current) {
      prevRef.current = changePercent;
      scaleAnim.setValue(1.12);
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 120,
        useNativeDriver: true,
      }).start();
    }
  }, [changePercent]);

  const color = isUp ? colors.gain : colors.loss;
  const sign = isUp ? "+" : "";

  return (
    <Animated.Text
      style={[style, { color, transform: [{ scale: scaleAnim }] }]}
    >
      {sign}{changePercent.toFixed(2)}% ({sign}₹{Math.abs(change).toFixed(2)})
    </Animated.Text>
  );
}

interface LiveTickerProps {
  value: number;
  label?: string;
  style?: TextStyle;
  valueStyle?: TextStyle;
  upColor?: string;
  downColor?: string;
}

export function LiveTicker({ value, label, style, valueStyle, upColor, downColor }: LiveTickerProps) {
  const colors = useColors();
  const prevRef = useRef<number | undefined>(undefined);
  const flashOpacity = useRef(new Animated.Value(0)).current;
  const [flashColor, setFlashColor] = useState("transparent");
  const [direction, setDirection] = useState<"up" | "down" | null>(null);

  useEffect(() => {
    if (prevRef.current === undefined) {
      prevRef.current = value;
      return;
    }
    if (value !== prevRef.current) {
      const dir = value > prevRef.current ? "up" : "down";
      const color = dir === "up"
        ? (upColor ?? colors.gain) + "55"
        : (downColor ?? colors.loss) + "55";
      prevRef.current = value;
      setDirection(dir);
      setFlashColor(color);
      flashOpacity.setValue(1);
      Animated.timing(flashOpacity, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }).start();
    }
  }, [value]);

  const valueColor = direction === "up"
    ? (upColor ?? colors.gain)
    : direction === "down"
    ? (downColor ?? colors.loss)
    : valueStyle?.color ?? colors.foreground;

  const displayValue = "₹" + value.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <View style={[{ position: "relative" }, style]}>
      <Animated.View
        style={{ position: "absolute", top: -3, left: -6, right: -6, bottom: -3, backgroundColor: flashColor, borderRadius: 6, opacity: flashOpacity }}
        pointerEvents="none"
      />
      {label && <Text style={{ fontSize: 10, color: colors.mutedForeground, fontFamily: "Inter_400Regular", letterSpacing: 0.5 }}>{label.toUpperCase()}</Text>}
      <Text style={[valueStyle, { color: valueColor as string }]}>{displayValue}</Text>
    </View>
  );
}
