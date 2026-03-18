import { createContext, useContext, useEffect, useState, ReactNode } from "react";

interface User {
  id: number;
  email: string;
  name: string;
  avatarUrl: string | null;
  isPremium: boolean;
  subscriptionStatus: string;
  totpEnabled: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (provider: string, token: string, extra?: Record<string, unknown>) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const API = "/api/auth";

function getStoredTokens() {
  return {
    accessToken: localStorage.getItem("playeng_access_token"),
    refreshToken: localStorage.getItem("playeng_refresh_token"),
  };
}

function storeTokens(accessToken: string, refreshToken: string) {
  localStorage.setItem("playeng_access_token", accessToken);
  localStorage.setItem("playeng_refresh_token", refreshToken);
}

function clearTokens() {
  localStorage.removeItem("playeng_access_token");
  localStorage.removeItem("playeng_refresh_token");
}

export function getAccessToken(): string | null {
  return localStorage.getItem("playeng_access_token");
}

export function authHeaders(): Record<string, string> {
  const token = getAccessToken();
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    const { accessToken, refreshToken } = getStoredTokens();

    if (!accessToken && !refreshToken) {
      setLoading(false);
      return;
    }

    // Try current access token
    if (accessToken) {
      try {
        const res = await fetch(`${API}/me`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data);
          setLoading(false);
          return;
        }
      } catch {
        // Token might be expired
      }
    }

    // Try refresh token
    if (refreshToken) {
      try {
        const res = await fetch(`${API}/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
        });
        if (res.ok) {
          const data = await res.json();
          storeTokens(data.accessToken, refreshToken);
          setUser(data.user);
          setLoading(false);
          return;
        }
      } catch {
        // Refresh failed
      }
    }

    clearTokens();
    setLoading(false);
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (provider: string, token: string, extra?: Record<string, unknown>) => {
    const body: Record<string, unknown> = { token, ...extra };

    // Apple uses id_token instead of token
    if (provider === "apple") {
      delete body.token;
      body.id_token = token;
    }

    const res = await fetch(`${API}/${provider}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Login failed");
    }

    const data = await res.json();
    storeTokens(data.accessToken, data.refreshToken);
    setUser(data.user);
  };

  const logout = () => {
    clearTokens();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
