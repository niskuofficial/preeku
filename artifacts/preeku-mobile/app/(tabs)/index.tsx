import React, { useMemo, useState, useEffect, useCallback, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  RefreshControl, Platform, Image,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useGetPortfolioSummary, useGetMarketHeatmap, useGetPositions, useGetHoldings } from "@workspace/api-client-react";
import { useColors } from "@/hooks/useColors";
import { useTradingContext } from "@/context/TradingContext";
import { FlashingPrice } from "@/components/FlashingPrice";
import { useLivePrice, useLivePrices } from "@/context/LivePricesContext";
import { useMobileWatchlist } from "@/hooks/useMobileWatchlist";
import { useMobileRecentSearches } from "@/hooks/useMobileRecentSearches";

function formatINR(n: number) {
  if (Math.abs(n) >= 1e7) return "₹" + (n / 1e7).toFixed(2) + "Cr";
  if (Math.abs(n) >= 1e5) return "₹" + (n / 1e5).toFixed(2) + "L";
  return "₹" + n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function formatPct(n: number | null | undefined) {
  if (n == null || !isFinite(n) || isNaN(n)) return "+0.00%";
  return (n >= 0 ? "+" : "") + n.toFixed(2) + "%";
}

interface HeatmapSector {
  sector: string; changePercent: number;
  stocks: { symbol: string; name: string; changePercent: number; marketCap: number }[];
}
interface Summary {
  walletBalance: number; currentValue: number; totalPnl: number;
  totalPnlPercent: number; dayPnl: number; dayPnlPercent: number;
  totalInvested: number; openPositions: number; totalHoldings: number;
}
interface PortfolioHolding {
  symbol: string; quantity: number; avgBuyPrice: number;
  investedValue: number; dayChangePercent: number;
}
interface PortfolioPosition {
  symbol: string; quantity: number; avgBuyPrice: number; investedValue: number;
}

function WatchlistRow({ symbol, name, colors, onPress }: {
  symbol: string; name: string;
  colors: ReturnType<typeof useColors>; onPress: () => void;
}) {
  const live = useLivePrice(symbol);
  const price = live?.ltp ?? 0;
  const changePct = live?.changePercent ?? 0;
  return (
    <TouchableOpacity
      style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 14 }}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12, flex: 1 }}>
        <View style={{ width: 38, height: 38, borderRadius: 10, backgroundColor: colors.primary + "18", alignItems: "center", justifyContent: "center" }}>
          <Text style={{ color: colors.primary, fontSize: 12, fontWeight: "700", fontFamily: "Inter_700Bold" }}>{symbol.slice(0, 2)}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 15, fontWeight: "700", color: colors.foreground, fontFamily: "Inter_700Bold" }}>{symbol}</Text>
          <Text style={{ fontSize: 12, color: colors.mutedForeground, fontFamily: "Inter_400Regular", marginTop: 2 }} numberOfLines={1}>{name}</Text>
        </View>
      </View>
      <View style={{ alignItems: "flex-end" }}>
        {price > 0 ? (
          <>
            <FlashingPrice value={price} symbol={symbol} style={{ fontSize: 15, fontWeight: "600", color: colors.foreground, fontFamily: "Inter_600SemiBold", textAlign: "right" }} />
            <Text style={{ fontSize: 12, fontFamily: "Inter_400Regular", textAlign: "right", marginTop: 2, color: changePct >= 0 ? colors.gain : colors.loss }}>
              {formatPct(changePct)}
            </Text>
          </>
        ) : (
          <Text style={{ color: colors.mutedForeground, fontSize: 13, fontFamily: "Inter_400Regular" }}>—</Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

function RecentRow({ symbol, name, exchange, colors, onPress, onBuy, onSell }: {
  symbol: string; name: string; exchange: string;
  colors: ReturnType<typeof useColors>;
  onPress: () => void; onBuy: () => void; onSell: () => void;
}) {
  const live = useLivePrice(symbol);
  const price = live?.ltp ?? 0;
  const changePct = live?.changePercent ?? 0;
  const isUp = changePct >= 0;
  return (
    <TouchableOpacity
      style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingVertical: 12 }}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={{ width: 36, height: 36, borderRadius: 9, backgroundColor: colors.secondary, alignItems: "center", justifyContent: "center", marginRight: 10 }}>
        <Text style={{ color: colors.mutedForeground, fontSize: 11, fontWeight: "700", fontFamily: "Inter_700Bold" }}>{symbol.slice(0, 2)}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <Text style={{ fontSize: 14, fontWeight: "700", color: colors.foreground, fontFamily: "Inter_700Bold" }}>{symbol}</Text>
          <View style={{ backgroundColor: colors.secondary, borderRadius: 4, paddingHorizontal: 5, paddingVertical: 1 }}>
            <Text style={{ fontSize: 9, color: colors.mutedForeground, fontFamily: "Inter_500Medium", fontWeight: "500" }}>{exchange}</Text>
          </View>
        </View>
        <Text style={{ fontSize: 11, color: colors.mutedForeground, fontFamily: "Inter_400Regular", marginTop: 1 }} numberOfLines={1}>{name}</Text>
      </View>
      <View style={{ alignItems: "flex-end", marginRight: 10 }}>
        {price > 0 ? (
          <>
            <Text style={{ fontSize: 14, fontWeight: "600", color: colors.foreground, fontFamily: "Inter_600SemiBold" }}>
              ₹{price.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 2, marginTop: 2 }}>
              <Ionicons name={isUp ? "caret-up" : "caret-down"} size={9} color={isUp ? colors.gain : colors.loss} />
              <Text style={{ fontSize: 11, color: isUp ? colors.gain : colors.loss, fontFamily: "Inter_500Medium", fontWeight: "500" }}>
                {Math.abs(changePct).toFixed(2)}%
              </Text>
            </View>
          </>
        ) : (
          <Text style={{ color: colors.mutedForeground, fontSize: 12, fontFamily: "Inter_400Regular" }}>—</Text>
        )}
      </View>
      <View style={{ gap: 4 }}>
        <TouchableOpacity
          style={{ backgroundColor: colors.gainBg, borderRadius: 5, paddingHorizontal: 8, paddingVertical: 4, borderWidth: 1, borderColor: colors.gain + "40" }}
          onPress={(e) => { e.stopPropagation?.(); onBuy(); }}
          activeOpacity={0.7}
        >
          <Text style={{ color: colors.gain, fontSize: 10, fontWeight: "700", fontFamily: "Inter_700Bold" }}>BUY</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{ backgroundColor: colors.lossBg, borderRadius: 5, paddingHorizontal: 8, paddingVertical: 4, borderWidth: 1, borderColor: colors.loss + "40" }}
          onPress={(e) => { e.stopPropagation?.(); onSell(); }}
          activeOpacity={0.7}
        >
          <Text style={{ color: colors.loss, fontSize: 10, fontWeight: "700", fontFamily: "Inter_700Bold" }}>SELL</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

function HeatBlock({
  symbol, changePercent, ltp, onPress,
}: {
  symbol: string; changePercent: number; ltp: number;
  onPress: () => void;
}) {
  const getBg = (pct: number) => {
    if (pct >= 3)  return { bg: "rgba(22,163,74,0.90)",  border: "rgba(74,222,128,0.45)", text: "#fff",    badge: "rgba(255,255,255,0.22)" };
    if (pct >= 1)  return { bg: "rgba(21,128,61,0.80)",  border: "rgba(74,222,128,0.30)", text: "#bbf7d0", badge: "rgba(255,255,255,0.16)" };
    if (pct > 0)   return { bg: "rgba(20,83,45,0.75)",   border: "rgba(74,222,128,0.20)", text: "#86efac", badge: "rgba(255,255,255,0.13)" };
    if (pct > -1)  return { bg: "rgba(127,29,29,0.75)",  border: "rgba(248,113,113,0.20)", text: "#fca5a5", badge: "rgba(255,255,255,0.13)" };
    if (pct > -3)  return { bg: "rgba(153,27,27,0.82)",  border: "rgba(248,113,113,0.30)", text: "#fecaca", badge: "rgba(255,255,255,0.16)" };
    return              { bg: "rgba(220,38,38,0.90)",  border: "rgba(248,113,113,0.45)", text: "#fff",    badge: "rgba(255,255,255,0.22)" };
  };
  const c = getBg(changePercent);
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      style={{
        flex: 1,
        minWidth: 72,
        backgroundColor: c.bg,
        borderWidth: 1,
        borderColor: c.border,
        borderRadius: 10,
        padding: 10,
        alignItems: "flex-start",
        minHeight: 72,
      }}
    >
      <Text style={{ color: c.text, fontSize: 12, fontWeight: "700", fontFamily: "Inter_700Bold" }} numberOfLines={1}>
        {symbol}
      </Text>
      {ltp > 0 && (
        <Text style={{ color: c.text, fontSize: 11, fontFamily: "Inter_400Regular", opacity: 0.75, marginTop: 2 }} numberOfLines={1}>
          ₹{ltp.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
        </Text>
      )}
      <View style={{ marginTop: 4, backgroundColor: c.badge, borderRadius: 4, paddingHorizontal: 5, paddingVertical: 2, alignSelf: "flex-start" }}>
        <Text style={{ color: c.text, fontSize: 10, fontWeight: "700", fontFamily: "Inter_700Bold" }}>
          {changePercent >= 0 ? "+" : ""}{changePercent.toFixed(2)}%
        </Text>
      </View>
    </TouchableOpacity>
  );
}

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { openOrderModal } = useTradingContext();
  const { data: summary, refetch: refetchSummary, isLoading } = useGetPortfolioSummary({ query: { refetchInterval: 30000 } });
  const { data: heatmap } = useGetMarketHeatmap({ query: { refetchInterval: 60000 } });
  const { data: positions } = useGetPositions();
  const { data: holdings } = useGetHoldings();
  const { prices } = useLivePrices();

  const { items: watchlistItems } = useMobileWatchlist();
  const { recents, removeRecent, clearAll: clearRecents } = useMobileRecentSearches();

  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [profileName, setProfileName] = useState("Trader");
  const navigation = useNavigation();

  const reloadProfile = useCallback(() => {
    AsyncStorage.getItem("preeku_avatar").then((v) => setAvatarUri(v ?? null));
    AsyncStorage.getItem("preeku_name").then((v) => { if (v) setProfileName(v); });
  }, []);

  useEffect(() => {
    reloadProfile();
    const unsub = navigation.addListener("focus", reloadProfile);
    return unsub;
  }, [navigation, reloadProfile]);

  const domain = process.env.EXPO_PUBLIC_DOMAIN;
  const apiBase = domain ? `https://${domain}` : "http://localhost:8080";
  const { data: indicesData } = useQuery<Array<{ name: string; value: number; change: number; changePercent: number }>>({
    queryKey: ["market-indices"],
    queryFn: () => fetch(`${apiBase}/api/market/indices`).then((r) => r.json()),
    refetchInterval: 30000,
    staleTime: 15000,
  });

  const [moversTab, setMoversTab] = useState<"gainers" | "losers">("gainers");

  const s = summary as Summary | undefined;
  const heatmapData: HeatmapSector[] = Array.isArray(heatmap) ? heatmap : [];
  const positionList: PortfolioPosition[] = Array.isArray(positions) ? positions : [];
  const holdingList: PortfolioHolding[] = Array.isArray(holdings) ? holdings : [];

  const allMovers = heatmapData.flatMap((sec) =>
    sec.stocks.map((st) => ({
      symbol: st.symbol, name: st.name, sector: sec.sector,
      ltp: prices[st.symbol]?.ltp ?? 0,
      chgPct: prices[st.symbol]?.changePercent ?? st.changePercent,
    }))
  );
  const topGainers = [...allMovers].filter((s) => s.chgPct > 0).sort((a, b) => b.chgPct - a.chgPct).slice(0, 6);
  const topLosers = [...allMovers].filter((s) => s.chgPct < 0).sort((a, b) => a.chgPct - b.chgPct).slice(0, 6);

  const liveStats = useMemo(() => {
    const totalInvested = s?.totalInvested ?? 0;
    const walletBalance = s?.walletBalance ?? 1000000;
    let liveCurrentValue = 0, liveDayPnl = 0, hasLivePrices = false;
    for (const pos of positionList) {
      const ltp = prices[pos.symbol]?.ltp ?? 0;
      if (ltp > 0) { liveCurrentValue += ltp * pos.quantity; liveDayPnl += (ltp - pos.avgBuyPrice) * pos.quantity; hasLivePrices = true; }
      else liveCurrentValue += pos.investedValue;
    }
    for (const h of holdingList) {
      const tick = prices[h.symbol];
      const ltp = tick?.ltp ?? 0;
      if (ltp > 0) { liveCurrentValue += ltp * h.quantity; const prevClose = tick.close > 0 ? tick.close : h.avgBuyPrice; liveDayPnl += (ltp - prevClose) * h.quantity; hasLivePrices = true; }
      else liveCurrentValue += h.investedValue;
    }
    const hasPositions = positionList.length > 0 || holdingList.length > 0;
    const currentValue = hasPositions ? liveCurrentValue : (s?.currentValue ?? 0);
    const totalPnl = hasPositions ? currentValue - totalInvested : (s?.totalPnl ?? 0);
    const totalPnlPercent = totalInvested > 0 ? (totalPnl / totalInvested) * 100 : 0;
    const dayPnl = hasPositions && hasLivePrices ? liveDayPnl : (s?.dayPnl ?? 0);
    return { currentValue, totalPnl, totalPnlPercent, dayPnl, totalInvested, walletBalance };
  }, [prices, positionList, holdingList, s]);

  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const onRefresh = async () => { await refetchSummary(); };

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: { paddingTop: topInset + 12, paddingHorizontal: 20, paddingBottom: 16, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
    portfolioCard: { marginHorizontal: 16, marginBottom: 16, backgroundColor: colors.card, borderRadius: 16, padding: 20, borderWidth: 1, borderColor: colors.border },
    portfolioLabel: { fontSize: 11, color: colors.mutedForeground, letterSpacing: 1, fontFamily: "Inter_500Medium", fontWeight: "500" },
    portfolioValue: { fontSize: 36, fontWeight: "700", color: colors.foreground, fontFamily: "Inter_700Bold", marginTop: 4 },
    pnlRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 6 },
    pnlChip: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
    section: { marginHorizontal: 16, marginBottom: 16 },
    sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
    sectionTitle: { fontSize: 16, fontWeight: "700", color: colors.foreground, fontFamily: "Inter_700Bold" },
    card: { backgroundColor: colors.card, borderRadius: 14, borderWidth: 1, borderColor: colors.border, overflow: "hidden" },
    separator: { height: 1, backgroundColor: colors.border, marginHorizontal: 16 },
    emptyText: { color: colors.mutedForeground, textAlign: "center", paddingVertical: 20, fontFamily: "Inter_400Regular", fontSize: 13 },
    moversCard: { backgroundColor: colors.card, borderRadius: 14, borderWidth: 1, borderColor: colors.border, overflow: "hidden" },
    moversTabs: { flexDirection: "row", borderBottomWidth: 1, borderColor: colors.border },
    moversTab: { flex: 1, paddingVertical: 12, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6 },
    moverRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderColor: colors.border + "60" },
    moverRank: { fontSize: 11, fontWeight: "700", fontFamily: "Inter_700Bold", color: colors.mutedForeground, width: 20 },
    moverSymbol: { fontSize: 14, fontWeight: "700", fontFamily: "Inter_700Bold", color: colors.foreground },
    moverSector: { fontSize: 11, fontFamily: "Inter_400Regular", color: colors.mutedForeground, marginTop: 1 },
    moverPrice: { fontSize: 14, fontWeight: "600", fontFamily: "Inter_600SemiBold", color: colors.foreground, textAlign: "right" },
    moverChgChip: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, marginTop: 3, alignSelf: "flex-end" },
    moverChgText: { fontSize: 12, fontWeight: "700", fontFamily: "Inter_700Bold" },
    heatRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
    heatSector: { marginBottom: 12 },
    heatSectorLabel: { fontSize: 12, color: colors.mutedForeground, fontFamily: "Inter_500Medium", fontWeight: "500", marginBottom: 6 },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image source={require("@/assets/images/icon.png")} style={{ width: 36, height: 36, borderRadius: 8 }} resizeMode="contain" />
        <View style={{ flex: 1, marginHorizontal: 12 }}>
          <Text style={{ fontSize: 15, color: colors.mutedForeground, fontFamily: "Inter_400Regular" }}>
            Hello, <Text style={{ color: colors.foreground, fontFamily: "Inter_700Bold", fontWeight: "700" }}>{profileName.split(" ")[0]}</Text> 👋
          </Text>
        </View>
        <TouchableOpacity onPress={() => router.push("/(tabs)/profile")} activeOpacity={0.75} style={{ width: 36, height: 36, borderRadius: 18, overflow: "hidden", borderWidth: 2, borderColor: colors.primary + "50" }}>
          {avatarUri ? (
            <Image source={{ uri: avatarUri }} style={{ width: 36, height: 36 }} />
          ) : (
            <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: colors.primary + "25", alignItems: "center", justifyContent: "center" }}>
              <Text style={{ color: colors.primary, fontSize: 13, fontWeight: "700", fontFamily: "Inter_700Bold" }}>
                {profileName.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase()}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        {/* Market Indices */}
        <View style={{ flexDirection: "row", marginHorizontal: 16, marginBottom: 12, gap: 10 }}>
          {(indicesData && indicesData.length > 0 ? indicesData : [
            { name: "NIFTY 50", value: 0, change: 0, changePercent: 0 },
            { name: "SENSEX", value: 0, change: 0, changePercent: 0 },
          ]).map((idx) => {
            const up = idx.changePercent >= 0;
            const clr = idx.value === 0 ? colors.mutedForeground : up ? colors.gain : colors.loss;
            return (
              <View key={idx.name} style={{ flex: 1, backgroundColor: colors.card, borderRadius: 14, padding: 12, borderWidth: 1, borderColor: clr + "30" }}>
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                  <Text style={{ fontSize: 11, fontWeight: "700", color: colors.mutedForeground, fontFamily: "Inter_700Bold", letterSpacing: 0.5 }}>{idx.name}</Text>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 2, backgroundColor: clr + "15", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 }}>
                    <Ionicons name={up ? "trending-up" : "trending-down"} size={10} color={clr} />
                    <Text style={{ fontSize: 10, color: clr, fontFamily: "Inter_600SemiBold", fontWeight: "600" }}>
                      {idx.value === 0 ? "—" : `${up ? "+" : ""}${idx.changePercent.toFixed(2)}%`}
                    </Text>
                  </View>
                </View>
                <Text style={{ fontSize: 18, fontWeight: "700", color: colors.foreground, fontFamily: "Inter_700Bold" }}>
                  {idx.value === 0 ? "—" : idx.value.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                </Text>
                <Text style={{ fontSize: 11, color: clr, fontFamily: "Inter_400Regular", marginTop: 2 }}>
                  {idx.value === 0 ? "Loading..." : `${up ? "+" : ""}${idx.change.toFixed(2)} pts`}
                </Text>
              </View>
            );
          })}
        </View>

        {/* Portfolio Card */}
        <View style={styles.portfolioCard}>
          <Text style={styles.portfolioLabel}>PORTFOLIO VALUE</Text>
          <FlashingPrice
            value={liveStats.currentValue}
            format={(v) => "₹" + Math.round(v).toLocaleString("en-IN")}
            style={styles.portfolioValue}
          />
          <View style={styles.pnlRow}>
            <View style={[styles.pnlChip, { backgroundColor: liveStats.totalPnl >= 0 ? colors.gainBg : colors.lossBg }]}>
              <Ionicons name={liveStats.totalPnl >= 0 ? "trending-up" : "trending-down"} size={14} color={liveStats.totalPnl >= 0 ? colors.gain : colors.loss} />
              <FlashingPrice
                value={liveStats.totalPnl}
                format={(v) => `${formatINR(v)} (${formatPct(liveStats.totalPnlPercent)})`}
                style={{ color: liveStats.totalPnl >= 0 ? colors.gain : colors.loss, fontSize: 13, fontFamily: "Inter_600SemiBold", fontWeight: "600" }}
              />
            </View>
            <Text style={{ color: colors.mutedForeground, fontSize: 11, fontFamily: "Inter_400Regular" }}>Total P&L</Text>
          </View>
        </View>

        {/* ── Recent Searches ── */}
        {recents.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <Ionicons name="time-outline" size={15} color={colors.mutedForeground} />
                <Text style={styles.sectionTitle}>Recent Searches</Text>
              </View>
              <TouchableOpacity onPress={clearRecents} activeOpacity={0.7}>
                <Text style={{ fontSize: 12, color: colors.mutedForeground, fontFamily: "Inter_400Regular" }}>Clear all</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.card}>
              {recents.map((stock, idx) => (
                <React.Fragment key={stock.symbol}>
                  <RecentRow
                    symbol={stock.symbol}
                    name={stock.name}
                    exchange={stock.exchange}
                    colors={colors}
                    onPress={() => router.push(`/stock/${stock.symbol}`)}
                    onBuy={() => openOrderModal({ symbol: stock.symbol, name: stock.name, currentPrice: prices[stock.symbol]?.ltp ?? 0 }, "BUY")}
                    onSell={() => openOrderModal({ symbol: stock.symbol, name: stock.name, currentPrice: prices[stock.symbol]?.ltp ?? 0 }, "SELL")}
                  />
                  {idx < recents.length - 1 && <View style={styles.separator} />}
                </React.Fragment>
              ))}
            </View>
          </View>
        )}

        {/* ── Watchlist ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Watchlist</Text>
            <TouchableOpacity onPress={() => router.push("/(tabs)/markets")} activeOpacity={0.7}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                <Ionicons name="add" size={15} color={colors.primary} />
                <Text style={{ fontSize: 12, color: colors.primary, fontFamily: "Inter_500Medium", fontWeight: "500" }}>Add Stocks</Text>
              </View>
            </TouchableOpacity>
          </View>
          {watchlistItems.length === 0 ? (
            <View style={[styles.card, { paddingVertical: 10 }]}>
              <Text style={styles.emptyText}>No stocks in watchlist</Text>
              <TouchableOpacity
                onPress={() => router.push("/(tabs)/markets")}
                activeOpacity={0.7}
                style={{ alignSelf: "center", marginBottom: 14, flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: colors.primary + "18", borderRadius: 10, paddingHorizontal: 16, paddingVertical: 8, borderWidth: 1, borderColor: colors.primary + "40" }}
              >
                <Ionicons name="bookmark-outline" size={14} color={colors.primary} />
                <Text style={{ color: colors.primary, fontSize: 13, fontFamily: "Inter_600SemiBold", fontWeight: "600" }}>Browse Markets</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.card}>
              {watchlistItems.map((item, idx) => (
                <React.Fragment key={item.symbol}>
                  <WatchlistRow
                    symbol={item.symbol}
                    name={item.name}
                    colors={colors}
                    onPress={() => router.push(`/stock/${item.symbol}`)}
                  />
                  {idx < watchlistItems.length - 1 && <View style={styles.separator} />}
                </React.Fragment>
              ))}
            </View>
          )}
        </View>

        {/* Top Movers */}
        {heatmapData.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Top Movers</Text>
            </View>
            <View style={styles.moversCard}>
              <View style={styles.moversTabs}>
                <TouchableOpacity
                  style={[styles.moversTab, { borderBottomWidth: 2, borderBottomColor: moversTab === "gainers" ? "#22c55e" : "transparent", backgroundColor: moversTab === "gainers" ? "rgba(34,197,94,0.06)" : "transparent" }]}
                  onPress={() => setMoversTab("gainers")} activeOpacity={0.7}
                >
                  <Ionicons name="trending-up" size={14} color={moversTab === "gainers" ? "#4ade80" : colors.mutedForeground} />
                  <Text style={{ fontSize: 13, fontWeight: "700", fontFamily: "Inter_700Bold", color: moversTab === "gainers" ? "#4ade80" : colors.mutedForeground }}>Top Gainers</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.moversTab, { borderBottomWidth: 2, borderBottomColor: moversTab === "losers" ? "#ef4444" : "transparent", backgroundColor: moversTab === "losers" ? "rgba(239,68,68,0.06)" : "transparent" }]}
                  onPress={() => setMoversTab("losers")} activeOpacity={0.7}
                >
                  <Ionicons name="trending-down" size={14} color={moversTab === "losers" ? "#f87171" : colors.mutedForeground} />
                  <Text style={{ fontSize: 13, fontWeight: "700", fontFamily: "Inter_700Bold", color: moversTab === "losers" ? "#f87171" : colors.mutedForeground }}>Top Losers</Text>
                </TouchableOpacity>
              </View>
              {(moversTab === "gainers" ? topGainers : topLosers).map((stock, idx) => {
                const isGainer = moversTab === "gainers";
                const color = isGainer ? "#4ade80" : "#f87171";
                const bgColor = isGainer ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.12)";
                return (
                  <View key={stock.symbol} style={[styles.moverRow, idx === (moversTab === "gainers" ? topGainers : topLosers).length - 1 && { borderBottomWidth: 0 }]}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 10, flex: 1 }}>
                      <Text style={styles.moverRank}>#{idx + 1}</Text>
                      <View>
                        <Text style={styles.moverSymbol}>{stock.symbol}</Text>
                        <Text style={styles.moverSector}>{stock.sector}</Text>
                      </View>
                    </View>
                    <View style={{ alignItems: "flex-end" }}>
                      <Text style={styles.moverPrice}>{stock.ltp > 0 ? `₹${stock.ltp.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "—"}</Text>
                      <View style={[styles.moverChgChip, { backgroundColor: bgColor }]}>
                        <Text style={[styles.moverChgText, { color }]}>{stock.chgPct >= 0 ? "+" : ""}{stock.chgPct.toFixed(2)}%</Text>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Heatmap */}
        {heatmapData.length > 0 && (
          <View style={[styles.section, { paddingHorizontal: 16, paddingBottom: 16 }]}>
            {/* Header */}
            <View style={[styles.sectionHeader, { marginBottom: 2 }]}>
              <Text style={styles.sectionTitle}>Market Heatmap</Text>
            </View>
            <Text style={{ fontSize: 11, color: colors.mutedForeground, fontFamily: "Inter_400Regular", marginBottom: 14 }}>
              Sector-wise performance · tap to trade
            </Text>

            {heatmapData.slice(0, 5).map((sector) => {
              const enrichedStocks = sector.stocks
                .map((s) => ({
                  ...s,
                  pct: prices[s.symbol]?.changePercent ?? s.changePercent,
                  ltp: prices[s.symbol]?.ltp ?? 0,
                }))
                .filter((s) => s.pct !== 0)
                .sort((a, b) => b.marketCap - a.marketCap)
                .slice(0, 4);

              if (enrichedStocks.length === 0) return null;
              const sectorAvg = enrichedStocks.reduce((acc, s) => acc + s.pct, 0) / enrichedStocks.length;
              const isUp = sectorAvg >= 0;

              return (
                <View key={sector.sector} style={{ marginBottom: 16 }}>
                  {/* Sector header */}
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: isUp ? "#4ade80" : "#f87171" }} />
                    <Text style={{ fontSize: 13, fontWeight: "600", color: colors.foreground, fontFamily: "Inter_600SemiBold", flex: 1 }}>
                      {sector.sector}
                    </Text>
                    <View style={{
                      flexDirection: "row", alignItems: "center", gap: 3,
                      backgroundColor: isUp ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.12)",
                      borderWidth: 1,
                      borderColor: isUp ? "rgba(34,197,94,0.25)" : "rgba(239,68,68,0.25)",
                      borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3,
                    }}>
                      <Ionicons
                        name={isUp ? "trending-up" : "trending-down"}
                        size={11}
                        color={isUp ? "#4ade80" : "#f87171"}
                      />
                      <Text style={{ fontSize: 11, fontWeight: "700", fontFamily: "Inter_700Bold", color: isUp ? "#4ade80" : "#f87171" }}>
                        {isUp ? "+" : ""}{sectorAvg.toFixed(2)}%
                      </Text>
                    </View>
                  </View>

                  {/* Stock tiles */}
                  <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
                    {enrichedStocks.map((stock) => (
                      <HeatBlock
                        key={stock.symbol}
                        symbol={stock.symbol}
                        changePercent={stock.pct}
                        ltp={stock.ltp}
                        onPress={() => openOrderModal({ symbol: stock.symbol, name: stock.name, currentPrice: stock.ltp })}
                      />
                    ))}
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
