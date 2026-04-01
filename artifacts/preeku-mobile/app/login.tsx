import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ScrollView,
  ActivityIndicator, Alert, Image,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "@/context/AuthContext";
import { useAppTheme } from "@/context/ThemeContext";

const ORANGE = "#f05a28";
const ORANGE_DARK = "#d44a1c";
const BLACK = "#111111";

export default function LoginScreen() {
  const { resolvedTheme } = useAppTheme();
  const isDark = resolvedTheme === "dark";
  const insets = useSafeAreaInsets();
  const { login } = useAuth();

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);

  const isValid =
    email.trim().length > 3 &&
    password.length >= 4 &&
    (mode === "login" || name.trim().length >= 2);

  const handleSubmit = async () => {
    if (!isValid) return;
    Haptics.selectionAsync();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    try {
      const displayName =
        mode === "signup" ? name.trim() : email.split("@")[0] || "Trader";
      await login(displayName, email.trim().toLowerCase());
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Error", "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const bg = isDark ? "#0d0d0d" : "#fafafa";
  const cardBg = isDark ? "#1a1a1a" : "#ffffff";
  const cardBorder = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)";
  const labelColor = isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.45)";
  const textColor = isDark ? "#ffffff" : BLACK;
  const placeholder = isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.25)";
  const inputBg = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)";
  const inputBorder = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)";

  const inputRow = (field: string) => ({
    flexDirection: "row" as const,
    alignItems: "center" as const,
    backgroundColor: focused === field ? (isDark ? "rgba(240,90,40,0.08)" : "rgba(240,90,40,0.04)") : inputBg,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: focused === field ? ORANGE : inputBorder,
    paddingHorizontal: 15,
    marginBottom: 14,
  });

  return (
    <View style={{ flex: 1, backgroundColor: bg }}>
      {/* Subtle warm top glow */}
      <LinearGradient
        colors={isDark
          ? ["rgba(240,90,40,0.14)", "transparent"]
          : ["rgba(240,90,40,0.08)", "transparent"]}
        style={{ position: "absolute", top: 0, left: 0, right: 0, height: 320 }}
      />

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingTop: insets.top + 20, paddingBottom: insets.bottom + 28, paddingHorizontal: 24 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo — no background, just the image */}
          <View style={{ alignItems: "center", marginTop: 20, marginBottom: 32 }}>
            <Image
              source={require("../assets/images/logo.png")}
              style={{ width: 90, height: 90, borderRadius: 22, marginBottom: 16 }}
              resizeMode="contain"
            />
            <Text style={{
              fontSize: 32, fontWeight: "800", letterSpacing: -0.8,
              color: textColor, fontFamily: "Inter_700Bold", marginBottom: 6,
            }}>
              Preeku
            </Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: "#22c55e" }} />
              <Text style={{ fontSize: 13, color: labelColor, fontFamily: "Inter_400Regular" }}>
                Live NSE paper trading
              </Text>
            </View>
          </View>

          {/* Card */}
          <View style={{
            backgroundColor: cardBg, borderRadius: 22,
            borderWidth: 1, borderColor: cardBorder,
            padding: 20,
            shadowColor: ORANGE, shadowOffset: { width: 0, height: 6 },
            shadowOpacity: isDark ? 0.15 : 0.1, shadowRadius: 24,
          }}>
            {/* Sign In / Sign Up tabs */}
            <View style={{
              flexDirection: "row",
              backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
              borderRadius: 12, padding: 4, marginBottom: 22,
            }}>
              {(["login", "signup"] as const).map((m) => (
                <TouchableOpacity
                  key={m}
                  onPress={() => { Haptics.selectionAsync(); setMode(m); }}
                  activeOpacity={0.8}
                  style={{
                    flex: 1, paddingVertical: 11, borderRadius: 10, alignItems: "center",
                    backgroundColor: mode === m ? ORANGE : "transparent",
                  }}
                >
                  <Text style={{
                    fontSize: 14, fontWeight: "700",
                    color: mode === m ? "#fff" : labelColor,
                    fontFamily: "Inter_700Bold",
                  }}>
                    {m === "login" ? "Sign In" : "Sign Up"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Name (sign up only) */}
            {mode === "signup" && (
              <View>
                <Text style={{ fontSize: 11.5, color: labelColor, fontFamily: "Inter_500Medium", marginBottom: 6, letterSpacing: 0.5, textTransform: "uppercase" }}>
                  Full Name
                </Text>
                <View style={inputRow("name")}>
                  <Ionicons name="person-outline" size={16} color={focused === "name" ? ORANGE : labelColor} style={{ marginRight: 10 }} />
                  <TextInput
                    value={name} onChangeText={setName}
                    placeholder="Your name" placeholderTextColor={placeholder}
                    style={{ flex: 1, paddingVertical: 14, fontSize: 15, color: textColor, fontFamily: "Inter_400Regular" }}
                    autoCapitalize="words" returnKeyType="next"
                    onFocus={() => setFocused("name")} onBlur={() => setFocused(null)}
                  />
                </View>
              </View>
            )}

            {/* Email */}
            <View>
              <Text style={{ fontSize: 11.5, color: labelColor, fontFamily: "Inter_500Medium", marginBottom: 6, letterSpacing: 0.5, textTransform: "uppercase" }}>
                Email
              </Text>
              <View style={inputRow("email")}>
                <Ionicons name="mail-outline" size={16} color={focused === "email" ? ORANGE : labelColor} style={{ marginRight: 10 }} />
                <TextInput
                  value={email} onChangeText={setEmail}
                  placeholder="you@example.com" placeholderTextColor={placeholder}
                  style={{ flex: 1, paddingVertical: 14, fontSize: 15, color: textColor, fontFamily: "Inter_400Regular" }}
                  keyboardType="email-address" autoCapitalize="none" autoCorrect={false} returnKeyType="next"
                  onFocus={() => setFocused("email")} onBlur={() => setFocused(null)}
                />
              </View>
            </View>

            {/* Password */}
            <View>
              <Text style={{ fontSize: 11.5, color: labelColor, fontFamily: "Inter_500Medium", marginBottom: 6, letterSpacing: 0.5, textTransform: "uppercase" }}>
                Password
              </Text>
              <View style={inputRow("password")}>
                <Ionicons name="lock-closed-outline" size={16} color={focused === "password" ? ORANGE : labelColor} style={{ marginRight: 10 }} />
                <TextInput
                  value={password} onChangeText={setPassword}
                  placeholder="••••••••" placeholderTextColor={placeholder}
                  secureTextEntry={!showPassword}
                  style={{ flex: 1, paddingVertical: 14, fontSize: 15, color: textColor, fontFamily: "Inter_400Regular" }}
                  returnKeyType="done" onSubmitEditing={handleSubmit}
                  onFocus={() => setFocused("password")} onBlur={() => setFocused(null)}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                  <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={18} color={labelColor} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Submit button */}
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={!isValid || loading}
              activeOpacity={0.85}
              style={{ marginTop: 4 }}
            >
              <LinearGradient
                colors={isValid
                  ? [ORANGE, ORANGE_DARK]
                  : isDark ? ["rgba(255,255,255,0.07)", "rgba(255,255,255,0.05)"] : ["#e5e7eb", "#e5e7eb"]}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={{
                  borderRadius: 14, paddingVertical: 16,
                  alignItems: "center", justifyContent: "center",
                  flexDirection: "row", gap: 8,
                }}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <>
                    <Ionicons
                      name={mode === "login" ? "log-in-outline" : "person-add-outline"}
                      size={17}
                      color={isValid ? "#fff" : isDark ? "rgba(255,255,255,0.25)" : "#9ca3af"}
                    />
                    <Text style={{
                      fontSize: 15.5, fontWeight: "700",
                      color: isValid ? "#fff" : isDark ? "rgba(255,255,255,0.25)" : "#9ca3af",
                      fontFamily: "Inter_700Bold",
                    }}>
                      {mode === "login" ? "Sign In" : "Create Account"}
                    </Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <Text style={{
            textAlign: "center", marginTop: 22,
            color: labelColor, fontSize: 12.5, fontFamily: "Inter_400Regular",
          }}>
            Paper trading only · No real money involved
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
