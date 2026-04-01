import React, { useState, useEffect } from "react";
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  Platform, TextInput, Alert, Image, Switch, Modal, Pressable,
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
import { useAppTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";

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
  const { resolvedTheme, toggleTheme } = useAppTheme();
  const isDark = resolvedTheme === "dark";
  const { logout, userName, userEmail } = useAuth();
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === "web" ? 67 : insets.top;

  const queryClient = useQueryClient();
  const [name, setName] = useState(userName || "Trader");
  const [email, setEmail] = useState(userEmail || "trader@preeku.in");
  const [editingName, setEditingName] = useState(false);
  const [tempName, setTempName] = useState("");
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [resetting, setResetting] = useState(false);
  const [addingBalance, setAddingBalance] = useState(false);
  const [showPhotoPicker, setShowPhotoPicker] = useState(false);
  const [showLogout, setShowLogout] = useState(false);

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

  const handleAddBalance = (amount: number) => {
    Alert.alert(
      "Add Funds",
      `Add ₹${amount.toLocaleString("en-IN")} to your wallet?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Add",
          onPress: async () => {
            setAddingBalance(true);
            try {
              const domain = process.env.EXPO_PUBLIC_DOMAIN;
              const baseUrl = domain ? `https://${domain}` : "http://localhost:8080";
              const res = await fetch(`${baseUrl}/api/wallet/add-balance`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ amount }),
              });
              if (!res.ok) throw new Error("Failed");
              await queryClient.invalidateQueries({ queryKey: getGetWalletQueryKey() });
              await queryClient.invalidateQueries({ queryKey: getGetPortfolioSummaryQueryKey() });
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } catch {
              Alert.alert("Error", "Could not add funds. Try again.");
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            } finally {
              setAddingBalance(false);
            }
          },
        },
      ]
    );
  };

  const pickAvatar = () => {
    Haptics.selectionAsync();
    setShowPhotoPicker(true);
  };

  const pickFromCamera = async () => {
    setShowPhotoPicker(false);
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) { Alert.alert("Permission needed", "Allow camera access to take a photo."); return; }
    const result = await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [1, 1], quality: 0.7 });
    if (!result.canceled && result.assets[0]) {
      setAvatarUri(result.assets[0].uri);
      AsyncStorage.setItem("preeku_avatar", result.assets[0].uri);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const pickFromGallery = async () => {
    setShowPhotoPicker(false);
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) { Alert.alert("Permission needed", "Allow gallery access to pick a photo."); return; }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: "images", allowsEditing: true, aspect: [1, 1], quality: 0.7 });
    if (!result.canceled && result.assets[0]) {
      setAvatarUri(result.assets[0].uri);
      AsyncStorage.setItem("preeku_avatar", result.assets[0].uri);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const removePhoto = () => {
    setShowPhotoPicker(false);
    setAvatarUri(null);
    AsyncStorage.removeItem("preeku_avatar");
    Haptics.selectionAsync();
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
    nameInput: { fontSize: 20, fontWeight: "700" as const, color: colors.foreground, fontFamily: "Inter_700Bold", borderBottomWidth: 2, borderColor: colors.primary, paddingVertical: 4, minWidth: 160, flex: 1 },
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
              <View style={{ flexDirection: "row" as const, alignItems: "center" as const, gap: 8, flex: 1 }}>
                <TextInput
                  style={styles.nameInput}
                  value={tempName}
                  onChangeText={setTempName}
                  onSubmitEditing={saveName}
                  returnKeyType="done"
                  autoFocus
                  selectTextOnFocus
                  placeholder="Enter your name"
                  placeholderTextColor={colors.mutedForeground}
                />
                <TouchableOpacity onPress={saveName} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Ionicons name="checkmark-circle" size={28} color={colors.primary} />
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

          {/* Wallet Balance Card — full width */}
          <View style={{ backgroundColor: colors.card, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: colors.border, marginBottom: 10 }}>
            <View style={{ flexDirection: "row" as const, alignItems: "center" as const, justifyContent: "space-between" as const, marginBottom: 10 }}>
              <View style={{ flexDirection: "row" as const, alignItems: "center" as const, gap: 8 }}>
                <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: colors.primary + "20", alignItems: "center" as const, justifyContent: "center" as const }}>
                  <Ionicons name="wallet" size={18} color={colors.primary} />
                </View>
                <View>
                  <Text style={{ fontSize: 11, color: colors.mutedForeground, fontFamily: "Inter_400Regular" }}>Wallet Balance</Text>
                  <Text style={{ fontSize: 20, fontWeight: "700" as const, color: colors.foreground, fontFamily: "Inter_700Bold" }}>
                    {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(walletBalance)}
                  </Text>
                </View>
              </View>
            </View>
            <Text style={{ fontSize: 11, color: colors.mutedForeground, fontFamily: "Inter_400Regular", marginBottom: 8 }}>Add funds to your wallet</Text>
            <View style={{ flexDirection: "row" as const, gap: 8 }}>
              {[50000, 100000, 200000, 500000].map((amt) => (
                <TouchableOpacity
                  key={amt}
                  onPress={() => { Haptics.selectionAsync(); handleAddBalance(amt); }}
                  disabled={addingBalance}
                  style={{ flex: 1, backgroundColor: colors.primary + "15", borderRadius: 8, paddingVertical: 7, borderWidth: 1, borderColor: colors.primary + "30", alignItems: "center" as const }}
                >
                  <Text style={{ color: colors.primary, fontSize: 11, fontWeight: "600" as const, fontFamily: "Inter_600SemiBold" }}>
                    +{amt >= 100000 ? (amt / 100000) + "L" : (amt / 1000) + "K"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
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
              { label: "Initial Capital", value: "₹1,00,000" },
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
            {/* Theme Toggle */}
            <View style={[styles.menuRow, { borderBottomWidth: 1, borderColor: colors.border }]}>
              <View style={[styles.menuIcon, { backgroundColor: (isDark ? "#818cf8" : "#f59e0b") + "18" }]}>
                <Ionicons
                  name={isDark ? "moon" : "sunny"}
                  size={20}
                  color={isDark ? "#818cf8" : "#f59e0b"}
                />
              </View>
              <Text style={styles.menuLabel}>{isDark ? "Dark Mode" : "Light Mode"}</Text>
              <Switch
                value={isDark}
                onValueChange={() => { Haptics.selectionAsync(); toggleTheme(); }}
                trackColor={{ false: colors.border, true: colors.primary + "80" }}
                thumbColor={isDark ? colors.primary : "#e5e7eb"}
              />
            </View>

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

        {/* Logout Button */}
        <View style={{ marginHorizontal: 16, marginBottom: 16 }}>
          <TouchableOpacity
            onPress={() => { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning); setShowLogout(true); }}
            activeOpacity={0.8}
            style={{
              flexDirection: "row" as const, alignItems: "center" as const,
              justifyContent: "center" as const, gap: 10,
              backgroundColor: "#ef444418", borderWidth: 1, borderColor: "#ef444440",
              borderRadius: 14, paddingVertical: 15,
            }}
          >
            <Ionicons name="log-out-outline" size={20} color="#ef4444" />
            <Text style={{ fontSize: 15, fontWeight: "600" as const, color: "#ef4444", fontFamily: "Inter_600SemiBold" }}>
              Log Out
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={{ textAlign: "center" as const, color: colors.mutedForeground, fontSize: 12, fontFamily: "Inter_400Regular", paddingBottom: 8 }}>
          Preeku Version 1.1.0
        </Text>
      </ScrollView>

      {/* ── Custom Photo Picker Bottom Sheet ── */}
      <Modal visible={showPhotoPicker} transparent animationType="slide" onRequestClose={() => setShowPhotoPicker(false)}>
        <Pressable style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" }} onPress={() => setShowPhotoPicker(false)}>
          <Pressable onPress={(e) => e.stopPropagation()}>
            <View style={{
              backgroundColor: colors.card, borderTopLeftRadius: 24, borderTopRightRadius: 24,
              paddingBottom: insets.bottom + 16, paddingTop: 8,
              borderTopWidth: 1, borderColor: colors.border,
            }}>
              {/* Handle bar */}
              <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: colors.border, alignSelf: "center", marginBottom: 20 }} />

              {/* Header */}
              <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 20, marginBottom: 20 }}>
                <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: colors.primary + "18", alignItems: "center", justifyContent: "center" }}>
                  <Ionicons name="camera" size={22} color={colors.primary} />
                </View>
                <View>
                  <Text style={{ fontSize: 17, fontWeight: "700", color: colors.foreground, fontFamily: "Inter_700Bold" }}>Profile Photo</Text>
                  <Text style={{ fontSize: 12, color: colors.mutedForeground, fontFamily: "Inter_400Regular", marginTop: 1 }}>Choose how to update your photo</Text>
                </View>
              </View>

              {/* Options */}
              <View style={{ marginHorizontal: 16, gap: 8 }}>
                <TouchableOpacity
                  onPress={pickFromCamera}
                  activeOpacity={0.7}
                  style={{ flexDirection: "row", alignItems: "center", gap: 14, backgroundColor: colors.primary + "12", borderRadius: 14, paddingHorizontal: 18, paddingVertical: 16, borderWidth: 1, borderColor: colors.primary + "25" }}
                >
                  <View style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: colors.primary + "20", alignItems: "center", justifyContent: "center" }}>
                    <Ionicons name="camera-outline" size={20} color={colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 15, fontWeight: "600", color: colors.foreground, fontFamily: "Inter_600SemiBold" }}>Take Photo</Text>
                    <Text style={{ fontSize: 12, color: colors.mutedForeground, fontFamily: "Inter_400Regular", marginTop: 1 }}>Use camera to click a new photo</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={colors.primary} />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={pickFromGallery}
                  activeOpacity={0.7}
                  style={{ flexDirection: "row", alignItems: "center", gap: 14, backgroundColor: colors.card, borderRadius: 14, paddingHorizontal: 18, paddingVertical: 16, borderWidth: 1, borderColor: colors.border }}
                >
                  <View style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: "#8b5cf618", alignItems: "center", justifyContent: "center" }}>
                    <Ionicons name="images-outline" size={20} color="#8b5cf6" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 15, fontWeight: "600", color: colors.foreground, fontFamily: "Inter_600SemiBold" }}>Choose from Gallery</Text>
                    <Text style={{ fontSize: 12, color: colors.mutedForeground, fontFamily: "Inter_400Regular", marginTop: 1 }}>Pick an existing photo</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={colors.mutedForeground} />
                </TouchableOpacity>

                {avatarUri && (
                  <TouchableOpacity
                    onPress={removePhoto}
                    activeOpacity={0.7}
                    style={{ flexDirection: "row", alignItems: "center", gap: 14, backgroundColor: "#ef444410", borderRadius: 14, paddingHorizontal: 18, paddingVertical: 16, borderWidth: 1, borderColor: "#ef444425" }}
                  >
                    <View style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: "#ef444420", alignItems: "center", justifyContent: "center" }}>
                      <Ionicons name="trash-outline" size={20} color="#ef4444" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 15, fontWeight: "600", color: "#ef4444", fontFamily: "Inter_600SemiBold" }}>Remove Photo</Text>
                      <Text style={{ fontSize: 12, color: colors.mutedForeground, fontFamily: "Inter_400Regular", marginTop: 1 }}>Revert to initials avatar</Text>
                    </View>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  onPress={() => setShowPhotoPicker(false)}
                  activeOpacity={0.7}
                  style={{ backgroundColor: colors.background, borderRadius: 14, paddingVertical: 15, alignItems: "center", borderWidth: 1, borderColor: colors.border }}
                >
                  <Text style={{ fontSize: 15, fontWeight: "600", color: colors.mutedForeground, fontFamily: "Inter_600SemiBold" }}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* ── Custom Logout Confirmation Modal ── */}
      <Modal visible={showLogout} transparent animationType="fade" onRequestClose={() => setShowLogout(false)}>
        <Pressable style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)", alignItems: "center", justifyContent: "center", padding: 24 }} onPress={() => setShowLogout(false)}>
          <Pressable onPress={(e) => e.stopPropagation()}>
            <View style={{ backgroundColor: colors.card, borderRadius: 20, padding: 24, width: "100%", borderWidth: 1, borderColor: colors.border }}>
              {/* Icon */}
              <View style={{ width: 60, height: 60, borderRadius: 18, backgroundColor: "#ef444415", alignItems: "center", justifyContent: "center", alignSelf: "center", marginBottom: 16 }}>
                <Ionicons name="log-out-outline" size={28} color="#ef4444" />
              </View>

              <Text style={{ fontSize: 20, fontWeight: "700", color: colors.foreground, fontFamily: "Inter_700Bold", textAlign: "center", marginBottom: 8 }}>Log Out?</Text>
              <Text style={{ fontSize: 14, color: colors.mutedForeground, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 20, marginBottom: 24 }}>
                You will be logged out of your Preeku account. Your data will remain safe.
              </Text>

              <View style={{ gap: 10 }}>
                <TouchableOpacity
                  onPress={async () => {
                    setShowLogout(false);
                    await logout();
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                  }}
                  activeOpacity={0.8}
                  style={{ backgroundColor: "#ef4444", borderRadius: 14, paddingVertical: 14, alignItems: "center" }}
                >
                  <Text style={{ fontSize: 15, fontWeight: "700", color: "#fff", fontFamily: "Inter_700Bold" }}>Yes, Log Out</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setShowLogout(false)}
                  activeOpacity={0.7}
                  style={{ backgroundColor: colors.background, borderRadius: 14, paddingVertical: 14, alignItems: "center", borderWidth: 1, borderColor: colors.border }}
                >
                  <Text style={{ fontSize: 15, fontWeight: "600", color: colors.foreground, fontFamily: "Inter_600SemiBold" }}>Cancel</Text>
                </TouchableOpacity>
              </View>

              <Text style={{ fontSize: 11, color: colors.mutedForeground, textAlign: "center", marginTop: 14, fontFamily: "Inter_400Regular" }}>
                Preeku Version 1.1.0
              </Text>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
