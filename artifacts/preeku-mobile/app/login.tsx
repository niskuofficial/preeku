import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";

export default function LoginScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { login } = useAuth();

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const isValid = email.trim().length > 3 && password.length >= 4 &&
    (mode === "login" || name.trim().length >= 2);

  const handleSubmit = async () => {
    if (!isValid) return;
    Haptics.selectionAsync();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 700));
    try {
      const displayName = mode === "signup" ? name.trim() : (email.split("@")[0] || "Trader");
      await login(displayName, email.trim().toLowerCase());
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Error", "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20, paddingHorizontal: 24 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo / Header */}
          <View style={{ alignItems: "center", marginBottom: 48, marginTop: 24 }}>
            <View style={{
              width: 72, height: 72, borderRadius: 22, backgroundColor: colors.primary,
              alignItems: "center", justifyContent: "center", marginBottom: 20,
            }}>
              <Ionicons name="trending-up" size={36} color="#fff" />
            </View>
            <Text style={{ fontSize: 28, fontWeight: "700", color: colors.foreground, fontFamily: "Inter_700Bold", marginBottom: 6 }}>
              Preeku
            </Text>
            <Text style={{ fontSize: 14, color: colors.mutedForeground, fontFamily: "Inter_400Regular", textAlign: "center" }}>
              Paper trading platform for Indian markets
            </Text>
          </View>

          {/* Card */}
          <View style={{
            backgroundColor: colors.card, borderRadius: 20,
            borderWidth: 1, borderColor: colors.border,
            padding: 24, shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12,
          }}>
            {/* Tab switcher */}
            <View style={{
              flexDirection: "row", backgroundColor: colors.muted,
              borderRadius: 12, padding: 4, marginBottom: 24,
            }}>
              {(["login", "signup"] as const).map((m) => (
                <TouchableOpacity
                  key={m}
                  onPress={() => { Haptics.selectionAsync(); setMode(m); }}
                  style={{
                    flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: "center",
                    backgroundColor: mode === m ? colors.card : "transparent",
                    shadowColor: mode === m ? "#000" : "transparent",
                    shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 4,
                  }}
                >
                  <Text style={{
                    fontSize: 14, fontWeight: "600",
                    color: mode === m ? colors.foreground : colors.mutedForeground,
                    fontFamily: "Inter_600SemiBold",
                  }}>
                    {m === "login" ? "Sign In" : "Sign Up"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Name field (signup only) */}
            {mode === "signup" && (
              <View style={{ marginBottom: 16 }}>
                <Text style={{ fontSize: 13, color: colors.mutedForeground, fontFamily: "Inter_500Medium", marginBottom: 8 }}>
                  Full Name
                </Text>
                <View style={{
                  flexDirection: "row", alignItems: "center",
                  backgroundColor: colors.input, borderRadius: 12,
                  borderWidth: 1, borderColor: colors.border, paddingHorizontal: 14,
                }}>
                  <Ionicons name="person-outline" size={18} color={colors.mutedForeground} style={{ marginRight: 10 }} />
                  <TextInput
                    value={name}
                    onChangeText={setName}
                    placeholder="Your name"
                    placeholderTextColor={colors.mutedForeground}
                    style={{ flex: 1, paddingVertical: 14, fontSize: 15, color: colors.foreground, fontFamily: "Inter_400Regular" }}
                    autoCapitalize="words"
                    returnKeyType="next"
                  />
                </View>
              </View>
            )}

            {/* Email field */}
            <View style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 13, color: colors.mutedForeground, fontFamily: "Inter_500Medium", marginBottom: 8 }}>
                Email Address
              </Text>
              <View style={{
                flexDirection: "row", alignItems: "center",
                backgroundColor: colors.input, borderRadius: 12,
                borderWidth: 1, borderColor: colors.border, paddingHorizontal: 14,
              }}>
                <Ionicons name="mail-outline" size={18} color={colors.mutedForeground} style={{ marginRight: 10 }} />
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="you@example.com"
                  placeholderTextColor={colors.mutedForeground}
                  style={{ flex: 1, paddingVertical: 14, fontSize: 15, color: colors.foreground, fontFamily: "Inter_400Regular" }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="next"
                />
              </View>
            </View>

            {/* Password field */}
            <View style={{ marginBottom: 24 }}>
              <Text style={{ fontSize: 13, color: colors.mutedForeground, fontFamily: "Inter_500Medium", marginBottom: 8 }}>
                Password
              </Text>
              <View style={{
                flexDirection: "row", alignItems: "center",
                backgroundColor: colors.input, borderRadius: 12,
                borderWidth: 1, borderColor: colors.border, paddingHorizontal: 14,
              }}>
                <Ionicons name="lock-closed-outline" size={18} color={colors.mutedForeground} style={{ marginRight: 10 }} />
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="••••••••"
                  placeholderTextColor={colors.mutedForeground}
                  secureTextEntry={!showPassword}
                  style={{ flex: 1, paddingVertical: 14, fontSize: 15, color: colors.foreground, fontFamily: "Inter_400Regular" }}
                  returnKeyType="done"
                  onSubmitEditing={handleSubmit}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                  <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color={colors.mutedForeground} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Submit button */}
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={!isValid || loading}
              activeOpacity={0.85}
              style={{
                backgroundColor: isValid ? colors.primary : colors.muted,
                borderRadius: 14, paddingVertical: 16,
                alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 8,
              }}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <Ionicons name={mode === "login" ? "log-in-outline" : "person-add-outline"} size={18} color="#fff" />
                  <Text style={{ fontSize: 16, fontWeight: "600", color: "#fff", fontFamily: "Inter_600SemiBold" }}>
                    {mode === "login" ? "Sign In" : "Create Account"}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Footer note */}
          <Text style={{ textAlign: "center", color: colors.mutedForeground, fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 24 }}>
            Paper trading only — no real money involved
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
