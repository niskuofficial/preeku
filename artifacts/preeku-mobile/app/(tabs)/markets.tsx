import React, { useState } from "react";
import {
  View, Text, FlatList, TextInput, StyleSheet,
  TouchableOpacity, Platform, RefreshControl,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useListStocks, getListStocksQueryKey } from "@workspace/api-client-react";
import { useColors } from "@/hooks/useColors";
import { useTradingContext } from "@/context/TradingContext";

interface Stock {
  symbol: string; name: string; exchange: string; sector: string;
  currentPrice: number; change: number; changePercent: number;
  high: number; low: number; volume: number;
}

function formatINR(n: number) {
  return "₹" + n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function StockRow({ item, onBuy, onSell, colors }: { item: Stock; onBuy: () => void; onSell: () => void; colors: ReturnType<typeof useColors> }) {
  const isUp = item.changePercent >= 0;
  return (
    <View style={{ flexDirection: "row" as const, alignItems: "center" as const, paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderColor: colors.border }}>
      {/* Avatar */}
      <View style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: colors.primary + "18", alignItems: "center" as const, justifyContent: "center" as const, marginRight: 12 }}>
        <Text style={{ color: colors.primary, fontSize: 13, fontWeight: "700" as const, fontFamily: "Inter_700Bold" }}>{item.symbol.slice(0, 2)}</Text>
      </View>
      {/* Info */}
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 15, fontWeight: "700" as const, color: colors.foreground, fontFamily: "Inter_700Bold" }}>{item.symbol}</Text>
        <Text style={{ fontSize: 11, color: colors.mutedForeground, fontFamily: "Inter_400Regular", marginTop: 1 }} numberOfLines={1}>{item.sector}</Text>
      </View>
      {/* Price & Change */}
      <View style={{ alignItems: "flex-end" as const, marginRight: 10 }}>
        <Text style={{ fontSize: 15, fontWeight: "600" as const, color: colors.foreground, fontFamily: "Inter_600SemiBold" }}>
          ₹{item.currentPrice.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </Text>
        <View style={{ flexDirection: "row" as const, alignItems: "center" as const, gap: 2, marginTop: 2 }}>
          <Ionicons name={isUp ? "caret-up" : "caret-down"} size={10} color={isUp ? colors.gain : colors.loss} />
          <Text style={{ fontSize: 12, color: isUp ? colors.gain : colors.loss, fontFamily: "Inter_500Medium", fontWeight: "500" as const }}>
            {Math.abs(item.changePercent).toFixed(2)}%
          </Text>
        </View>
      </View>
      {/* Buy/Sell */}
      <View style={{ gap: 5 }}>
        <TouchableOpacity
          style={{ backgroundColor: colors.gainBg, borderRadius: 6, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1, borderColor: colors.gain + "40" }}
          onPress={onBuy}
          activeOpacity={0.7}
        >
          <Text style={{ color: colors.gain, fontSize: 12, fontWeight: "700" as const, fontFamily: "Inter_700Bold" }}>BUY</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{ backgroundColor: colors.lossBg, borderRadius: 6, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1, borderColor: colors.loss + "40" }}
          onPress={onSell}
          activeOpacity={0.7}
        >
          <Text style={{ color: colors.loss, fontSize: 12, fontWeight: "700" as const, fontFamily: "Inter_700Bold" }}>SELL</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function MarketsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { openOrderModal } = useTradingContext();
  const [search, setSearch] = useState("");
  const params = search.trim() ? { search: search.trim() } : undefined;
  const { data: stocks, isLoading, refetch } = useListStocks(params, {
    query: { queryKey: getListStocksQueryKey(params) }
  });

  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const stockList: Stock[] = Array.isArray(stocks) ? stocks : [];
  const gainers = stockList.filter((s) => s.changePercent >= 0).length;
  const losers = stockList.filter((s) => s.changePercent < 0).length;

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: { paddingTop: topInset + 12, paddingHorizontal: 20, paddingBottom: 12 },
    title: { fontSize: 22, fontWeight: "700" as const, color: colors.foreground, fontFamily: "Inter_700Bold" },
    searchRow: { flexDirection: "row" as const, alignItems: "center" as const, backgroundColor: colors.card, borderRadius: 12, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 12, marginHorizontal: 16, marginBottom: 10 },
    searchInput: { flex: 1, height: 42, color: colors.foreground, fontSize: 14, fontFamily: "Inter_400Regular" },
    statsRow: { flexDirection: "row" as const, gap: 8, marginHorizontal: 16, marginBottom: 12 },
    statChip: { flex: 1, flexDirection: "row" as const, alignItems: "center" as const, gap: 6, backgroundColor: colors.card, borderRadius: 10, paddingVertical: 8, paddingHorizontal: 12, borderWidth: 1, borderColor: colors.border },
    statText: { fontSize: 13, fontWeight: "700" as const, fontFamily: "Inter_700Bold" },
    statSub: { fontSize: 11, color: colors.mutedForeground, fontFamily: "Inter_400Regular" },
    emptyContainer: { flex: 1, alignItems: "center" as const, justifyContent: "center" as const, padding: 40, gap: 8 },
    emptyText: { fontSize: 15, color: colors.foreground, fontFamily: "Inter_600SemiBold", fontWeight: "600" as const },
    emptySubText: { fontSize: 13, color: colors.mutedForeground, fontFamily: "Inter_400Regular", textAlign: "center" as const },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Markets</Text>
      </View>

      {/* Search */}
      <View style={styles.searchRow}>
        <Ionicons name="search" size={16} color={colors.mutedForeground} style={{ marginRight: 8 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search stocks..."
          placeholderTextColor={colors.mutedForeground}
          value={search}
          onChangeText={setSearch}
          autoCapitalize="characters"
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch("")}>
            <Ionicons name="close-circle" size={18} color={colors.mutedForeground} />
          </TouchableOpacity>
        )}
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={[styles.statChip, { borderColor: colors.gain + "40" }]}>
          <Ionicons name="trending-up" size={16} color={colors.gain} />
          <View>
            <Text style={[styles.statText, { color: colors.gain }]}>{gainers}</Text>
            <Text style={styles.statSub}>Gainers</Text>
          </View>
        </View>
        <View style={[styles.statChip, { borderColor: colors.loss + "40" }]}>
          <Ionicons name="trending-down" size={16} color={colors.loss} />
          <View>
            <Text style={[styles.statText, { color: colors.loss }]}>{losers}</Text>
            <Text style={styles.statSub}>Losers</Text>
          </View>
        </View>
        <View style={styles.statChip}>
          <Ionicons name="stats-chart" size={16} color={colors.primary} />
          <View>
            <Text style={[styles.statText, { color: colors.primary }]}>{stockList.length}</Text>
            <Text style={styles.statSub}>Total</Text>
          </View>
        </View>
      </View>

      <FlatList
        data={stockList}
        keyExtractor={(item) => item.symbol}
        scrollEnabled={stockList.length > 0}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={colors.primary} />}
        contentContainerStyle={{ paddingBottom: Platform.OS === "web" ? 100 : 100 }}
        renderItem={({ item }) => (
          <StockRow
            item={item}
            colors={colors}
            onBuy={() => openOrderModal({ symbol: item.symbol, name: item.name, currentPrice: item.currentPrice }, "BUY")}
            onSell={() => openOrderModal({ symbol: item.symbol, name: item.name, currentPrice: item.currentPrice }, "SELL")}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="bar-chart-outline" size={48} color={colors.mutedForeground} />
            <Text style={styles.emptyText}>{isLoading ? "Loading stocks..." : "No stocks found"}</Text>
            <Text style={styles.emptySubText}>{!isLoading && search ? `No results for "${search}"` : ""}</Text>
          </View>
        }
      />
    </View>
  );
}
