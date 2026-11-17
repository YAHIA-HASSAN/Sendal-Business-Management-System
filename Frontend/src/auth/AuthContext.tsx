import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { ApiUser } from "../api/client";

type AuthContextValue = { user: ApiUser | null; login: (user: ApiUser, token: string, remember: boolean) => void; logout: () => void };
const AuthContext = createContext<AuthContextValue | null>(null);
const TOKEN_KEY = "sendal.demo-token";
const USER_KEY = "sendal.demo-user";

function getStoredUser(): ApiUser | null {
  try {
    const storage = sessionStorage.getItem(TOKEN_KEY) ? sessionStorage : localStorage;
    if (!storage.getItem(TOKEN_KEY)) return null;
    return JSON.parse(storage.getItem(USER_KEY) ?? "null") as ApiUser | null;
  } catch { return null; }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<ApiUser | null>(getStoredUser);
  const value = useMemo<AuthContextValue>(() => ({
    user,
    login(nextUser, token, remember) {
      localStorage.removeItem(TOKEN_KEY); localStorage.removeItem(USER_KEY);
      sessionStorage.removeItem(TOKEN_KEY); sessionStorage.removeItem(USER_KEY);
      const storage = remember ? localStorage : sessionStorage;
      storage.setItem(TOKEN_KEY, token); storage.setItem(USER_KEY, JSON.stringify(nextUser));
      setUser(nextUser);
    },
    logout() {
      localStorage.removeItem(TOKEN_KEY); localStorage.removeItem(USER_KEY);
      sessionStorage.removeItem(TOKEN_KEY); sessionStorage.removeItem(USER_KEY);
      setUser(null);
    },
  }), [user]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
