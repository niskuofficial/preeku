import { createContext, useContext, useEffect, useState, useCallback } from "react";

const TOKEN_KEY = "preeku_token";

interface AuthUser {
  id: string;
  email: string;
  name: string;
  isAdmin: boolean;
}

interface AuthContextValue {
  user: AuthUser | null;
  isLoaded: boolean;
  isSignedIn: boolean;
  token: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function getStoredToken(): string | null {
  try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
}

function setStoredToken(token: string | null) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {}
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [token, setToken] = useState<string | null>(getStoredToken);

  useEffect(() => {
    const t = getStoredToken();
    if (!t) { setIsLoaded(true); return; }

    fetch("/api/auth/me", {
      headers: { Authorization: `Bearer ${t}` },
    })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data) setUser(data);
        else { setStoredToken(null); setToken(null); }
      })
      .catch(() => {})
      .finally(() => setIsLoaded(true));
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Login failed");
    setStoredToken(data.token);
    setToken(data.token);
    setUser(data.user);
  }, []);

  const signUp = useCallback(async (email: string, password: string, name: string) => {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Registration failed");
    setStoredToken(data.token);
    setToken(data.token);
    setUser(data.user);
  }, []);

  const signOut = useCallback(() => {
    setStoredToken(null);
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoaded, isSignedIn: !!user, token, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
