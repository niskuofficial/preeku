import React, { useMemo, useState, useEffect } from "react";
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  RefreshControl, Platform, Image,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useGetPortfolioSummary, useGetWatchlist, useGetMarketHeatmap, useGetPositions, useGetHoldings } from "@workspace/api-client-react";
import { useColors } from "@/hooks/useColors";
import { useTradingContext } from "@/context/TradingContext";
import { FlashingPrice } from "@/components/FlashingPrice";
import { useLivePrice, useLivePrices } from "@/context/LivePricesContext";

function formatINR(n: number) {
  if (Math.abs(n) >= 1e7) return "₹" + (n / 1e7).toFixed(2) + "Cr";
  if (Math.abs(n) >= 1e5) return "₹" + (n / 1e5).toFixed(2) + "L";
  return "₹" + n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function formatPct(n: number) {
  return (n >= 0 ? "+" : "") + n.toFixed(2) + "%";
}

interface WatchlistItem {
  id: number; symbol: string; name: string;
  currentPrice: number; change: number; changePercent: number;
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

function WatchlistRow({ item, colors, onPress }: { item: WatchlistItem; colors: ReturnType<typeof useColors>; onPress: () => void }) {
  const live = useLivePrice(item.symbol);
  const price = live?.ltp ?? item.currentPrice;
  const changePct = live?.changePercent ?? item.changePercent;
  return (
    <TouchableOpacity
      style={{ flexDirection: "row" as const, alignItems: "center" as const, justifyContent: "space-between" as const, paddingHorizontal: 16, paddingVertical: 14 }}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={{ flexDirection: "row" as const, alignItems: "center" as const, gap: 12, flex: 1 }}>
        <View style={{ width: 38, height: 38, borderRadius: 10, backgroundColor: colors.primary + "18", alignItems: "center" as const, justifyContent: "center" as const }}>
          <Text style={{ color: colors.primary, fontSize: 12, fontWeight: "700" as const, fontFamily: "Inter_700Bold" }}>{item.symbol.slice(0, 2)}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 15, fontWeight: "700" as const, color: colors.foreground, fontFamily: "Inter_700Bold" }}>{item.symbol}</Text>
          <Text style={{ fontSize: 12, color: colors.mutedForeground, fontFamily: "Inter_400Regular", marginTop: 2 }} numberOfLines={1}>{item.name}</Text>
        </View>
      </View>
      <View style={{ alignItems: "flex-end" }}>
        <FlashingPrice value={price} symbol={item.symbol} style={{ fontSize: 15, fontWeight: "600" as const, color: colors.foreground, fontFamily: "Inter_600SemiBold", textAlign: "right" as const }} />
        <Text style={{ fontSize: 12, fontFamily: "Inter_400Regular", textAlign: "right" as const, marginTop: 2, color: changePct >= 0 ? colors.gain : colors.loss }}>
          {formatPct(changePct)}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

function HeatBlock({ symbol, changePercent, colors }: { symbol: string; changePercent: number; colors: ReturnType<typeof useColors> }) {
  const bg = changePercent >= 2 ? "#166534" : changePercent >= 0 ? "#14532d" : changePercent >= -2 ? "#7f1d1d" : "#991b1b";
  return (
    <View style={{ backgroundColor: bg, borderRadius: 6, padding: 8, minWidth: 72, alignItems: "center" }}>
      <Text style={{ color: "#fff", fontSize: 11, fontWeight: "700" as const, fontFamily: "Inter_700Bold" }}>{symbol}</Text>
      <Text style={{ color: "rgba(255,255,255,0.85)", fontSize: 10, fontFamily: "Inter_400Regular", marginTop: 2 }}>{formatPct(changePercent)}</Text>
    </View>
  );
}

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { openOrderModal } = useTradingContext();
  const { data: summary, refetch: refetchSummary, isLoading } = useGetPortfolioSummary({ query: { refetchInterval: 30000 } });
  const { data: watchlist, refetch: refetchWatchlist } = useGetWatchlist({ query: { refetchInterval: 15000 } });
  const { data: heatmap } = useGetMarketHeatmap({ query: { refetchInterval: 60000 } });
  const { data: positions } = useGetPositions();
  const { data: holdings } = useGetHoldings();
  const { prices } = useLivePrices();

  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [profileName, setProfileName] = useState("Trader");
  useEffect(() => {
    AsyncStorage.getItem("preeku_avatar").then((v) => setAvatarUri(v));
    AsyncStorage.getItem("preeku_name").then((v) => { if (v) setProfileName(v); });
  }, []);

  const s = summary as Summary | undefined;
  const watchlistItems: WatchlistItem[] = Array.isArray(watchlist) ? watchlist : [];
  const heatmapData: HeatmapSector[] = Array.isArray(heatmap) ? heatmap : [];
  const positionList: PortfolioPosition[] = Array.isArray(positions) ? positions : [];
  const holdingList: PortfolioHolding[] = Array.isArray(holdings) ? holdings : [];

  const liveStats = useMemo(() => {
    const totalInvested = s?.totalInvested ?? 0;
    const walletBalance = s?.walletBalance ?? 1000000;

    let liveCurrentValue = 0;
    let liveDayPnl = 0;
    let hasLivePrices = false;

    for (const pos of positionList) {
      const ltp = prices[pos.symbol]?.ltp ?? 0;
      if (ltp > 0) {
        liveCurrentValue += ltp * pos.quantity;
        liveDayPnl += (ltp - pos.avgBuyPrice) * pos.quantity;
        hasLivePrices = true;
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
        hasLivePrices = true;
      } else {
        liveCurrentValue += h.investedValue;
      }
    }

    const hasPositions = positionList.length > 0 || holdingList.length > 0;
    const currentValue = hasPositions ? liveCurrentValue : (s?.currentValue ?? 0);
    const totalPnl = hasPositions ? currentValue - totalInvested : (s?.totalPnl ?? 0);
    const totalPnlPercent = totalInvested > 0 ? (totalPnl / totalInvested) * 100 : 0;
    const dayPnl = hasPositions && hasLivePrices ? liveDayPnl : (s?.dayPnl ?? 0);

    return { currentValue, totalPnl, totalPnlPercent, dayPnl, totalInvested, walletBalance };
  }, [prices, positionList, holdingList, s]);

  const topInset = Platform.OS === "web" ? 67 : insets.top;

  const onRefresh = async () => {
    await Promise.all([refetchSummary(), refetchWatchlist()]);
  };

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      paddingTop: topInset + 12,
      paddingHorizontal: 20,
      paddingBottom: 16,
      flexDirection: "row" as const,
      alignItems: "center" as const,
      justifyContent: "space-between" as const,
    },
    appName: { fontSize: 22, fontWeight: "700" as const, color: colors.foreground, fontFamily: "Inter_700Bold" },
    avatarBtn: { width: 36, height: 36, borderRadius: 18, overflow: "hidden" as const, borderWidth: 2, borderColor: colors.primary + "50" },
    avatarImg: { width: 36, height: 36 },
    avatarPlaceholder: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.primary + "25", alignItems: "center" as const, justifyContent: "center" as const },
    avatarInitials: { color: colors.primary, fontSize: 13, fontWeight: "700" as const, fontFamily: "Inter_700Bold" },
    portfolioCard: {
      marginHorizontal: 16, marginBottom: 16,
      backgroundColor: colors.card,
      borderRadius: 16, padding: 20,
      borderWidth: 1, borderColor: colors.border,
    },
    portfolioLabel: { fontSize: 11, color: colors.mutedForeground, letterSpacing: 1, fontFamily: "Inter_500Medium", fontWeight: "500" as const },
    portfolioValue: { fontSize: 36, fontWeight: "700" as const, color: colors.foreground, fontFamily: "Inter_700Bold", marginTop: 4 },
    pnlRow: { flexDirection: "row" as const, alignItems: "center" as const, gap: 6, marginTop: 6 },
    pnlChip: { flexDirection: "row" as const, alignItems: "center" as const, gap: 4, backgroundColor: "transparent", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
    statsRow: { flexDirection: "row" as const, gap: 10, marginTop: 16 },
    statBox: { flex: 1, backgroundColor: colors.secondary, borderRadius: 10, padding: 12, borderWidth: 1, borderColor: colors.border },
    statLabel: { fontSize: 10, color: colors.mutedForeground, letterSpacing: 0.5, fontFamily: "Inter_400Regular" },
    statValue: { fontSize: 15, fontWeight: "700" as const, color: colors.foreground, fontFamily: "Inter_700Bold", marginTop: 4 },
    section: { marginHorizontal: 16, marginBottom: 16 },
    sectionHeader: { flexDirection: "row" as const, justifyContent: "space-between" as const, alignItems: "center" as const, marginBottom: 12 },
    sectionTitle: { fontSize: 16, fontWeight: "700" as const, color: colors.foreground, fontFamily: "Inter_700Bold" },
    watchlistCard: { backgroundColor: colors.card, borderRadius: 14, borderWidth: 1, borderColor: colors.border, overflow: "hidden" as const },
    watchlistRow: { flexDirection: "row" as const, alignItems: "center" as const, justifyContent: "space-between" as const, paddingHorizontal: 16, paddingVertical: 14 },
    watchlistSym: { fontSize: 15, fontWeight: "700" as const, color: colors.foreground, fontFamily: "Inter_700Bold" },
    watchlistName: { fontSize: 12, color: colors.mutedForeground, fontFamily: "Inter_400Regular", marginTop: 2 },
    watchlistPrice: { fontSize: 15, fontWeight: "600" as const, color: colors.foreground, fontFamily: "Inter_600SemiBold", textAlign: "right" as const },
    watchlistChg: { fontSize: 12, fontFamily: "Inter_400Regular", textAlign: "right" as const, marginTop: 2 },
    separator: { height: 1, backgroundColor: colors.border, marginHorizontal: 16 },
    heatRow: { flexDirection: "row" as const, flexWrap: "wrap" as const, gap: 6 },
    heatSector: { marginBottom: 12 },
    heatSectorLabel: { fontSize: 12, color: colors.mutedForeground, fontFamily: "Inter_500Medium", fontWeight: "500" as const, marginBottom: 6 },
    emptyText: { color: colors.mutedForeground, textAlign: "center" as const, paddingVertical: 24, fontFamily: "Inter_400Regular" },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image
          source={require("@/assets/images/icon.png")}
          style={{ width: 36, height: 36, borderRadius: 8 }}
          resizeMode="contain"
        />
        <TouchableOpacity
          onPress={() => router.push("/(tabs)/profile")}
          activeOpacity={0.75}
          style={styles.avatarBtn}
        >
          {avatarUri ? (
            <Image source={{ uri: avatarUri }} style={styles.avatarImg} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarInitials}>
                {profileName.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase()}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: Platform.OS === "web" ? 100 : 100 }}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        {/* Portfolio Card — live prices recalculate currentValue, P&L every tick */}
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
                style={{ color: liveStats.totalPnl >= 0 ? colors.gain : colors.loss, fontSize: 13, fontFamily: "Inter_600SemiBold", fontWeight: "600" as const }}
              />
            </View>
            <Text style={{ color: colors.mutedForeground, fontSize: 11, fontFamily: "Inter_400Regular" }}>Total P&L</Text>
          </View>
        </View>

        {/* Watchlist */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Watchlist</Text>
            <Ionicons name="star" size={16} color={colors.primary} />
          </View>
          {watchlistItems.length === 0 ? (
            <Text style={styles.emptyText}>No stocks in watchlist</Text>
          ) : (
            <View style={styles.watchlistCard}>
              {watchlistItems.map((item, idx) => (
                <React.Fragment key={item.symbol}>
                  <WatchlistRow
                    item={item}
                    colors={colors}
                    onPress={() => router.push(`/stock/${item.symbol}`)}
                  />
                  {idx < watchlistItems.length - 1 && <View style={styles.separator} />}
                </React.Fragment>
              ))}
            </View>
          )}
        </View>

        {/* Heatmap */}
        {heatmapData.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Market Heatmap</Text>
            </View>
            {heatmapData.slice(0, 4).map((sector) => (
              <View key={sector.sector} style={styles.heatSector}>
                <Text style={styles.heatSectorLabel}>{sector.sector} · {formatPct(sector.changePercent)}</Text>
                <View style={styles.heatRow}>
                  {sector.stocks.slice(0, 4).map((stock) => (
                    <HeatBlock key={stock.symbol} symbol={stock.symbol} changePercent={stock.changePercent} colors={colors} />
                  ))}
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
