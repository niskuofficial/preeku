import React, { useState } from "react";
import {
  View, Text, FlatList, TextInput,
  TouchableOpacity, Platform, RefreshControl, ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useColors } from "@/hooks/useColors";
import { useTradingContext } from "@/context/TradingContext";
import { FlashingPrice } from "@/components/FlashingPrice";
import { useLivePrices, useLivePrice } from "@/context/LivePricesContext";

const INITIAL_SIZE = 20;
const LOAD_MORE_SIZE = 10;

interface Stock {
  symbol: string; name: string; exchange: string; sector: string;
  currentPrice: number; change: number; changePercent: number;
  high: number; low: number; volume: number;
}

function StockRow({ item, onPress, onBuy, onSell, colors }: {
  item: Stock; onPress: () => void; onBuy: () => void; onSell: () => void;
  colors: ReturnType<typeof useColors>;
}) {
  const live = useLivePrice(item.symbol);
  const price = live?.ltp ?? item.currentPrice;
  const changePct = live?.changePercent ?? item.changePercent;
  const isUp = changePct >= 0;

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={onPress}
      style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 13, borderBottomWidth: 1, borderColor: colors.border }}
    >
      <View style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: colors.primary + "18", alignItems: "center", justifyContent: "center", marginRight: 12 }}>
        <Text style={{ color: colors.primary, fontSize: 13, fontWeight: "700", fontFamily: "Inter_700Bold" }}>{item.symbol.slice(0, 2)}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 15, fontWeight: "700", color: colors.foreground, fontFamily: "Inter_700Bold" }}>{item.symbol}</Text>
        <Text style={{ fontSize: 11, color: colors.mutedForeground, fontFamily: "Inter_400Regular", marginTop: 1 }} numberOfLines={1}>{item.name.split(" ").slice(0, 3).join(" ")}</Text>
      </View>
      <View style={{ alignItems: "flex-end", marginRight: 10 }}>
        <FlashingPrice
          value={price}
          symbol={item.symbol}
          style={{ fontSize: 15, fontWeight: "600", fontFamily: "Inter_600SemiBold", color: colors.foreground }}
        />
        <View style={{ flexDirection: "row", alignItems: "center", gap: 2, marginTop: 2 }}>
          <Ionicons name={isUp ? "caret-up" : "caret-down"} size={10} color={isUp ? colors.gain : colors.loss} />
          <Text style={{ fontSize: 12, color: isUp ? colors.gain : colors.loss, fontFamily: "Inter_500Medium", fontWeight: "500" }}>
            {Math.abs(changePct).toFixed(2)}%
          </Text>
        </View>
      </View>
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

function buildApiUrl(search: string, offset: number, limit: number) {
  const domain = process.env.EXPO_PUBLIC_DOMAIN;
  const base = domain ? `https://${domain}` : "http://localhost:8080";
  const params = new URLSearchParams({ limit: String(limit), offset: String(offset) });
  if (search.trim()) params.set("search", search.trim());
  return `${base}/api/stocks?${params}`;
}

export default function MarketsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { openOrderModal } = useTradingContext();
  const { connected, prices } = useLivePrices();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const searchTimeout = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleSearch = (text: string) => {
    setSearch(text);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => setDebouncedSearch(text), 350);
  };

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    refetch,
    isFetching,
  } = useInfiniteQuery<Stock[]>({
    queryKey: ["stocks-infinite", debouncedSearch],
    initialPageParam: { offset: 0, limit: INITIAL_SIZE },
    queryFn: async ({ pageParam }) => {
      const { offset, limit } = pageParam as { offset: number; limit: number };
      const res = await fetch(buildApiUrl(debouncedSearch, offset, limit));
      return res.json();
    },
    getNextPageParam: (lastPage, allPages, lastPageParam) => {
      const { limit } = lastPageParam as { offset: number; limit: number };
      if (!Array.isArray(lastPage) || lastPage.length < limit) return undefined;
      const totalLoaded = allPages.reduce((sum, p) => sum + p.length, 0);
      return { offset: totalLoaded, limit: LOAD_MORE_SIZE };
    },
    staleTime: 60000,
  });

  const stockList: Stock[] = data?.pages.flat() ?? [];
  const gainers = stockList.filter((s) => (prices[s.symbol]?.changePercent ?? s.changePercent) >= 0).length;
  const losers = stockList.length - gainers;
  const topInset = Platform.OS === "web" ? 67 : insets.top;


  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View style={{ paddingTop: topInset + 12, paddingHorizontal: 20, paddingBottom: 12, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <View>
          <Text style={{ fontSize: 22, fontWeight: "700", color: colors.foreground, fontFamily: "Inter_700Bold" }}>Markets</Text>
        </View>
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
          placeholder="Search 2,200+ NSE stocks..."
          placeholderTextColor={colors.mutedForeground}
          value={search}
          onChangeText={handleSearch}
          autoCapitalize="characters"
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => { setSearch(""); setDebouncedSearch(""); }}>
            <Ionicons name="close-circle" size={18} color={colors.mutedForeground} />
          </TouchableOpacity>
        )}
      </View>

      {/* Stats chips */}
      <View style={{ flexDirection: "row", gap: 8, marginHorizontal: 16, marginBottom: 12 }}>
        {[
          { label: "Gainers", value: gainers, color: colors.gain, icon: "trending-up" as const },
          { label: "Losers", value: losers, color: colors.loss, icon: "trending-down" as const },
        ].map(({ label, value, color, icon }) => (
          <View key={label} style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: colors.card, borderRadius: 10, paddingVertical: 8, paddingHorizontal: 12, borderWidth: 1, borderColor: color + "40" }}>
            <Ionicons name={icon} size={16} color={color} />
            <View>
              <Text style={{ fontSize: 13, fontWeight: "700", fontFamily: "Inter_700Bold", color }}>{value}</Text>
              <Text style={{ fontSize: 11, color: colors.mutedForeground, fontFamily: "Inter_400Regular" }}>{label}</Text>
            </View>
          </View>
        ))}
      </View>

      <FlatList
        data={stockList}
        extraData={prices}
        keyExtractor={(item) => item.symbol}
        refreshControl={<RefreshControl refreshing={isFetching && !isFetchingNextPage} onRefresh={refetch} tintColor={colors.primary} />}
        contentContainerStyle={{ paddingBottom: Platform.OS === "web" ? 120 : 120 }}
        renderItem={({ item }) => (
          <StockRow
            item={item}
            colors={colors}
            onPress={() => router.push(`/stock/${item.symbol}`)}
            onBuy={() => openOrderModal({ symbol: item.symbol, name: item.name, currentPrice: item.currentPrice }, "BUY")}
            onSell={() => openOrderModal({ symbol: item.symbol, name: item.name, currentPrice: item.currentPrice }, "SELL")}
          />
        )}
        ListFooterComponent={
          isFetchingNextPage ? (
            <View style={{ padding: 20, alignItems: "center" }}>
              <ActivityIndicator color={colors.primary} />
              <Text style={{ color: colors.mutedForeground, fontSize: 12, marginTop: 6, fontFamily: "Inter_400Regular" }}>Loading more stocks...</Text>
            </View>
          ) : hasNextPage ? (
            <TouchableOpacity
              style={{ margin: 16, backgroundColor: colors.card, borderRadius: 12, padding: 14, alignItems: "center", borderWidth: 1, borderColor: colors.border }}
              onPress={() => fetchNextPage()}
            >
              <Text style={{ color: colors.primary, fontFamily: "Inter_600SemiBold", fontSize: 14 }}>Load More</Text>
            </TouchableOpacity>
          ) : stockList.length > 0 ? (
            <Text style={{ textAlign: "center", color: colors.mutedForeground, padding: 20, fontFamily: "Inter_400Regular", fontSize: 12 }}>
              All {stockList.length} stocks loaded
            </Text>
          ) : null
        }
        ListEmptyComponent={
          isLoading ? (
            <View style={{ padding: 40, alignItems: "center", gap: 12 }}>
              <ActivityIndicator color={colors.primary} size="large" />
              <Text style={{ fontSize: 15, color: colors.mutedForeground, fontFamily: "Inter_400Regular" }}>Loading stocks...</Text>
            </View>
          ) : (
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 40, gap: 8 }}>
              <Ionicons name="bar-chart-outline" size={48} color={colors.mutedForeground} />
              <Text style={{ fontSize: 15, color: colors.foreground, fontFamily: "Inter_600SemiBold", fontWeight: "600" }}>No stocks found</Text>
              {search ? <Text style={{ fontSize: 13, color: colors.mutedForeground, fontFamily: "Inter_400Regular", textAlign: "center" }}>No results for "{search}"</Text> : null}
            </View>
          )
        }
      />
    </View>
  );
}
