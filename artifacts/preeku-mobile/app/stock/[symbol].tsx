import React, { useState, useCallback } from "react";
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  Platform, StatusBar, ActivityIndicator, Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import Svg, { Path, Defs, LinearGradient, Stop, Line, Circle } from "react-native-svg";
import { useGetStock } from "@workspace/api-client-react";
import { useColors } from "@/hooks/useColors";
import { useTradingContext } from "@/context/TradingContext";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CHART_WIDTH = SCREEN_WIDTH - 32;
const CHART_HEIGHT = 200;
const CHART_PADDING = { top: 16, bottom: 24, left: 0, right: 0 };

interface PricePoint { time: string; price: number; volume: number }

function formatINR(n: number) {
  if (Math.abs(n) >= 1e7) return "₹" + (n / 1e7).toFixed(2) + "Cr";
  if (Math.abs(n) >= 1e5) return "₹" + (n / 1e5).toFixed(2) + "L";
  return "₹" + n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function formatVol(n: number) {
  if (n >= 1e7) return (n / 1e7).toFixed(2) + "Cr";
  if (n >= 1e5) return (n / 1e5).toFixed(2) + "L";
  if (n >= 1000) return (n / 1000).toFixed(1) + "K";
  return String(n);
}

function PriceChart({ points, isUp, colors }: { points: PricePoint[]; isUp: boolean; colors: ReturnType<typeof useColors> }) {
  const [tooltip, setTooltip] = useState<{ x: number; y: number; price: number; time: string } | null>(null);

  if (!points || points.length < 2) return null;

  const prices = points.map((p) => p.price);
  const minP = Math.min(...prices);
  const maxP = Math.max(...prices);
  const range = maxP - minP || 1;

  const W = CHART_WIDTH;
  const H = CHART_HEIGHT;
  const padT = CHART_PADDING.top;
  const padB = CHART_PADDING.bottom;

  const toX = (i: number) => (i / (points.length - 1)) * W;
  const toY = (p: number) => padT + ((maxP - p) / range) * (H - padT - padB);

  const linePath = points
    .map((pt, i) => `${i === 0 ? "M" : "L"}${toX(i).toFixed(1)},${toY(pt.price).toFixed(1)}`)
    .join(" ");

  const areaPath =
    linePath +
    ` L${toX(points.length - 1).toFixed(1)},${H - padB} L0,${H - padB} Z`;

  const strokeColor = isUp ? colors.gain : colors.loss;

  const handleTouch = useCallback(
    (e: { nativeEvent: { locationX: number } }) => {
      const x = Math.max(0, Math.min(e.nativeEvent.locationX, W));
      const idx = Math.round((x / W) * (points.length - 1));
      const clamped = Math.max(0, Math.min(idx, points.length - 1));
      const pt = points[clamped];
      setTooltip({ x: toX(clamped), y: toY(pt.price), price: pt.price, time: pt.time });
    },
    [points]
  );

  const timeLabels = [
    points[0]?.time,
    points[Math.floor(points.length / 2)]?.time,
    points[points.length - 1]?.time,
  ].map((t) => {
    if (!t) return "";
    const d = new Date(t);
    return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false });
  });

  return (
    <View>
      <Svg
        width={W}
        height={H}
        onPress={handleTouch}
        onResponderMove={handleTouch as never}
      >
        <Defs>
          <LinearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={strokeColor} stopOpacity="0.3" />
            <Stop offset="100%" stopColor={strokeColor} stopOpacity="0.01" />
          </LinearGradient>
        </Defs>
        {/* Area fill */}
        <Path d={areaPath} fill="url(#grad)" />
        {/* Line */}
        <Path d={linePath} stroke={strokeColor} strokeWidth={2} fill="none" strokeLinejoin="round" strokeLinecap="round" />
        {/* Tooltip */}
        {tooltip && (
          <>
            <Line x1={tooltip.x} y1={padT} x2={tooltip.x} y2={H - padB} stroke={strokeColor} strokeWidth={1} strokeDasharray="4,3" opacity={0.7} />
            <Circle cx={tooltip.x} cy={tooltip.y} r={5} fill={strokeColor} stroke={colors.card} strokeWidth={2} />
          </>
        )}
      </Svg>

      {/* Time labels */}
      <View style={{ flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 4, marginTop: -8 }}>
        {timeLabels.map((t, i) => (
          <Text key={i} style={{ fontSize: 10, color: colors.mutedForeground, fontFamily: "Inter_400Regular" }}>{t}</Text>
        ))}
      </View>

      {/* Tooltip price bubble */}
      {tooltip && (
        <View style={{ alignItems: "center", marginTop: 6 }}>
          <View style={{ backgroundColor: strokeColor + "22", borderRadius: 8, paddingHorizontal: 12, paddingVertical: 4, borderWidth: 1, borderColor: strokeColor + "44" }}>
            <Text style={{ color: strokeColor, fontSize: 13, fontWeight: "700", fontFamily: "Inter_700Bold" }}>
              ₹{tooltip.price.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

function StatCard({ label, value, color, colors }: { label: string; value: string; color?: string; colors: ReturnType<typeof useColors> }) {
  return (
    <View style={{ flex: 1, backgroundColor: colors.card, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: colors.border }}>
      <Text style={{ fontSize: 10, color: colors.mutedForeground, fontFamily: "Inter_400Regular", letterSpacing: 0.5, textTransform: "uppercase" }}>{label}</Text>
      <Text style={{ fontSize: 15, fontWeight: "700", color: color ?? colors.foreground, fontFamily: "Inter_700Bold", marginTop: 4 }}>{value}</Text>
    </View>
  );
}

export default function StockDetailScreen() {
  const { symbol } = useLocalSearchParams<{ symbol: string }>();
  const router = useRouter();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { openOrderModal } = useTradingContext();

  const { data: stock, isLoading, refetch } = useGetStock(symbol ?? "", {
    query: { refetchInterval: 30000, enabled: !!symbol },
  });

  const s = stock as {
    symbol: string; name: string; exchange: string; sector: string;
    currentPrice: number; previousClose: number; change: number; changePercent: number;
    high: number; low: number; volume: number; marketCap: number;
    priceHistory?: PricePoint[];
  } | undefined;

  const isUp = (s?.changePercent ?? 0) >= 0;
  const gainColor = colors.gain;
  const lossColor = colors.loss;
  const priceColor = isUp ? gainColor : lossColor;
  const topInset = Platform.OS === "web" ? 0 : insets.top;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={{
        paddingTop: topInset + 8,
        paddingHorizontal: 16,
        paddingBottom: 12,
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.background,
        borderBottomWidth: 1,
        borderColor: colors.border,
        gap: 12,
      }}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ width: 38, height: 38, borderRadius: 10, backgroundColor: colors.card, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: colors.border }}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={20} color={colors.foreground} />
        </TouchableOpacity>

        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 18, fontWeight: "700", color: colors.foreground, fontFamily: "Inter_700Bold" }}>{s?.symbol ?? symbol}</Text>
          <Text style={{ fontSize: 12, color: colors.mutedForeground, fontFamily: "Inter_400Regular", marginTop: 1 }} numberOfLines={1}>{s?.name ?? ""}</Text>
        </View>

        <TouchableOpacity
          onPress={() => refetch()}
          style={{ width: 38, height: 38, borderRadius: 10, backgroundColor: colors.card, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: colors.border }}
          activeOpacity={0.7}
        >
          <Ionicons name="refresh" size={18} color={colors.mutedForeground} />
        </TouchableOpacity>
      </View>

      {isLoading && !s ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 12 }}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_400Regular" }}>Loading {symbol}...</Text>
        </View>
      ) : !s ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_400Regular" }}>Stock not found</Text>
        </View>
      ) : (
        <>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 120, paddingHorizontal: 16 }}
          >
            {/* Price block */}
            <View style={{ paddingTop: 20, paddingBottom: 16 }}>
              <Text style={{ fontSize: 38, fontWeight: "700", color: colors.foreground, fontFamily: "Inter_700Bold", letterSpacing: -0.5 }}>
                ₹{s.currentPrice.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Text>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 6 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: priceColor + "18", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 }}>
                  <Ionicons name={isUp ? "trending-up" : "trending-down"} size={14} color={priceColor} />
                  <Text style={{ color: priceColor, fontSize: 14, fontWeight: "700", fontFamily: "Inter_700Bold" }}>
                    {isUp ? "+" : ""}{s.change.toFixed(2)} ({isUp ? "+" : ""}{s.changePercent.toFixed(2)}%)
                  </Text>
                </View>
                <View style={{ backgroundColor: colors.card, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: colors.border }}>
                  <Text style={{ color: colors.mutedForeground, fontSize: 11, fontFamily: "Inter_500Medium", fontWeight: "500" }}>
                    {s.exchange} · {s.sector}
                  </Text>
                </View>
              </View>
            </View>

            {/* Chart */}
            <View style={{ backgroundColor: colors.card, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: colors.border, marginBottom: 16 }}>
              <Text style={{ fontSize: 13, color: colors.mutedForeground, fontFamily: "Inter_500Medium", fontWeight: "500", marginBottom: 12 }}>Today's Chart</Text>
              {s.priceHistory && s.priceHistory.length > 0 ? (
                <PriceChart points={s.priceHistory} isUp={isUp} colors={colors} />
              ) : (
                <View style={{ height: CHART_HEIGHT, alignItems: "center", justifyContent: "center" }}>
                  <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_400Regular" }}>Chart loading...</Text>
                </View>
              )}
            </View>

            {/* Stats Grid */}
            <View style={{ gap: 10 }}>
              <View style={{ flexDirection: "row", gap: 10 }}>
                <StatCard label="Today High" value={formatINR(s.high)} color={gainColor} colors={colors} />
                <StatCard label="Today Low" value={formatINR(s.low)} color={lossColor} colors={colors} />
              </View>
              <View style={{ flexDirection: "row", gap: 10 }}>
                <StatCard label="Prev. Close" value={formatINR(s.previousClose)} colors={colors} />
                <StatCard label="Volume" value={formatVol(s.volume)} colors={colors} />
              </View>
              <View style={{ flexDirection: "row", gap: 10 }}>
                <StatCard label="Market Cap" value={formatINR(s.marketCap)} colors={colors} />
                <StatCard label="Change" value={`${isUp ? "+" : ""}${s.changePercent.toFixed(2)}%`} color={priceColor} colors={colors} />
              </View>
            </View>

            {/* Price range bar */}
            <View style={{ backgroundColor: colors.card, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: colors.border, marginTop: 10 }}>
              <Text style={{ fontSize: 12, color: colors.mutedForeground, fontFamily: "Inter_500Medium", fontWeight: "500", marginBottom: 12 }}>Day Range</Text>
              <View style={{ position: "relative" }}>
                <View style={{ height: 6, backgroundColor: colors.border, borderRadius: 3 }} />
                {(() => {
                  const low = s.low, high = s.high, cur = s.currentPrice;
                  const range = high - low || 1;
                  const pct = Math.max(0, Math.min(1, (cur - low) / range));
                  return (
                    <>
                      <View style={{ position: "absolute", top: 0, left: 0, width: `${pct * 100}%`, height: 6, backgroundColor: priceColor, borderRadius: 3 }} />
                      <View style={{ position: "absolute", top: -3, left: `${pct * 100}%` as unknown as number, width: 12, height: 12, borderRadius: 6, backgroundColor: priceColor, borderWidth: 2, borderColor: colors.card, marginLeft: -6 }} />
                    </>
                  );
                })()}
              </View>
              <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 8 }}>
                <Text style={{ fontSize: 12, color: lossColor, fontFamily: "Inter_600SemiBold", fontWeight: "600" }}>₹{s.low.toFixed(2)}</Text>
                <Text style={{ fontSize: 12, color: colors.mutedForeground, fontFamily: "Inter_400Regular" }}>Current: ₹{s.currentPrice.toFixed(2)}</Text>
                <Text style={{ fontSize: 12, color: gainColor, fontFamily: "Inter_600SemiBold", fontWeight: "600" }}>₹{s.high.toFixed(2)}</Text>
              </View>
            </View>
          </ScrollView>

          {/* Bottom Buy/Sell Bar */}
          <View style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            paddingBottom: Math.max(insets.bottom, 16),
            paddingTop: 12,
            paddingHorizontal: 16,
            backgroundColor: colors.card,
            borderTopWidth: 1,
            borderColor: colors.border,
            flexDirection: "row",
            gap: 12,
          }}>
            <TouchableOpacity
              style={{
                flex: 1,
                height: 52,
                borderRadius: 14,
                backgroundColor: gainColor,
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "row",
                gap: 8,
                shadowColor: gainColor,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 4,
              }}
              activeOpacity={0.85}
              onPress={() => openOrderModal({ symbol: s.symbol, name: s.name, currentPrice: s.currentPrice }, "BUY")}
            >
              <Ionicons name="trending-up" size={18} color="#fff" />
              <Text style={{ color: "#fff", fontSize: 17, fontWeight: "700", fontFamily: "Inter_700Bold" }}>BUY</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                flex: 1,
                height: 52,
                borderRadius: 14,
                backgroundColor: lossColor,
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "row",
                gap: 8,
                shadowColor: lossColor,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 4,
              }}
              activeOpacity={0.85}
              onPress={() => openOrderModal({ symbol: s.symbol, name: s.name, currentPrice: s.currentPrice }, "SELL")}
            >
              <Ionicons name="trending-down" size={18} color="#fff" />
              <Text style={{ color: "#fff", fontSize: 17, fontWeight: "700", fontFamily: "Inter_700Bold" }}>SELL</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}
