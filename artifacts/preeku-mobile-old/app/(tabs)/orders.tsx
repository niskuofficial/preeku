import React, { useState } from "react";
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity,
  Platform, ActivityIndicator, Alert, RefreshControl,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useListOrders, useCancelOrder, getListOrdersQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useColors } from "@/hooks/useColors";
import * as Haptics from "expo-haptics";

interface Order {
  id: number; symbol: string; side: string; orderType: string;
  productType: string; quantity: number; price: number;
  totalValue: number; pnl: number | null; status: string; placedAt: string;
}

type StatusFilter = "ALL" | "EXECUTED" | "PENDING" | "CANCELLED";

function formatINR(n: number) {
  return "₹" + n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function OrderCard({ order, onCancel, colors }: { order: Order; onCancel: () => void; colors: ReturnType<typeof useColors> }) {
  const isBuy = order.side === "BUY";
  const statusColor = order.status === "EXECUTED" ? colors.gain : order.status === "PENDING" ? "#f59e0b" : colors.mutedForeground;
  const statusBg = order.status === "EXECUTED" ? colors.gainBg : order.status === "PENDING" ? "rgba(245,158,11,0.12)" : colors.secondary;

  return (
    <View style={{ backgroundColor: colors.card, borderRadius: 14, marginHorizontal: 16, marginBottom: 10, borderWidth: 1, borderColor: colors.border, padding: 16 }}>
      <View style={{ flexDirection: "row" as const, alignItems: "center" as const, justifyContent: "space-between" as const, marginBottom: 10 }}>
        <View style={{ flexDirection: "row" as const, alignItems: "center" as const, gap: 10 }}>
          <View style={{ width: 38, height: 38, borderRadius: 10, backgroundColor: isBuy ? colors.gainBg : colors.lossBg, alignItems: "center" as const, justifyContent: "center" as const }}>
            <Ionicons name={isBuy ? "trending-up" : "trending-down"} size={18} color={isBuy ? colors.gain : colors.loss} />
          </View>
          <View>
            <Text style={{ fontSize: 16, fontWeight: "700" as const, color: colors.foreground, fontFamily: "Inter_700Bold" }}>{order.symbol}</Text>
            <Text style={{ fontSize: 12, color: colors.mutedForeground, fontFamily: "Inter_400Regular", marginTop: 1 }}>
              {order.orderType} · {order.productType}
            </Text>
          </View>
        </View>
        <View style={{ alignItems: "flex-end" as const, gap: 4 }}>
          <View style={{ backgroundColor: isBuy ? colors.gainBg : colors.lossBg, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 }}>
            <Text style={{ fontSize: 12, fontWeight: "700" as const, color: isBuy ? colors.gain : colors.loss, fontFamily: "Inter_700Bold" }}>{order.side}</Text>
          </View>
          <View style={{ backgroundColor: statusBg, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 }}>
            <Text style={{ fontSize: 11, fontWeight: "600" as const, color: statusColor, fontFamily: "Inter_600SemiBold" }}>{order.status}</Text>
          </View>
        </View>
      </View>

      <View style={{ flexDirection: "row" as const, gap: 0 }}>
        {[
          { label: "QTY", value: String(order.quantity) },
          { label: "PRICE", value: formatINR(order.price) },
          { label: "TOTAL", value: formatINR(order.totalValue) },
          ...(order.pnl !== null ? [{ label: "P&L", value: (order.pnl >= 0 ? "+" : "") + formatINR(order.pnl) }] : []),
        ].map(({ label, value }, idx) => (
          <View key={label} style={{ flex: 1, borderLeftWidth: idx > 0 ? 1 : 0, borderColor: colors.border, paddingLeft: idx > 0 ? 10 : 0 }}>
            <Text style={{ fontSize: 10, color: colors.mutedForeground, letterSpacing: 0.5, fontFamily: "Inter_400Regular" }}>{label}</Text>
            <Text style={{ fontSize: 13, fontWeight: "600" as const, color: label === "P&L" ? (order.pnl! >= 0 ? colors.gain : colors.loss) : colors.foreground, fontFamily: "Inter_600SemiBold", marginTop: 2 }}>{value}</Text>
          </View>
        ))}
      </View>

      <View style={{ flexDirection: "row" as const, justifyContent: "space-between" as const, alignItems: "center" as const, marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderColor: colors.border }}>
        <Text style={{ fontSize: 11, color: colors.mutedForeground, fontFamily: "Inter_400Regular" }}>
          {new Date(order.placedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
        </Text>
        {order.status === "PENDING" && (
          <TouchableOpacity onPress={onCancel} activeOpacity={0.7}>
            <Text style={{ color: colors.loss, fontSize: 13, fontWeight: "600" as const, fontFamily: "Inter_600SemiBold" }}>Cancel</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

export default function OrdersScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [filter, setFilter] = useState<StatusFilter>("ALL");
  const queryClient = useQueryClient();
  const topInset = Platform.OS === "web" ? 67 : insets.top;

  const params = filter !== "ALL" ? { status: filter as "EXECUTED" | "CANCELLED" | "PENDING" } : undefined;
  const { data: orders, isLoading, refetch } = useListOrders(params, {
    query: { queryKey: getListOrdersQueryKey(params) }
  });
  const cancelOrder = useCancelOrder();

  const orderList: Order[] = Array.isArray(orders) ? orders : [];

  const handleCancel = (id: number) => {
    Alert.alert("Cancel Order", "Are you sure you want to cancel this order?", [
      { text: "No", style: "cancel" },
      {
        text: "Yes, Cancel",
        style: "destructive",
        onPress: () => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          cancelOrder.mutate({ id }, {
            onSuccess: () => {
              queryClient.invalidateQueries({ queryKey: getListOrdersQueryKey() });
            }
          });
        }
      }
    ]);
  };

  const filters: StatusFilter[] = ["ALL", "EXECUTED", "PENDING", "CANCELLED"];

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: { paddingTop: topInset + 12, paddingHorizontal: 20, paddingBottom: 12 },
    title: { fontSize: 22, fontWeight: "700" as const, color: colors.foreground, fontFamily: "Inter_700Bold" },
    filterRow: { flexDirection: "row" as const, gap: 6, paddingHorizontal: 16, marginBottom: 14 },
    filterBtn: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },
    filterText: { fontSize: 12, fontWeight: "600" as const, fontFamily: "Inter_600SemiBold" },
    emptyContainer: { flex: 1, alignItems: "center" as const, justifyContent: "center" as const, padding: 40, gap: 8 },
    emptyText: { fontSize: 15, color: colors.foreground, fontFamily: "Inter_600SemiBold", fontWeight: "600" as const },
    emptySubText: { fontSize: 13, color: colors.mutedForeground, fontFamily: "Inter_400Regular", textAlign: "center" as const },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Orders</Text>
      </View>

      <View style={styles.filterRow}>
        {filters.map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterBtn, { backgroundColor: filter === f ? colors.primary : colors.card, borderColor: filter === f ? colors.primary : colors.border }]}
            onPress={() => { setFilter(f); Haptics.selectionAsync(); }}
            activeOpacity={0.7}
          >
            <Text style={[styles.filterText, { color: filter === f ? "#fff" : colors.mutedForeground }]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {isLoading ? (
        <View style={styles.emptyContainer}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : (
        <FlatList
          data={orderList}
          keyExtractor={(item) => String(item.id)}
          scrollEnabled={orderList.length > 0}
          contentContainerStyle={{ paddingBottom: Platform.OS === "web" ? 100 : 100 }}
          refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={colors.primary} />}
          renderItem={({ item }) => (
            <OrderCard order={item} colors={colors} onCancel={() => handleCancel(item.id)} />
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="receipt-outline" size={48} color={colors.mutedForeground} />
              <Text style={styles.emptyText}>No orders yet</Text>
              <Text style={styles.emptySubText}>Trade stocks from the Markets tab</Text>
            </View>
          }
        />
      )}
    </View>
  );
}
