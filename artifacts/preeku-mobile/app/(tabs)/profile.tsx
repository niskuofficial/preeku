import React, { useState, useEffect } from "react";
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  Platform, TextInput, Alert, Image,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import { useQueryClient } from "@tanstack/react-query";
import {
  useGetPortfolioSummary, useGetWallet, useListOrders,
  getGetPortfolioSummaryQueryKey, getGetWalletQueryKey,
  getGetPositionsQueryKey, getGetHoldingsQueryKey, getListOrdersQueryKey,
} from "@workspace/api-client-react";
import { useColors } from "@/hooks/useColors";

function formatINR(n: number) {
  if (Math.abs(n) >= 1e7) return "₹" + (n / 1e7).toFixed(2) + " Cr";
  if (Math.abs(n) >= 1e5) return "₹" + (n / 1e5).toFixed(2) + " L";
  return "₹" + n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

interface Summary {
  walletBalance: number; currentValue: number; totalPnl: number;
  totalPnlPercent: number; dayPnl: number; totalInvested: number;
  openPositions: number; totalHoldings: number;
}

const MEMBER_SINCE = "Jan 2025";
const BROKER_ID = "PREEKU" + Math.floor(Math.random() * 900000 + 100000);

function StatCard({ icon, label, value, color, colors }: {
  icon: string; label: string; value: string; color: string;
  colors: ReturnType<typeof useColors>;
}) {
  return (
    <View style={{ flex: 1, backgroundColor: colors.card, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: colors.border, alignItems: "center" as const, gap: 6 }}>
      <View style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: color + "20", alignItems: "center" as const, justifyContent: "center" as const }}>
        <Ionicons name={icon as keyof typeof Ionicons.glyphMap} size={20} color={color} />
      </View>
      <Text style={{ fontSize: 16, fontWeight: "700" as const, color: colors.foreground, fontFamily: "Inter_700Bold" }}>{value}</Text>
      <Text style={{ fontSize: 11, color: colors.mutedForeground, fontFamily: "Inter_400Regular", textAlign: "center" as const }}>{label}</Text>
    </View>
  );
}

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === "web" ? 67 : insets.top;

  const queryClient = useQueryClient();
  const [name, setName] = useState("Trader");
  const [email, setEmail] = useState("trader@preeku.in");
  const [editingName, setEditingName] = useState(false);
  const [tempName, setTempName] = useState("");
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [resetting, setResetting] = useState(false);

  const { data: summary } = useGetPortfolioSummary();
  const { data: wallet } = useGetWallet();
  const { data: orders } = useListOrders();

  const s = summary as Summary | undefined;
  const walletBalance = (wallet as { balance?: number })?.balance ?? 1000000;
  const orderList = Array.isArray(orders) ? orders : [];
  const executedOrders = orderList.filter((o: { status: string }) => o.status === "EXECUTED");
  const winRate = executedOrders.length > 0
    ? Math.round((executedOrders.filter((o: { pnl?: number | null }) => (o.pnl ?? 0) > 0).length / executedOrders.length) * 100)
    : 0;

  useEffect(() => {
    AsyncStorage.getItem("preeku_name").then((v) => { if (v) setName(v); });
    AsyncStorage.getItem("preeku_email").then((v) => { if (v) setEmail(v); });
    AsyncStorage.getItem("preeku_avatar").then((v) => { if (v) setAvatarUri(v); });
  }, []);

  const saveName = () => {
    const trimmed = tempName.trim();
    if (trimmed) {
      setName(trimmed);
      AsyncStorage.setItem("preeku_name", trimmed);
    }
    setEditingName(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleReset = async () => {
    setResetting(true);
    try {
      const domain = process.env.EXPO_PUBLIC_DOMAIN;
      const baseUrl = domain ? `https://${domain}` : "http://localhost:8080";
      const res = await fetch(`${baseUrl}/api/account/reset`, { method: "POST" });
      if (!res.ok) throw new Error("Reset failed");
      await queryClient.invalidateQueries({ queryKey: getGetWalletQueryKey() });
      await queryClient.invalidateQueries({ queryKey: getGetPortfolioSummaryQueryKey() });
      await queryClient.invalidateQueries({ queryKey: getGetPositionsQueryKey() });
      await queryClient.invalidateQueries({ queryKey: getGetHoldingsQueryKey() });
      await queryClient.invalidateQueries({ queryKey: getListOrdersQueryKey() });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Account Reset", "Your wallet has been reset to ₹10,00,000 and all positions cleared.");
    } catch {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Error", "Could not reset account. Please try again.");
    } finally {
      setResetting(false);
    }
  };

  const pickAvatar = () => {
    Alert.alert("Profile Photo", "Choose an option", [
      {
        text: "Camera",
        onPress: async () => {
          const perm = await ImagePicker.requestCameraPermissionsAsync();
          if (!perm.granted) { Alert.alert("Permission needed", "Allow camera access to take a photo."); return; }
          const result = await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [1, 1], quality: 0.7 });
          if (!result.canceled && result.assets[0]) {
            setAvatarUri(result.assets[0].uri);
            AsyncStorage.setItem("preeku_avatar", result.assets[0].uri);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          }
        },
      },
      {
        text: "Choose from Gallery",
        onPress: async () => {
          const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (!perm.granted) { Alert.alert("Permission needed", "Allow gallery access to pick a photo."); return; }
          const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: "images", allowsEditing: true, aspect: [1, 1], quality: 0.7 });
          if (!result.canceled && result.assets[0]) {
            setAvatarUri(result.assets[0].uri);
            AsyncStorage.setItem("preeku_avatar", result.assets[0].uri);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          }
        },
      },
      { text: "Remove Photo", style: "destructive", onPress: () => { setAvatarUri(null); AsyncStorage.removeItem("preeku_avatar"); } },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const initials = name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase();

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: { paddingTop: topInset + 12, paddingHorizontal: 20, paddingBottom: 16 },
    title: { fontSize: 22, fontWeight: "700" as const, color: colors.foreground, fontFamily: "Inter_700Bold" },
    profileCard: {
      marginHorizontal: 16, marginBottom: 16,
      backgroundColor: colors.card, borderRadius: 18,
      padding: 20, borderWidth: 1, borderColor: colors.border,
      flexDirection: "row" as const, alignItems: "center" as const, gap: 16,
    },
    avatar: {
      width: 64, height: 64, borderRadius: 20,
      backgroundColor: colors.primary,
      alignItems: "center" as const, justifyContent: "center" as const,
    },
    avatarText: { color: "#fff", fontSize: 24, fontWeight: "700" as const, fontFamily: "Inter_700Bold" },
    nameRow: { flex: 1 },
    nameText: { fontSize: 20, fontWeight: "700" as const, color: colors.foreground, fontFamily: "Inter_700Bold" },
    emailText: { fontSize: 13, color: colors.mutedForeground, fontFamily: "Inter_400Regular", marginTop: 3 },
    memberChip: { flexDirection: "row" as const, alignItems: "center" as const, gap: 4, backgroundColor: colors.primary + "18", borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, marginTop: 6, alignSelf: "flex-start" as const },
    memberText: { fontSize: 11, color: colors.primary, fontFamily: "Inter_600SemiBold", fontWeight: "600" as const },
    section: { marginHorizontal: 16, marginBottom: 16 },
    sectionTitle: { fontSize: 13, fontWeight: "700" as const, color: colors.mutedForeground, letterSpacing: 0.8, fontFamily: "Inter_700Bold", marginBottom: 10 },
    statsRow: { flexDirection: "row" as const, gap: 10, marginBottom: 10 },
    accountCard: { backgroundColor: colors.card, borderRadius: 14, borderWidth: 1, borderColor: colors.border, padding: 16 },
    accountRow: { flexDirection: "row" as const, justifyContent: "space-between" as const, alignItems: "center" as const, paddingVertical: 12, borderBottomWidth: 1, borderColor: colors.border },
    accountLabel: { fontSize: 14, color: colors.mutedForeground, fontFamily: "Inter_400Regular" },
    accountValue: { fontSize: 14, fontWeight: "600" as const, color: colors.foreground, fontFamily: "Inter_600SemiBold" },
    menuCard: { backgroundColor: colors.card, borderRadius: 14, borderWidth: 1, borderColor: colors.border, overflow: "hidden" as const },
    menuRow: { flexDirection: "row" as const, alignItems: "center" as const, justifyContent: "space-between" as const, paddingHorizontal: 16, paddingVertical: 16, borderBottomWidth: 1, borderColor: colors.border },
    menuIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center" as const, justifyContent: "center" as const, marginRight: 12 },
    menuLabel: { fontSize: 15, color: colors.foreground, fontFamily: "Inter_500Medium", fontWeight: "500" as const, flex: 1 },
    nameInput: { fontSize: 20, fontWeight: "700" as const, color: colors.foreground, fontFamily: "Inter_700Bold", borderBottomWidth: 2, borderColor: colors.primary, paddingVertical: 2 },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Account</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: Platform.OS === "web" ? 100 : 100 }}>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <TouchableOpacity onPress={pickAvatar} activeOpacity={0.8} style={{ position: "relative" as const }}>
            <View style={styles.avatar}>
              {avatarUri ? (
                <Image source={{ uri: avatarUri }} style={{ width: 64, height: 64, borderRadius: 20 }} />
              ) : (
                <Text style={styles.avatarText}>{initials}</Text>
              )}
            </View>
            <View style={{
              position: "absolute" as const, bottom: -4, right: -4,
              width: 24, height: 24, borderRadius: 12,
              backgroundColor: colors.primary, borderWidth: 2, borderColor: colors.card,
              alignItems: "center" as const, justifyContent: "center" as const,
            }}>
              <Ionicons name="camera" size={12} color="#fff" />
            </View>
          </TouchableOpacity>
          <View style={styles.nameRow}>
            {editingName ? (
              <View style={{ flexDirection: "row" as const, alignItems: "center" as const, gap: 8 }}>
                <TextInput
                  style={styles.nameInput}
                  value={tempName}
                  onChangeText={setTempName}
                  onSubmitEditing={saveName}
                  autoFocus
                  selectTextOnFocus
                  placeholder={name}
                  placeholderTextColor={colors.mutedForeground}
                />
                <TouchableOpacity onPress={saveName}>
                  <Ionicons name="checkmark-circle" size={26} color={colors.primary} />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={{ flexDirection: "row" as const, alignItems: "center" as const, gap: 8 }}
                onPress={() => { setTempName(name); setEditingName(true); }}
                activeOpacity={0.7}
              >
                <Text style={styles.nameText}>{name}</Text>
                <Ionicons name="pencil" size={14} color={colors.mutedForeground} />
              </TouchableOpacity>
            )}
            <Text style={styles.emailText}>{email}</Text>
            <View style={styles.memberChip}>
              <Ionicons name="shield-checkmark" size={11} color={colors.primary} />
              <Text style={styles.memberText}>Member since {MEMBER_SINCE}</Text>
            </View>
          </View>
        </View>

        {/* Trading Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>TRADING STATS</Text>
          <View style={styles.statsRow}>
            <StatCard icon="trending-up" label="Total P&L" value={formatINR(s?.totalPnl ?? 0)} color={(s?.totalPnl ?? 0) >= 0 ? colors.gain : colors.loss} colors={colors} />
            <StatCard icon="wallet" label="Balance" value={formatINR(walletBalance)} color={colors.primary} colors={colors} />
          </View>
          <View style={styles.statsRow}>
            <StatCard icon="receipt" label="Total Orders" value={String(orderList.length)} color="#f59e0b" colors={colors} />
            <StatCard icon="trophy" label="Win Rate" value={`${winRate}%`} color={winRate >= 50 ? colors.gain : colors.loss} colors={colors} />
          </View>
          <View style={styles.statsRow}>
            <StatCard icon="briefcase" label="Holdings" value={String(s?.totalHoldings ?? 0)} color={colors.primary} colors={colors} />
            <StatCard icon="stats-chart" label="Positions" value={String(s?.openPositions ?? 0)} color="#8b5cf6" colors={colors} />
          </View>
        </View>

        {/* Account Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ACCOUNT DETAILS</Text>
          <View style={styles.accountCard}>
            {[
              { label: "Client ID", value: BROKER_ID },
              { label: "Account Type", value: "Trading & Investing" },
              { label: "Segment", value: "NSE · BSE · Equity" },
              { label: "Initial Capital", value: "₹10,00,000" },
              { label: "KYC Status", value: "Verified ✓" },
              { label: "Plan", value: "Free Forever" },
            ].map(({ label, value }, idx, arr) => (
              <View key={label} style={[styles.accountRow, idx === arr.length - 1 && { borderBottomWidth: 0 }]}>
                <Text style={styles.accountLabel}>{label}</Text>
                <Text style={[styles.accountValue, value.includes("✓") && { color: colors.gain }]}>{value}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Performance */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PERFORMANCE</Text>
          <View style={styles.accountCard}>
            {[
              { label: "Invested Amount", value: formatINR(s?.totalInvested ?? 0) },
              { label: "Current Value", value: formatINR(s?.currentValue ?? 0) },
              { label: "Overall Return", value: ((s?.totalPnlPercent ?? 0) >= 0 ? "+" : "") + (s?.totalPnlPercent ?? 0).toFixed(2) + "%", pnl: s?.totalPnlPercent },
              { label: "Day's P&L", value: formatINR(s?.dayPnl ?? 0), pnl: s?.dayPnl },
              { label: "Executed Trades", value: String(executedOrders.length) },
            ].map(({ label, value, pnl }, idx, arr) => (
              <View key={label} style={[styles.accountRow, idx === arr.length - 1 && { borderBottomWidth: 0 }]}>
                <Text style={styles.accountLabel}>{label}</Text>
                <Text style={[styles.accountValue, { color: pnl !== undefined ? ((pnl ?? 0) >= 0 ? colors.gain : colors.loss) : colors.foreground }]}>
                  {value}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SETTINGS</Text>
          <View style={styles.menuCard}>
            {[
              { icon: "notifications-outline", label: "Notifications", color: "#f59e0b", onPress: () => {} },
              { icon: "help-circle-outline", label: "Help & Support", color: colors.primary, onPress: () => {} },
              { icon: "information-circle-outline", label: "About Preeku", color: "#6d84a2", onPress: () => {} },
              {
                icon: "refresh-outline", label: resetting ? "Resetting…" : "Reset Account", color: colors.loss,
                onPress: () => {
                  if (resetting) return;
                  Alert.alert("Reset Account", "This will reset your wallet to ₹10,00,000 and clear all positions and orders. Are you sure?", [
                    { text: "Cancel", style: "cancel" },
                    { text: "Reset", style: "destructive", onPress: handleReset },
                  ]);
                }
              },
            ].map(({ icon, label, color, onPress }, idx, arr) => (
              <TouchableOpacity
                key={idx}
                style={[styles.menuRow, idx === arr.length - 1 && { borderBottomWidth: 0 }]}
                onPress={() => { Haptics.selectionAsync(); onPress(); }}
                activeOpacity={0.7}
              >
                <View style={[styles.menuIcon, { backgroundColor: color + "18" }]}>
                  <Ionicons name={icon as keyof typeof Ionicons.glyphMap} size={20} color={color} />
                </View>
                <Text style={styles.menuLabel}>{label}</Text>
                <Ionicons name="chevron-forward" size={16} color={colors.mutedForeground} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <Text style={{ textAlign: "center" as const, color: colors.mutedForeground, fontSize: 12, fontFamily: "Inter_400Regular", paddingBottom: 8 }}>
          Preeku Trading v1.0 
        </Text>
      </ScrollView>
    </View>
  );
}
