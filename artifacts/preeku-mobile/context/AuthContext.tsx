import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface AuthContextValue {
  isLoggedIn: boolean;
  userName: string;
  userEmail: string;
  login: (name: string, email: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextValue>({
  isLoggedIn: false,
  userName: "",
  userEmail: "",
  login: async () => {},
  logout: async () => {},
  loading: true,
});

const AUTH_KEY = "preeku_auth_logged_in";
const NAME_KEY = "preeku_name";
const EMAIL_KEY = "preeku_email";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [loggedIn, name, email] = await Promise.all([
        AsyncStorage.getItem(AUTH_KEY),
        AsyncStorage.getItem(NAME_KEY),
        AsyncStorage.getItem(EMAIL_KEY),
      ]);
      setIsLoggedIn(loggedIn === "true");
      setUserName(name || "");
      setUserEmail(email || "");
      setLoading(false);
    })();
  }, []);

  const login = async (name: string, email: string) => {
    await AsyncStorage.multiSet([
      [AUTH_KEY, "true"],
      [NAME_KEY, name],
      [EMAIL_KEY, email],
    ]);
    setUserName(name);
    setUserEmail(email);
    setIsLoggedIn(true);
  };

  const logout = async () => {
    await AsyncStorage.multiRemove([AUTH_KEY, NAME_KEY, EMAIL_KEY, "preeku_avatar"]);
    setIsLoggedIn(false);
    setUserName("");
    setUserEmail("");
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, userName, userEmail, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
