import React, { useState, useEffect, useCallback } from "react";
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  Platform, TextInput, Alert, Image, Switch, Modal, Pressable,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
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
import { API_BASE } from "@/constants/api";

function formatINR(n: number) {
  if (Math.abs(n) >= 1e7) return "₹" + (n / 1e7).toFixed(2) + " Cr";
  if (Math.abs(n) >= 1e5) return "₹" + (n / 1e5).toFixed(2) + " L";
  return "₹" + n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function getApiBase() {
  return API_BASE;
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
  const { logout, userName, userEmail, deviceId } = useAuth();
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === "web" ? 67 : insets.top;

  const queryClient = useQueryClient();
  const [name, setName] = useState(userName || "Trader");
  const [email, setEmail] = useState(userEmail || "");
  const [editingName, setEditingName] = useState(false);
  const [tempName, setTempName] = useState("");
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [resetting, setResetting] = useState(false);
  const [addingBalance, setAddingBalance] = useState(false);
  const [showPhotoPicker, setShowPhotoPicker] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const [savingPhoto, setSavingPhoto] = useState(false);

  const { data: summary } = useGetPortfolioSummary();
  const { data: wallet } = useGetWallet();
  const { data: orders } = useListOrders();

  const s = summary as Summary | undefined;
  const walletBalance = (wallet as { balance?: number })?.balance ?? 100000;
  const orderList = Array.isArray(orders) ? orders : [];
  const executedOrders = orderList.filter((o: { status: string }) => o.status === "EXECUTED");
  const winRate = executedOrders.length > 0
    ? Math.round((executedOrders.filter((o: { pnl?: number | null }) => (o.pnl ?? 0) > 0).length / executedOrders.length) * 100)
    : 0;

  const authHeaders = useCallback((): Record<string, string> => {
    const h: Record<string, string> = { "Content-Type": "application/json" };
    if (deviceId) h["x-device-id"] = deviceId;
    return h;
  }, [deviceId]);

  useEffect(() => {
    (async () => {
      if (!deviceId) return;
      try {
        const res = await fetch(`${getApiBase()}/api/user/me`, {
          headers: { "x-device-id": deviceId },
        });
        if (res.ok) {
          const data = await res.json();
          if (data.name) setName(data.name);
          if (data.email) setEmail(data.email);
          if (data.profilePhoto) setAvatarUri(data.profilePhoto);
          return;
        }
      } catch {}
      const [n, e, av] = await Promise.all([
        AsyncStorage.getItem("preeku_name"),
        AsyncStorage.getItem("preeku_email"),
        AsyncStorage.getItem("preeku_avatar"),
      ]);
      if (n) setName(n);
      if (e) setEmail(e);
      if (av) setAvatarUri(av);
    })();
  }, [deviceId]);

  const saveNameToDb = async (newName: string) => {
    try {
      await fetch(`${getApiBase()}/api/user/me`, {
        method: "PATCH",
        headers: authHeaders(),
        body: JSON.stringify({ name: newName }),
      });
    } catch {}
    await AsyncStorage.setItem("preeku_name", newName);
  };

  const savePhotoToDb = async (dataUrl: string | null) => {
    setSavingPhoto(true);
    try {
      await fetch(`${getApiBase()}/api/user/me`, {
        method: "PATCH",
        headers: authHeaders(),
        body: JSON.stringify({ profilePhoto: dataUrl }),
      });
      setAvatarUri(dataUrl);
      if (dataUrl) {
        await AsyncStorage.setItem("preeku_avatar", dataUrl);
      } else {
        await AsyncStorage.removeItem("preeku_avatar");
      }
    } catch {
      setAvatarUri(dataUrl);
      if (dataUrl) await AsyncStorage.setItem("preeku_avatar", dataUrl);
      else await AsyncStorage.removeItem("preeku_avatar");
    } finally {
      setSavingPhoto(false);
    }
  };

  const saveName = () => {
    const trimmed = tempName.trim();
    if (trimmed) {
      setName(trimmed);
      saveNameToDb(trimmed);
    }
    setEditingName(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleReset = async () => {
    setResetting(true);
    try {
      const res = await fetch(`${getApiBase()}/api/account/reset`, {
        method: "POST",
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error("Reset failed");
      await queryClient.invalidateQueries({ queryKey: getGetWalletQueryKey() });
      await queryClient.invalidateQueries({ queryKey: getGetPortfolioSummaryQueryKey() });
      await queryClient.invalidateQueries({ queryKey: getGetPositionsQueryKey() });
      await queryClient.invalidateQueries({ queryKey: getGetHoldingsQueryKey() });
      await queryClient.invalidateQueries({ queryKey: getListOrdersQueryKey() });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Account Reset", "Your wallet has been reset to ₹1,00,000 and all positions cleared.");
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
              const res = await fetch(`${getApiBase()}/api/wallet/add-balance`, {
                method: "POST",
                headers: authHeaders(),
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
    const result = await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [1, 1], quality: 0.6, base64: true });
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      const mime = asset.mimeType ?? "image/jpeg";
      const dataUrl = asset.base64 ? `data:${mime};base64,${asset.base64}` : asset.uri;
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await savePhotoToDb(dataUrl);
    }
  };

  const pickFromGallery = async () => {
    setShowPhotoPicker(false);
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) { Alert.alert("Permission needed", "Allow gallery access to pick a photo."); return; }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: "images", allowsEditing: true, aspect: [1, 1], quality: 0.6, base64: true });
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      const mime = asset.mimeType ?? "image/jpeg";
      const dataUrl = asset.base64 ? `data:${mime};base64,${asset.base64}` : asset.uri;
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await savePhotoToDb(dataUrl);
    }
  };

  const removePhoto = async () => {
    setShowPhotoPicker(false);
    Haptics.selectionAsync();
    await savePhotoToDb(null);
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
          <TouchableOpacity onPress={pickAvatar} activeOpacity={0.8} style={{ position: "relative" as const }} disabled={savingPhoto}>
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
              backgroundColor: savingPhoto ? colors.mutedForeground : colors.primary,
              borderWidth: 2, borderColor: colors.card,
              alignItems: "center" as const, justifyContent: "center" as const,
            }}>
              <Ionicons name={savingPhoto ? "sync" : "camera"} size={12} color="#fff" />
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

        {/* Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SETTINGS</Text>
          <View style={styles.menuCard}>
            <View style={[styles.menuRow, { borderBottomWidth: 1, borderColor: colors.border }]}>
              <View style={[styles.menuIcon, { backgroundColor: (isDark ? "#818cf8" : "#f59e0b") + "18" }]}>
                <Ionicons name={isDark ? "moon" : "sunny"} size={20} color={isDark ? "#818cf8" : "#f59e0b"} />
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
                  Alert.alert("Reset Account", "This will reset your wallet to ₹1,00,000 and clear all positions and orders. Are you sure?", [
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

      {/* Photo Picker Bottom Sheet */}
      <Modal visible={showPhotoPicker} transparent animationType="slide" onRequestClose={() => setShowPhotoPicker(false)}>
        <Pressable style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" }} onPress={() => setShowPhotoPicker(false)}>
          <Pressable onPress={(e) => e.stopPropagation()}>
            <View style={{
              backgroundColor: colors.card, borderTopLeftRadius: 24, borderTopRightRadius: 24,
              paddingBottom: insets.bottom + 16, paddingTop: 8,
            }}>
              <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: colors.border, alignSelf: "center", marginBottom: 16 }} />
              <Text style={{ textAlign: "center", fontSize: 16, fontWeight: "700", color: colors.foreground, fontFamily: "Inter_700Bold", marginBottom: 16 }}>
                Profile Photo
              </Text>

              {[
                { icon: "camera-outline", label: "Take Photo", color: colors.primary, onPress: pickFromCamera },
                { icon: "images-outline", label: "Choose from Gallery", color: colors.primary, onPress: pickFromGallery },
                ...(avatarUri ? [{ icon: "trash-outline", label: "Remove Photo", color: "#ef4444", onPress: removePhoto }] : []),
              ].map(({ icon, label, color, onPress }, idx) => (
                <TouchableOpacity
                  key={idx}
                  onPress={onPress}
                  activeOpacity={0.7}
                  style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 24, paddingVertical: 14, gap: 14 }}
                >
                  <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: color + "15", alignItems: "center", justifyContent: "center" }}>
                    <Ionicons name={icon as keyof typeof Ionicons.glyphMap} size={22} color={color} />
                  </View>
                  <Text style={{ fontSize: 16, color: color === "#ef4444" ? color : colors.foreground, fontFamily: "Inter_500Medium", fontWeight: "500" }}>
                    {label}
                  </Text>
                </TouchableOpacity>
              ))}

              <TouchableOpacity
                onPress={() => setShowPhotoPicker(false)}
                style={{ marginHorizontal: 16, marginTop: 8, paddingVertical: 14, backgroundColor: colors.background, borderRadius: 14, alignItems: "center" }}
              >
                <Text style={{ color: colors.mutedForeground, fontSize: 15, fontFamily: "Inter_500Medium", fontWeight: "500" }}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Logout Confirmation */}
      <Modal visible={showLogout} transparent animationType="fade" onRequestClose={() => setShowLogout(false)}>
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <View style={{ backgroundColor: colors.card, borderRadius: 20, padding: 24, width: "100%", maxWidth: 340, borderWidth: 1, borderColor: colors.border }}>
            <View style={{ alignItems: "center", marginBottom: 16 }}>
              <View style={{ width: 56, height: 56, borderRadius: 16, backgroundColor: "#ef444415", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
                <Ionicons name="log-out-outline" size={28} color="#ef4444" />
              </View>
              <Text style={{ fontSize: 18, fontWeight: "700", color: colors.foreground, fontFamily: "Inter_700Bold", marginBottom: 6 }}>Log Out?</Text>
              <Text style={{ fontSize: 14, color: colors.mutedForeground, fontFamily: "Inter_400Regular", textAlign: "center" }}>
                Your portfolio and trading history will be saved.
              </Text>
            </View>
            <View style={{ flexDirection: "row", gap: 10 }}>
              <TouchableOpacity
                onPress={() => setShowLogout(false)}
                activeOpacity={0.8}
                style={{ flex: 1, paddingVertical: 13, borderRadius: 12, backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border, alignItems: "center" }}
              >
                <Text style={{ fontSize: 15, fontWeight: "600", color: colors.foreground, fontFamily: "Inter_600SemiBold" }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => { setShowLogout(false); logout(); }}
                activeOpacity={0.8}
                style={{ flex: 1, paddingVertical: 13, borderRadius: 12, backgroundColor: "#ef4444", alignItems: "center" }}
              >
                <Text style={{ fontSize: 15, fontWeight: "600", color: "#fff", fontFamily: "Inter_600SemiBold" }}>Log Out</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
