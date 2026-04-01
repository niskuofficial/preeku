import React, { useState } from "react";
import {
  View, Text, FlatList, TextInput,
  TouchableOpacity, Platform, RefreshControl,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useListStocks, getListStocksQueryKey } from "@workspace/api-client-react";
import { useColors } from "@/hooks/useColors";
import { useTradingContext } from "@/context/TradingContext";
import { FlashingPrice } from "@/components/FlashingPrice";
import { useLivePrices } from "@/context/LivePricesContext";

interface Stock {
  symbol: string; name: string; exchange: string; sector: string;
  currentPrice: number; change: number; changePercent: number;
  high: number; low: number; volume: number;
}

function StockRow({ item, onPress, onBuy, onSell, colors }: {
  item: Stock; onPress: () => void; onBuy: () => void; onSell: () => void;
  colors: ReturnType<typeof useColors>;
}) {
  const isUp = item.changePercent >= 0;
  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={onPress}
      style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 13, borderBottomWidth: 1, borderColor: colors.border }}
    >
      {/* Avatar */}
      <View style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: colors.primary + "18", alignItems: "center", justifyContent: "center", marginRight: 12 }}>
        <Text style={{ color: colors.primary, fontSize: 13, fontWeight: "700", fontFamily: "Inter_700Bold" }}>{item.symbol.slice(0, 2)}</Text>
      </View>

      {/* Name + sector */}
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 15, fontWeight: "700", color: colors.foreground, fontFamily: "Inter_700Bold" }}>{item.symbol}</Text>
        <Text style={{ fontSize: 11, color: colors.mutedForeground, fontFamily: "Inter_400Regular", marginTop: 1 }} numberOfLines={1}>{item.sector}</Text>
      </View>

      {/* Flashing price + change (live from WebSocket) */}
      <View style={{ alignItems: "flex-end", marginRight: 10 }}>
        <FlashingPrice
          value={item.currentPrice}
          symbol={item.symbol}
          style={{ fontSize: 15, fontWeight: "600", fontFamily: "Inter_600SemiBold", color: colors.foreground }}
        />
        <View style={{ flexDirection: "row", alignItems: "center", gap: 2, marginTop: 2 }}>
          <Ionicons name={isUp ? "caret-up" : "caret-down"} size={10} color={isUp ? colors.gain : colors.loss} />
          <Text style={{ fontSize: 12, color: isUp ? colors.gain : colors.loss, fontFamily: "Inter_500Medium", fontWeight: "500" }}>
            {Math.abs(item.changePercent).toFixed(2)}%
          </Text>
        </View>
      </View>

      {/* Buy / Sell quick buttons */}
      <View style={{ gap: 5 }}>
        <TouchableOpacity
          style={{ backgroundColor: colors.gainBg, borderRadius: 6, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1, borderColor: colors.gain + "40" }}
          onPress={(e) => { e.stopPropagation?.(); onBuy(); }}
          activeOpacity={0.7}
        >
          <Text style={{ color: colors.gain, fontSize: 12, fontWeight: "700", fontFamily: "Inter_700Bold" }}>BUY</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{ backgroundColor: colors.lossBg, borderRadius: 6, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1, borderColor: colors.loss + "40" }}
          onPress={(e) => { e.stopPropagation?.(); onSell(); }}
          activeOpacity={0.7}
        >
          <Text style={{ color: colors.loss, fontSize: 12, fontWeight: "700", fontFamily: "Inter_700Bold" }}>SELL</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

export default function MarketsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { openOrderModal } = useTradingContext();
  const { connected } = useLivePrices();
  const [search, setSearch] = useState("");
  const params = search.trim() ? { search: search.trim() } : undefined;
  const { data: stocks, isLoading, refetch } = useListStocks(params, {
    query: {
      queryKey: getListStocksQueryKey(params),
      refetchInterval: 15000,
    },
  });

  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const stockList: Stock[] = Array.isArray(stocks) ? stocks : [];
  const gainers = stockList.filter((s) => s.changePercent >= 0).length;
  const losers = stockList.filter((s) => s.changePercent < 0).length;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View style={{ paddingTop: topInset + 12, paddingHorizontal: 20, paddingBottom: 12, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <Text style={{ fontSize: 22, fontWeight: "700", color: colors.foreground, fontFamily: "Inter_700Bold" }}>Markets</Text>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: connected ? colors.gain + "18" : colors.border, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1, borderColor: connected ? colors.gain + "44" : colors.border }}>
          <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: connected ? colors.gain : colors.mutedForeground }} />
          <Text style={{ fontSize: 11, fontFamily: "Inter_500Medium", fontWeight: "500", color: connected ? colors.gain : colors.mutedForeground }}>
            {connected ? "LIVE" : "Polling"}
          </Text>
        </View>
      </View>

      {/* Search */}
      <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: colors.card, borderRadius: 12, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 12, marginHorizontal: 16, marginBottom: 10 }}>
        <Ionicons name="search" size={16} color={colors.mutedForeground} style={{ marginRight: 8 }} />
        <TextInput
          style={{ flex: 1, height: 42, color: colors.foreground, fontSize: 14, fontFamily: "Inter_400Regular" }}
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

      {/* Stats chips */}
      <View style={{ flexDirection: "row", gap: 8, marginHorizontal: 16, marginBottom: 12 }}>
        <View style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: colors.card, borderRadius: 10, paddingVertical: 8, paddingHorizontal: 12, borderWidth: 1, borderColor: colors.gain + "40" }}>
          <Ionicons name="trending-up" size={16} color={colors.gain} />
          <View>
            <Text style={{ fontSize: 13, fontWeight: "700", fontFamily: "Inter_700Bold", color: colors.gain }}>{gainers}</Text>
            <Text style={{ fontSize: 11, color: colors.mutedForeground, fontFamily: "Inter_400Regular" }}>Gainers</Text>
          </View>
        </View>
        <View style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: colors.card, borderRadius: 10, paddingVertical: 8, paddingHorizontal: 12, borderWidth: 1, borderColor: colors.loss + "40" }}>
          <Ionicons name="trending-down" size={16} color={colors.loss} />
          <View>
            <Text style={{ fontSize: 13, fontWeight: "700", fontFamily: "Inter_700Bold", color: colors.loss }}>{losers}</Text>
            <Text style={{ fontSize: 11, color: colors.mutedForeground, fontFamily: "Inter_400Regular" }}>Losers</Text>
          </View>
        </View>
        <View style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: colors.card, borderRadius: 10, paddingVertical: 8, paddingHorizontal: 12, borderWidth: 1, borderColor: colors.border }}>
          <Ionicons name="stats-chart" size={16} color={colors.primary} />
          <View>
            <Text style={{ fontSize: 13, fontWeight: "700", fontFamily: "Inter_700Bold", color: colors.primary }}>{stockList.length}</Text>
            <Text style={{ fontSize: 11, color: colors.mutedForeground, fontFamily: "Inter_400Regular" }}>Total</Text>
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
            onPress={() => router.push(`/stock/${item.symbol}`)}
            onBuy={() => openOrderModal({ symbol: item.symbol, name: item.name, currentPrice: item.currentPrice }, "BUY")}
            onSell={() => openOrderModal({ symbol: item.symbol, name: item.name, currentPrice: item.currentPrice }, "SELL")}
          />
        )}
        ListEmptyComponent={
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 40, gap: 8 }}>
            <Ionicons name="bar-chart-outline" size={48} color={colors.mutedForeground} />
            <Text style={{ fontSize: 15, color: colors.foreground, fontFamily: "Inter_600SemiBold", fontWeight: "600" }}>
              {isLoading ? "Loading stocks..." : "No stocks found"}
            </Text>
            <Text style={{ fontSize: 13, color: colors.mutedForeground, fontFamily: "Inter_400Regular", textAlign: "center" }}>
              {!isLoading && search ? `No results for "${search}"` : ""}
            </Text>
          </View>
        }
      />
    </View>
  );
}
