import React, { useState, useMemo } from "react";
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity,
  Platform, ActivityIndicator, RefreshControl, Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import {
  useGetPositions, useGetHoldings, useGetPortfolioSummary,
  usePlaceOrder,
  getGetPositionsQueryKey, getGetHoldingsQueryKey,
  getGetPortfolioSummaryQueryKey, getGetWalletQueryKey, getListOrdersQueryKey,
} from "@workspace/api-client-react";
import { useColors } from "@/hooks/useColors";
import { useTradingContext } from "@/context/TradingContext";
import { useLivePrice, useLivePrices } from "@/context/LivePricesContext";
import { FlashingPrice } from "@/components/FlashingPrice";
import * as Haptics from "expo-haptics";

interface Position {
  id: number; symbol: string; stockName: string; quantity: number;
  avgBuyPrice: number; currentPrice: number; pnl: number; pnlPercent: number;
  currentValue: number; investedValue: number; productType: string;
}
interface Holding {
  id: number; symbol: string; stockName: string; quantity: number;
  avgBuyPrice: number; currentPrice: number; pnl: number; pnlPercent: number;
  currentValue: number; investedValue: number; dayChange: number; dayChangePercent: number;
}
interface Summary {
  totalInvested: number; currentValue: number; totalPnl: number;
  totalPnlPercent: number; dayPnl: number; dayPnlPercent: number;
  walletBalance: number; openPositions: number; totalHoldings: number;
}

function formatINR(n: number) {
  return "₹" + n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function formatPct(n: number) {
  return (n >= 0 ? "+" : "") + n.toFixed(2) + "%";
}

function PositionCard({ item, colors }: { item: Position; colors: ReturnType<typeof useColors> }) {
  const live = useLivePrice(item.symbol);
  const ltp = live?.ltp ?? item.currentPrice;
  const currentValue = ltp * item.quantity;
  const pnl = currentValue - item.investedValue;
  const pnlPercent = item.investedValue > 0 ? (pnl / item.investedValue) * 100 : 0;
  const isUp = pnl >= 0;

  const queryClient = useQueryClient();
  const placeOrder = usePlaceOrder();

  const handleExit = () => {
    const pnlSign = pnl >= 0 ? "+" : "";
    Alert.alert(
      "Exit Position",
      `Sell all ${item.quantity} shares of ${item.symbol} at market price?\n\nP&L: ${pnlSign}${formatINR(pnl)} (${formatPct(pnlPercent)})`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Exit Now",
          style: "destructive",
          onPress: () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            placeOrder.mutate({
              data: {
                symbol: item.symbol,
                orderType: "MARKET",
                side: "SELL",
                productType: "INTRADAY",
                quantity: item.quantity,
              },
            }, {
              onSuccess: () => {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                queryClient.invalidateQueries({ queryKey: getGetPositionsQueryKey() });
                queryClient.invalidateQueries({ queryKey: getGetPortfolioSummaryQueryKey() });
                queryClient.invalidateQueries({ queryKey: getGetWalletQueryKey() });
                queryClient.invalidateQueries({ queryKey: getListOrdersQueryKey() });
              },
              onError: (err: unknown) => {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                const msg = err instanceof Error ? err.message : "Exit failed. Try again.";
                Alert.alert("Error", msg);
              },
            });
          },
        },
      ]
    );
  };

  return (
    <View style={{ backgroundColor: colors.card, borderRadius: 14, marginHorizontal: 16, marginBottom: 10, borderWidth: 1, borderColor: colors.border, padding: 16 }}>
      <View style={{ flexDirection: "row" as const, justifyContent: "space-between" as const, alignItems: "flex-start" as const, marginBottom: 12 }}>
        <View style={{ flexDirection: "row" as const, alignItems: "center" as const, gap: 10, flex: 1 }}>
          <View style={{ width: 38, height: 38, borderRadius: 10, backgroundColor: colors.primary + "18", alignItems: "center" as const, justifyContent: "center" as const }}>
            <Text style={{ color: colors.primary, fontSize: 12, fontWeight: "700" as const, fontFamily: "Inter_700Bold" }}>{item.symbol.slice(0, 2)}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 15, fontWeight: "700" as const, color: colors.foreground, fontFamily: "Inter_700Bold" }}>{item.symbol}</Text>
            <Text style={{ fontSize: 11, color: colors.mutedForeground, fontFamily: "Inter_400Regular" }}>{item.productType} · {item.quantity} shares</Text>
          </View>
        </View>
        <View style={{ alignItems: "flex-end" as const }}>
          <Text style={{ fontSize: 15, fontWeight: "700" as const, color: isUp ? colors.gain : colors.loss, fontFamily: "Inter_700Bold" }}>
            {isUp ? "+" : ""}{formatINR(pnl)}
          </Text>
          <View style={{ backgroundColor: isUp ? colors.gainBg : colors.lossBg, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2, marginTop: 2 }}>
            <Text style={{ fontSize: 11, color: isUp ? colors.gain : colors.loss, fontFamily: "Inter_600SemiBold", fontWeight: "600" as const }}>{formatPct(pnlPercent)}</Text>
          </View>
        </View>
      </View>
      <View style={{ flexDirection: "row" as const, gap: 0, marginBottom: 12 }}>
        {[
          { label: "AVG COST", value: formatINR(item.avgBuyPrice) },
          { label: "LTP", value: formatINR(ltp) },
          { label: "INVESTED", value: formatINR(item.investedValue) },
          { label: "VALUE", value: formatINR(currentValue) },
        ].map(({ label, value }, idx) => (
          <View key={label} style={{ flex: 1, borderLeftWidth: idx > 0 ? 1 : 0, borderColor: colors.border, paddingLeft: idx > 0 ? 10 : 0 }}>
            <Text style={{ fontSize: 9, color: colors.mutedForeground, letterSpacing: 0.5, fontFamily: "Inter_400Regular" }}>{label}</Text>
            <Text style={{ fontSize: 12, fontWeight: "600" as const, color: colors.foreground, fontFamily: "Inter_600SemiBold", marginTop: 2 }}>{value}</Text>
          </View>
        ))}
      </View>
      <TouchableOpacity
        style={{ backgroundColor: placeOrder.isPending ? colors.secondary : colors.lossBg, borderRadius: 8, paddingVertical: 9, alignItems: "center" as const, borderWidth: 1, borderColor: colors.loss + "30" }}
        onPress={handleExit}
        disabled={placeOrder.isPending}
        activeOpacity={0.7}
      >
        {placeOrder.isPending
          ? <ActivityIndicator size="small" color={colors.loss} />
          : <Text style={{ color: colors.loss, fontSize: 13, fontWeight: "700" as const, fontFamily: "Inter_700Bold" }}>Exit Position</Text>
        }
      </TouchableOpacity>
    </View>
  );
}

function HoldingCard({ item, colors, onSell }: { item: Holding; colors: ReturnType<typeof useColors>; onSell: () => void }) {
  const live = useLivePrice(item.symbol);
  const ltp = live?.ltp ?? item.currentPrice;
  const currentValue = ltp * item.quantity;
  const pnl = currentValue - item.investedValue;
  const pnlPercent = item.investedValue > 0 ? (pnl / item.investedValue) * 100 : 0;
  const dayChangePct = live?.changePercent ?? item.dayChangePercent;
  const isUp = pnl >= 0;
  return (
    <View style={{ backgroundColor: colors.card, borderRadius: 14, marginHorizontal: 16, marginBottom: 10, borderWidth: 1, borderColor: colors.border, padding: 16 }}>
      <View style={{ flexDirection: "row" as const, justifyContent: "space-between" as const, alignItems: "flex-start" as const, marginBottom: 12 }}>
        <View style={{ flexDirection: "row" as const, alignItems: "center" as const, gap: 10, flex: 1 }}>
          <View style={{ width: 38, height: 38, borderRadius: 10, backgroundColor: colors.primary + "18", alignItems: "center" as const, justifyContent: "center" as const }}>
            <Text style={{ color: colors.primary, fontSize: 12, fontWeight: "700" as const, fontFamily: "Inter_700Bold" }}>{item.symbol.slice(0, 2)}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 15, fontWeight: "700" as const, color: colors.foreground, fontFamily: "Inter_700Bold" }}>{item.symbol}</Text>
            <Text style={{ fontSize: 11, color: colors.mutedForeground, fontFamily: "Inter_400Regular" }} numberOfLines={1}>{item.stockName}</Text>
          </View>
        </View>
        <View style={{ alignItems: "flex-end" as const }}>
          <Text style={{ fontSize: 15, fontWeight: "700" as const, color: isUp ? colors.gain : colors.loss, fontFamily: "Inter_700Bold" }}>
            {isUp ? "+" : ""}{formatINR(pnl)}
          </Text>
          <Text style={{ fontSize: 11, color: colors.mutedForeground, fontFamily: "Inter_400Regular", marginTop: 2 }}>
            Day: <Text style={{ color: dayChangePct >= 0 ? colors.gain : colors.loss }}>{formatPct(dayChangePct)}</Text>
          </Text>
        </View>
      </View>
      <View style={{ flexDirection: "row" as const, gap: 0, marginBottom: 12 }}>
        {[
          { label: "AVG COST", value: formatINR(item.avgBuyPrice) },
          { label: "LTP", value: formatINR(ltp) },
          { label: "QTY", value: String(item.quantity) },
          { label: "RETURN", value: formatPct(pnlPercent) },
        ].map(({ label, value }, idx) => (
          <View key={label} style={{ flex: 1, borderLeftWidth: idx > 0 ? 1 : 0, borderColor: colors.border, paddingLeft: idx > 0 ? 10 : 0 }}>
            <Text style={{ fontSize: 9, color: colors.mutedForeground, letterSpacing: 0.5, fontFamily: "Inter_400Regular" }}>{label}</Text>
            <Text style={{ fontSize: 12, fontWeight: "600" as const, color: label === "RETURN" ? (isUp ? colors.gain : colors.loss) : colors.foreground, fontFamily: "Inter_600SemiBold", marginTop: 2 }}>{value}</Text>
          </View>
        ))}
      </View>
      <TouchableOpacity style={{ backgroundColor: colors.lossBg, borderRadius: 8, paddingVertical: 9, alignItems: "center" as const, borderWidth: 1, borderColor: colors.loss + "30" }} onPress={onSell} activeOpacity={0.7}>
        <Text style={{ color: colors.loss, fontSize: 13, fontWeight: "700" as const, fontFamily: "Inter_700Bold" }}>Sell</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function PortfolioScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<"positions" | "holdings">("positions");
  const { openOrderModal } = useTradingContext();
  const topInset = Platform.OS === "web" ? 67 : insets.top;

  const { prices } = useLivePrices();
  const { data: positions, isLoading: posLoading, refetch: refetchPos } = useGetPositions();
  const { data: holdings, isLoading: holdLoading, refetch: refetchHold } = useGetHoldings();
  const { data: summary } = useGetPortfolioSummary();

  const positionList: Position[] = Array.isArray(positions) ? positions : [];
  const holdingList: Holding[] = Array.isArray(holdings) ? holdings : [];
  const s = summary as Summary | undefined;

  const liveStats = useMemo(() => {
    const totalInvested = s?.totalInvested ?? 0;
    let liveCurrentValue = 0;
    let liveDayPnl = 0;
    let hasLive = false;
    for (const pos of positionList) {
      const ltp = prices[pos.symbol]?.ltp ?? 0;
      if (ltp > 0) {
        liveCurrentValue += ltp * pos.quantity;
        liveDayPnl += (ltp - pos.avgBuyPrice) * pos.quantity;
        hasLive = true;
      } else {
        liveCurrentValue += pos.investedValue;
      }
    }
    for (const h of holdingList) {
      const tick = prices[h.symbol];
      const ltp = tick?.ltp ?? 0;
      if (ltp > 0) {
        liveCurrentValue += ltp * h.quantity;
        const prevClose = tick.close > 0 ? tick.close : h.avgBuyPrice;
        liveDayPnl += (ltp - prevClose) * h.quantity;
        hasLive = true;
      } else {
        liveCurrentValue += h.investedValue;
      }
    }
    const hasData = positionList.length > 0 || holdingList.length > 0;
    const currentValue = hasData ? liveCurrentValue : (s?.currentValue ?? 0);
    const totalPnl = hasData ? currentValue - totalInvested : (s?.totalPnl ?? 0);
    const dayPnl = hasData && hasLive ? liveDayPnl : (s?.dayPnl ?? 0);
    return { totalInvested, currentValue, totalPnl, dayPnl };
  }, [prices, positionList, holdingList, s]);

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: { paddingTop: topInset + 12, paddingHorizontal: 20, paddingBottom: 12 },
    title: { fontSize: 22, fontWeight: "700" as const, color: colors.foreground, fontFamily: "Inter_700Bold" },
    summaryCard: { marginHorizontal: 16, marginBottom: 14, backgroundColor: colors.card, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: colors.border },
    summaryRow: { flexDirection: "row" as const, gap: 10 },
    summaryBox: { flex: 1, backgroundColor: colors.secondary, borderRadius: 12, paddingVertical: 20, paddingHorizontal: 16, borderWidth: 1, borderColor: colors.border, alignItems: "center" as const },
    summaryLabel: { fontSize: 11, color: colors.mutedForeground, letterSpacing: 1, fontFamily: "Inter_400Regular", textAlign: "center" as const },
    summaryValue: { fontSize: 28, fontWeight: "700" as const, fontFamily: "Inter_700Bold", marginTop: 6, textAlign: "center" as const },
    tabRow: { flexDirection: "row" as const, marginHorizontal: 16, marginBottom: 14, backgroundColor: colors.secondary, borderRadius: 12, padding: 4, borderWidth: 1, borderColor: colors.border },
    tabBtn: { flex: 1, paddingVertical: 10, borderRadius: 9, alignItems: "center" as const },
    tabText: { fontSize: 14, fontWeight: "600" as const, fontFamily: "Inter_600SemiBold" },
    emptyContainer: { padding: 40, alignItems: "center" as const, gap: 8 },
    emptyText: { fontSize: 15, color: colors.foreground, fontFamily: "Inter_600SemiBold", fontWeight: "600" as const },
    emptySubText: { fontSize: 13, color: colors.mutedForeground, fontFamily: "Inter_400Regular", textAlign: "center" as const },
  });

  const isLoading = tab === "positions" ? posLoading : holdLoading;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Portfolio</Text>
      </View>

      {/* Summary — live-recalculated from WebSocket prices */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <View style={[styles.summaryBox, { flex: 1 }]}>
            <Text style={styles.summaryLabel}>P&L</Text>
            <FlashingPrice
              value={liveStats.totalPnl}
              format={(v) => (v >= 0 ? "+" : "-") + "₹" + Math.abs(Math.round(v)).toLocaleString("en-IN")}
              style={[styles.summaryValue, { color: liveStats.totalPnl >= 0 ? colors.gain : colors.loss }] as any}
            />
          </View>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabRow}>
        {(["positions", "holdings"] as const).map((t) => (
          <TouchableOpacity
            key={t}
            style={[styles.tabBtn, { backgroundColor: tab === t ? colors.primary : "transparent" }]}
            onPress={() => { setTab(t); Haptics.selectionAsync(); }}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, { color: tab === t ? "#fff" : colors.mutedForeground }]}>
              {t === "positions" ? `Positions (${positionList.length})` : `Holdings (${holdingList.length})`}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {isLoading ? (
        <View style={styles.emptyContainer}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : tab === "positions" ? (
        <FlatList
          data={positionList}
          extraData={prices}
          keyExtractor={(item) => String(item.id)}
          scrollEnabled={positionList.length > 0}
          contentContainerStyle={{ paddingBottom: Platform.OS === "web" ? 100 : 100 }}
          refreshControl={<RefreshControl refreshing={posLoading} onRefresh={refetchPos} tintColor={colors.primary} />}
          renderItem={({ item }) => (
            <PositionCard
              item={item}
              colors={colors}
            />
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="stats-chart-outline" size={48} color={colors.mutedForeground} />
              <Text style={styles.emptyText}>No open positions</Text>
              <Text style={styles.emptySubText}>Place intraday trades to see them here</Text>
            </View>
          }
        />
      ) : (
        <FlatList
          data={holdingList}
          extraData={prices}
          keyExtractor={(item) => String(item.id)}
          scrollEnabled={holdingList.length > 0}
          contentContainerStyle={{ paddingBottom: Platform.OS === "web" ? 100 : 100 }}
          refreshControl={<RefreshControl refreshing={holdLoading} onRefresh={refetchHold} tintColor={colors.primary} />}
          renderItem={({ item }) => (
            <HoldingCard
              item={item}
              colors={colors}
              onSell={() => openOrderModal({ symbol: item.symbol, name: item.stockName, currentPrice: item.currentPrice }, "SELL")}
            />
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="briefcase-outline" size={48} color={colors.mutedForeground} />
              <Text style={styles.emptyText}>No holdings</Text>
              <Text style={styles.emptySubText}>Buy delivery trades to build your portfolio</Text>
            </View>
          }
        />
      )}
    </View>
  );
}
