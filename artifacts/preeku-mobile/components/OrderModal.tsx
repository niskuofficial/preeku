import React, { useState, useEffect } from "react";
import {
  Modal, View, Text, TextInput, TouchableOpacity,
  StyleSheet, Platform, Pressable, ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useQueryClient } from "@tanstack/react-query";
import {
  usePlaceOrder, useGetWallet,
  getGetWalletQueryKey, getGetPositionsQueryKey,
  getGetHoldingsQueryKey, getGetPortfolioSummaryQueryKey, getListOrdersQueryKey,
} from "@workspace/api-client-react";
import { useTradingContext } from "@/context/TradingContext";
import { useColors } from "@/hooks/useColors";

function formatINR(n: number) {
  return "₹" + n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

type OrderType = "MARKET" | "LIMIT";
type ProductType = "INTRADAY" | "DELIVERY";

export default function OrderModal() {
  const { isOrderModalOpen, selectedStock, orderSide, closeOrderModal, openOrderModal } = useTradingContext();
  const [side, setSide] = useState<"BUY" | "SELL">("BUY");
  const [orderType, setOrderType] = useState<OrderType>("MARKET");
  const [productType, setProductType] = useState<ProductType>("INTRADAY");
  const [quantity, setQuantity] = useState("1");
  const [limitPrice, setLimitPrice] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const colors = useColors();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const placeOrder = usePlaceOrder();
  const { data: wallet } = useGetWallet();

  const walletBalance = (wallet as { balance?: number })?.balance ?? 0;
  const currentPrice = selectedStock?.currentPrice ?? 0;
  const execPrice = orderType === "MARKET" ? currentPrice : (parseFloat(limitPrice) || currentPrice);
  const qty = Math.max(1, parseInt(quantity) || 1);
  const estimatedTotal = execPrice * qty;

  useEffect(() => {
    if (isOrderModalOpen) {
      setSide(orderSide);
      setOrderType("MARKET");
      setProductType("INTRADAY");
      setQuantity("1");
      setLimitPrice("");
      setError(null);
      setSuccess(false);
    }
  }, [isOrderModalOpen, orderSide]);

  const handlePlaceOrder = () => {
    if (!selectedStock) return;
    setError(null);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    placeOrder.mutate({
      data: {
        symbol: selectedStock.symbol,
        orderType,
        side,
        productType,
        quantity: qty,
        limitPrice: orderType === "LIMIT" ? parseFloat(limitPrice) : undefined,
      },
    }, {
      onSuccess: () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setSuccess(true);
        queryClient.invalidateQueries({ queryKey: getGetWalletQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetPositionsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetHoldingsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetPortfolioSummaryQueryKey() });
        queryClient.invalidateQueries({ queryKey: getListOrdersQueryKey() });
        setTimeout(() => closeOrderModal(), 1200);
      },
      onError: (err: unknown) => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        const msg = err instanceof Error ? err.message : "Order failed. Try again.";
        setError(msg);
      },
    });
  };

  const s = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.7)", justifyContent: "flex-end" },
    sheet: {
      backgroundColor: colors.card,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 0),
      borderTopWidth: 1,
      borderColor: colors.border,
    },
    handle: { width: 36, height: 4, backgroundColor: colors.border, borderRadius: 2, alignSelf: "center", marginTop: 10, marginBottom: 4 },
    header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderColor: colors.border },
    symbol: { fontSize: 18, fontWeight: "700" as const, color: colors.foreground, fontFamily: "Inter_700Bold" },
    price: { fontSize: 14, color: colors.mutedForeground, fontFamily: "Inter_400Regular", marginTop: 2 },
    body: { padding: 20, gap: 16 },
    label: { fontSize: 11, fontWeight: "600" as const, color: colors.mutedForeground, letterSpacing: 0.8, marginBottom: 6, fontFamily: "Inter_600SemiBold" },
    sideRow: { flexDirection: "row" as const, borderRadius: colors.radius, overflow: "hidden" as const, borderWidth: 1, borderColor: colors.border },
    sideBtn: { flex: 1, paddingVertical: 12, alignItems: "center" as const, justifyContent: "center" as const },
    sideBtnText: { fontSize: 14, fontWeight: "700" as const, fontFamily: "Inter_700Bold" },
    toggleRow: { flexDirection: "row" as const, gap: 8 },
    toggleBtn: { flex: 1, paddingVertical: 10, borderRadius: colors.radius, borderWidth: 1, alignItems: "center" as const },
    toggleText: { fontSize: 13, fontWeight: "600" as const, fontFamily: "Inter_600SemiBold" },
    qtyRow: { flexDirection: "row" as const, alignItems: "center" as const, gap: 8 },
    qtyBtn: { width: 40, height: 40, borderRadius: colors.radius, backgroundColor: colors.secondary, borderWidth: 1, borderColor: colors.border, alignItems: "center" as const, justifyContent: "center" as const },
    qtyInput: { flex: 1, height: 40, borderRadius: colors.radius, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.secondary, color: colors.foreground, textAlign: "center" as const, fontSize: 16, fontFamily: "Inter_600SemiBold", fontWeight: "600" as const },
    input: { height: 44, borderRadius: colors.radius, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.secondary, color: colors.foreground, paddingHorizontal: 14, fontSize: 15, fontFamily: "Inter_400Regular" },
    summaryBox: { backgroundColor: colors.background, borderRadius: colors.radius, padding: 14, borderWidth: 1, borderColor: colors.border, gap: 8 },
    summaryRow: { flexDirection: "row" as const, justifyContent: "space-between" as const },
    summaryLabel: { fontSize: 13, color: colors.mutedForeground, fontFamily: "Inter_400Regular" },
    summaryValue: { fontSize: 13, color: colors.foreground, fontFamily: "Inter_500Medium", fontWeight: "500" as const },
    totalLabel: { fontSize: 15, fontWeight: "700" as const, color: colors.foreground, fontFamily: "Inter_700Bold" },
    totalValue: { fontSize: 15, fontWeight: "700" as const, color: colors.primary, fontFamily: "Inter_700Bold" },
    errorText: { color: colors.loss, fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "center" as const },
    successBox: { alignItems: "center" as const, paddingVertical: 20, gap: 8 },
    successText: { fontSize: 16, fontWeight: "700" as const, color: colors.gain, fontFamily: "Inter_700Bold" },
    actionBtn: { marginHorizontal: 20, marginTop: 4, marginBottom: 8, borderRadius: colors.radius, paddingVertical: 16, alignItems: "center" as const, justifyContent: "center" as const },
    actionBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" as const, fontFamily: "Inter_700Bold" },
  });

  return (
    <Modal visible={isOrderModalOpen} transparent animationType="slide" onRequestClose={closeOrderModal}>
      <Pressable style={s.overlay} onPress={closeOrderModal}>
        <Pressable onPress={() => {}}>
          <View style={s.sheet}>
            <View style={s.handle} />
            <View style={s.header}>
              <View>
                <Text style={s.symbol}>{selectedStock?.symbol}</Text>
                <Text style={s.price}>{selectedStock?.name?.split(" ").slice(0, 3).join(" ")} · {formatINR(currentPrice)}</Text>
              </View>
              <TouchableOpacity onPress={closeOrderModal}>
                <Ionicons name="close-circle" size={26} color={colors.mutedForeground} />
              </TouchableOpacity>
            </View>

            {success ? (
              <View style={s.successBox}>
                <Ionicons name="checkmark-circle" size={52} color={colors.gain} />
                <Text style={s.successText}>Order Placed!</Text>
                <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_400Regular" }}>
                  {side} {qty} × {selectedStock?.symbol}
                </Text>
              </View>
            ) : (
              <>
                <View style={s.body}>
                  {/* Buy/Sell */}
                  <View>
                    <Text style={s.label}>SIDE</Text>
                    <View style={s.sideRow}>
                      {(["BUY", "SELL"] as const).map((opt) => (
                        <TouchableOpacity
                          key={opt}
                          style={[s.sideBtn, { backgroundColor: side === opt ? (opt === "BUY" ? colors.gain : colors.loss) : colors.secondary }]}
                          onPress={() => { setSide(opt); Haptics.selectionAsync(); }}
                        >
                          <Text style={[s.sideBtnText, { color: side === opt ? "#fff" : colors.mutedForeground }]}>{opt}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  {/* Order Type */}
                  <View>
                    <Text style={s.label}>ORDER TYPE</Text>
                    <View style={s.toggleRow}>
                      {(["MARKET", "LIMIT"] as const).map((opt) => (
                        <TouchableOpacity
                          key={opt}
                          style={[s.toggleBtn, { backgroundColor: orderType === opt ? colors.primary + "20" : colors.secondary, borderColor: orderType === opt ? colors.primary : colors.border }]}
                          onPress={() => { setOrderType(opt); Haptics.selectionAsync(); }}
                        >
                          <Text style={[s.toggleText, { color: orderType === opt ? colors.primary : colors.mutedForeground }]}>{opt}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  {/* Product Type */}
                  <View>
                    <Text style={s.label}>PRODUCT</Text>
                    <View style={s.toggleRow}>
                      {(["INTRADAY", "DELIVERY"] as const).map((opt) => (
                        <TouchableOpacity
                          key={opt}
                          style={[s.toggleBtn, { backgroundColor: productType === opt ? colors.primary + "20" : colors.secondary, borderColor: productType === opt ? colors.primary : colors.border }]}
                          onPress={() => { setProductType(opt); Haptics.selectionAsync(); }}
                        >
                          <Text style={[s.toggleText, { color: productType === opt ? colors.primary : colors.mutedForeground }]}>{opt}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  {/* Quantity */}
                  <View>
                    <Text style={s.label}>QUANTITY</Text>
                    <View style={s.qtyRow}>
                      <TouchableOpacity style={s.qtyBtn} onPress={() => { const q = Math.max(1, qty - 1); setQuantity(String(q)); Haptics.selectionAsync(); }}>
                        <Ionicons name="remove" size={20} color={colors.foreground} />
                      </TouchableOpacity>
                      <TextInput style={s.qtyInput} value={quantity} onChangeText={setQuantity} keyboardType="number-pad" placeholderTextColor={colors.mutedForeground} />
                      <TouchableOpacity style={s.qtyBtn} onPress={() => { setQuantity(String(qty + 1)); Haptics.selectionAsync(); }}>
                        <Ionicons name="add" size={20} color={colors.foreground} />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Limit Price */}
                  {orderType === "LIMIT" && (
                    <View>
                      <Text style={s.label}>LIMIT PRICE</Text>
                      <TextInput
                        style={s.input}
                        value={limitPrice}
                        onChangeText={setLimitPrice}
                        keyboardType="decimal-pad"
                        placeholder={currentPrice.toFixed(2)}
                        placeholderTextColor={colors.mutedForeground}
                      />
                    </View>
                  )}

                  {/* Summary */}
                  <View style={s.summaryBox}>
                    <View style={s.summaryRow}>
                      <Text style={s.summaryLabel}>Price</Text>
                      <Text style={s.summaryValue}>{formatINR(execPrice)}</Text>
                    </View>
                    <View style={s.summaryRow}>
                      <Text style={s.summaryLabel}>Quantity</Text>
                      <Text style={s.summaryValue}>{qty} shares</Text>
                    </View>
                    <View style={[s.summaryRow, { borderTopWidth: 1, borderColor: colors.border, paddingTop: 8 }]}>
                      <Text style={s.totalLabel}>Total</Text>
                      <Text style={s.totalValue}>{formatINR(estimatedTotal)}</Text>
                    </View>
                    <View style={s.summaryRow}>
                      <Text style={s.summaryLabel}>Available</Text>
                      <Text style={[s.summaryValue, { color: walletBalance >= estimatedTotal ? colors.gain : colors.loss }]}>
                        {formatINR(walletBalance)}
                      </Text>
                    </View>
                  </View>

                  {error && <Text style={s.errorText}>{error}</Text>}
                </View>

                <TouchableOpacity
                  style={[s.actionBtn, { backgroundColor: side === "BUY" ? colors.gain : colors.loss, opacity: placeOrder.isPending ? 0.7 : 1 }]}
                  onPress={handlePlaceOrder}
                  disabled={placeOrder.isPending}
                  activeOpacity={0.8}
                >
                  {placeOrder.isPending
                    ? <ActivityIndicator color="#fff" />
                    : <Text style={s.actionBtnText}>Place {side} Order</Text>
                  }
                </TouchableOpacity>
              </>
            )}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
