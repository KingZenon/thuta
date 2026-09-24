import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { api } from "@/lib/api";
import type { User } from "@/types";

type AuthValue = { user: User | null; loading: boolean; login: (email: string, password: string) => Promise<User>; logout: () => void };
const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(Boolean(sessionStorage.getItem("settla-token")));

  useEffect(() => {
    if (!sessionStorage.getItem("settla-token")) return;
    api.me().then(({ data }) => setUser(data)).catch(() => sessionStorage.removeItem("settla-token")).finally(() => setLoading(false));
  }, []);

  const value = useMemo<AuthValue>(() => ({
    user,
    loading,
    async login(email, password) {
      const { data } = await api.login(email, password);
      sessionStorage.setItem("settla-token", data.accessToken);
      setUser(data.user);
      return data.user;
    },
    logout() { sessionStorage.removeItem("settla-token"); setUser(null); }
  }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
