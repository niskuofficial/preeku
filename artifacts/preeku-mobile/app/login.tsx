import React, { useState, useRef } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ScrollView,
  ActivityIndicator, Alert, Image, Animated, Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";
import { useAppTheme } from "@/context/ThemeContext";

const BRAND = "#818cf8";
const BRAND_DARK = "#6366f1";
const BRAND_LIGHT = "#e0e7ff";

export default function LoginScreen() {
  const colors = useColors();
  const { resolvedTheme } = useAppTheme();
  const isDark = resolvedTheme === "dark";
  const insets = useSafeAreaInsets();
  const { login } = useAuth();
  const { width } = Dimensions.get("window");

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

  const inputStyle = (field: string) => ({
    flexDirection: "row" as const,
    alignItems: "center" as const,
    backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(99,102,241,0.05)",
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: focused === field
      ? BRAND
      : isDark ? "rgba(255,255,255,0.1)" : "rgba(99,102,241,0.15)",
    paddingHorizontal: 16,
    marginBottom: 14,
  });

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? "#070c14" : "#f5f6ff" }}>
      {/* Top gradient blob */}
      <LinearGradient
        colors={isDark
          ? ["rgba(99,102,241,0.18)", "transparent"]
          : ["rgba(99,102,241,0.12)", "transparent"]}
        style={{ position: "absolute", top: 0, left: 0, right: 0, height: 340 }}
      />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            paddingTop: insets.top + 16,
            paddingBottom: insets.bottom + 24,
            paddingHorizontal: 24,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo section */}
          <View style={{ alignItems: "center", marginTop: 24, marginBottom: 36 }}>
            <View style={{
              width: 88, height: 88, borderRadius: 26,
              backgroundColor: BRAND,
              alignItems: "center", justifyContent: "center",
              shadowColor: BRAND, shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.45, shadowRadius: 20, elevation: 12,
              marginBottom: 18,
            }}>
              <Image
                source={require("../assets/images/logo.png")}
                style={{ width: 56, height: 56, borderRadius: 12 }}
                resizeMode="contain"
              />
            </View>
            <Text style={{
              fontSize: 30, fontWeight: "700", letterSpacing: -0.5,
              color: isDark ? "#fff" : "#1e1b4b",
              fontFamily: "Inter_700Bold", marginBottom: 6,
            }}>
              Preeku
            </Text>
            <Text style={{
              fontSize: 13.5, color: isDark ? "rgba(255,255,255,0.45)" : "rgba(99,102,241,0.7)",
              fontFamily: "Inter_400Regular", textAlign: "center", letterSpacing: 0.2,
            }}>
              Paper trading platform for Indian markets
            </Text>
          </View>

          {/* Card */}
          <View style={{
            backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "#ffffff",
            borderRadius: 24, borderWidth: 1,
            borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(99,102,241,0.12)",
            padding: 22,
            shadowColor: isDark ? BRAND : "#6366f1",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: isDark ? 0.1 : 0.08,
            shadowRadius: 20,
          }}>
            {/* Tab switcher */}
            <View style={{
              flexDirection: "row",
              backgroundColor: isDark ? "rgba(255,255,255,0.06)" : BRAND_LIGHT + "60",
              borderRadius: 14, padding: 4, marginBottom: 22,
            }}>
              {(["login", "signup"] as const).map((m) => (
                <TouchableOpacity
                  key={m}
                  onPress={() => { Haptics.selectionAsync(); setMode(m); }}
                  activeOpacity={0.8}
                  style={{
                    flex: 1, paddingVertical: 11, borderRadius: 11,
                    alignItems: "center",
                    backgroundColor: mode === m ? BRAND : "transparent",
                    shadowColor: mode === m ? BRAND : "transparent",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.3, shadowRadius: 6,
                  }}
                >
                  <Text style={{
                    fontSize: 14, fontWeight: "600",
                    color: mode === m ? "#fff" : isDark ? "rgba(255,255,255,0.4)" : BRAND_DARK,
                    fontFamily: "Inter_600SemiBold",
                  }}>
                    {m === "login" ? "Sign In" : "Sign Up"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Name field (signup only) */}
            {mode === "signup" && (
              <View>
                <Text style={{ fontSize: 12.5, color: isDark ? "rgba(255,255,255,0.45)" : BRAND_DARK, fontFamily: "Inter_500Medium", marginBottom: 7, letterSpacing: 0.3 }}>
                  FULL NAME
                </Text>
                <View style={inputStyle("name")}>
                  <Ionicons name="person-outline" size={17} color={focused === "name" ? BRAND : isDark ? "rgba(255,255,255,0.3)" : "rgba(99,102,241,0.5)"} style={{ marginRight: 10 }} />
                  <TextInput
                    value={name}
                    onChangeText={setName}
                    placeholder="Your name"
                    placeholderTextColor={isDark ? "rgba(255,255,255,0.2)" : "rgba(99,102,241,0.35)"}
                    style={{ flex: 1, paddingVertical: 14, fontSize: 15, color: isDark ? "#fff" : "#1e1b4b", fontFamily: "Inter_400Regular" }}
                    autoCapitalize="words"
                    returnKeyType="next"
                    onFocus={() => setFocused("name")}
                    onBlur={() => setFocused(null)}
                  />
                </View>
              </View>
            )}

            {/* Email field */}
            <View>
              <Text style={{ fontSize: 12.5, color: isDark ? "rgba(255,255,255,0.45)" : BRAND_DARK, fontFamily: "Inter_500Medium", marginBottom: 7, letterSpacing: 0.3 }}>
                EMAIL ADDRESS
              </Text>
              <View style={inputStyle("email")}>
                <Ionicons name="mail-outline" size={17} color={focused === "email" ? BRAND : isDark ? "rgba(255,255,255,0.3)" : "rgba(99,102,241,0.5)"} style={{ marginRight: 10 }} />
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="you@example.com"
                  placeholderTextColor={isDark ? "rgba(255,255,255,0.2)" : "rgba(99,102,241,0.35)"}
                  style={{ flex: 1, paddingVertical: 14, fontSize: 15, color: isDark ? "#fff" : "#1e1b4b", fontFamily: "Inter_400Regular" }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="next"
                  onFocus={() => setFocused("email")}
                  onBlur={() => setFocused(null)}
                />
              </View>
            </View>

            {/* Password field */}
            <View>
              <Text style={{ fontSize: 12.5, color: isDark ? "rgba(255,255,255,0.45)" : BRAND_DARK, fontFamily: "Inter_500Medium", marginBottom: 7, letterSpacing: 0.3 }}>
                PASSWORD
              </Text>
              <View style={inputStyle("password")}>
                <Ionicons name="lock-closed-outline" size={17} color={focused === "password" ? BRAND : isDark ? "rgba(255,255,255,0.3)" : "rgba(99,102,241,0.5)"} style={{ marginRight: 10 }} />
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="••••••••"
                  placeholderTextColor={isDark ? "rgba(255,255,255,0.2)" : "rgba(99,102,241,0.35)"}
                  secureTextEntry={!showPassword}
                  style={{ flex: 1, paddingVertical: 14, fontSize: 15, color: isDark ? "#fff" : "#1e1b4b", fontFamily: "Inter_400Regular" }}
                  returnKeyType="done"
                  onSubmitEditing={handleSubmit}
                  onFocus={() => setFocused("password")}
                  onBlur={() => setFocused(null)}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                  <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={19} color={isDark ? "rgba(255,255,255,0.3)" : "rgba(99,102,241,0.5)"} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Submit button */}
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={!isValid || loading}
              activeOpacity={0.88}
            >
              <LinearGradient
                colors={isValid ? [BRAND, BRAND_DARK] : [isDark ? "rgba(255,255,255,0.08)" : "#d1d5db", isDark ? "rgba(255,255,255,0.06)" : "#d1d5db"]}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={{
                  borderRadius: 14, paddingVertical: 16,
                  alignItems: "center", justifyContent: "center",
                  flexDirection: "row", gap: 8, marginTop: 6,
                  shadowColor: isValid ? BRAND : "transparent",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.4, shadowRadius: 12,
                }}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <>
                    <Ionicons
                      name={mode === "login" ? "log-in-outline" : "person-add-outline"}
                      size={18}
                      color={isValid ? "#fff" : isDark ? "rgba(255,255,255,0.3)" : "#9ca3af"}
                    />
                    <Text style={{
                      fontSize: 15.5, fontWeight: "700",
                      color: isValid ? "#fff" : isDark ? "rgba(255,255,255,0.3)" : "#9ca3af",
                      fontFamily: "Inter_700Bold",
                    }}>
                      {mode === "login" ? "Sign In" : "Create Account"}
                    </Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Badge */}
          <View style={{ alignItems: "center", marginTop: 24, flexDirection: "row", justifyContent: "center", gap: 6 }}>
            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: "#22c55e" }} />
            <Text style={{ fontSize: 12.5, color: isDark ? "rgba(255,255,255,0.3)" : "rgba(99,102,241,0.55)", fontFamily: "Inter_400Regular" }}>
              Paper trading only — no real money involved
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
