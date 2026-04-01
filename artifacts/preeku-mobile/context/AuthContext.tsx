import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface AuthContextValue {
  isLoggedIn: boolean;
  userName: string;
  userEmail: string;
  deviceId: string;
  login: (name: string, email: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextValue>({
  isLoggedIn: false,
  userName: "",
  userEmail: "",
  deviceId: "",
  login: async () => {},
  logout: async () => {},
  loading: true,
});

const AUTH_KEY = "preeku_auth_logged_in";
const NAME_KEY = "preeku_name";
const EMAIL_KEY = "preeku_email";
const DEVICE_ID_KEY = "preeku_device_id";

function generateDeviceId(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from({ length: 20 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

async function getOrCreateDeviceId(): Promise<string> {
  let id = await AsyncStorage.getItem(DEVICE_ID_KEY);
  if (!id) {
    id = generateDeviceId();
    await AsyncStorage.setItem(DEVICE_ID_KEY, id);
  }
  return id;
}

async function registerWithServer(deviceId: string, name: string, email: string) {
  try {
    const domain = process.env.EXPO_PUBLIC_DOMAIN;
    const baseUrl = domain ? `https://${domain}` : "http://localhost:8080";
    await fetch(`${baseUrl}/api/mobile/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ deviceId, name, email }),
    });
  } catch {}
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [deviceId, setDeviceId] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const devId = await getOrCreateDeviceId();
      const [loggedIn, name, email] = await Promise.all([
        AsyncStorage.getItem(AUTH_KEY),
        AsyncStorage.getItem(NAME_KEY),
        AsyncStorage.getItem(EMAIL_KEY),
      ]);
      setIsLoggedIn(loggedIn === "true");
      setUserName(name || "");
      setUserEmail(email || "");
      setDeviceId(devId);
      if (loggedIn === "true" && name) {
        registerWithServer(devId, name || "", email || "");
      }
      setLoading(false);
    })();
  }, []);

  const login = async (name: string, email: string) => {
    const devId = await getOrCreateDeviceId();
    await AsyncStorage.multiSet([
      [AUTH_KEY, "true"],
      [NAME_KEY, name],
      [EMAIL_KEY, email],
    ]);
    setUserName(name);
    setUserEmail(email);
    setDeviceId(devId);
    setIsLoggedIn(true);
    await registerWithServer(devId, name, email);
  };

  const logout = async () => {
    await AsyncStorage.multiRemove([AUTH_KEY, NAME_KEY, EMAIL_KEY, "preeku_avatar"]);
    setIsLoggedIn(false);
    setUserName("");
    setUserEmail("");
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, userName, userEmail, deviceId, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
