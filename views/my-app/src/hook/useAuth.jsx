// src/hooks/useAuth.jsx
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const API_ME_URL = "http://localhost:3000/public/index.php?action=api_me";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]     = useState(null);
  const [loading, setLoading] = useState(true);

  // gọi /me một lần để khôi phục session
  const refresh = useCallback(async () => {
    try {
      const res = await fetch(API_ME_URL, {
        method: "GET",
        credentials: "include",
        headers: { Accept: "application/json" },
      });
      if (!res.ok) {
        setUser(null);
        return;
      }
      const data = await res.json().catch(() => ({}));
      setUser(data?.status === "ok" ? data.user : null);
    } catch (e) {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    (async () => {
      await refresh();
      setLoading(false);
    })();
  }, [refresh]);

  const value = useMemo(
    () => ({ user, setUser, loading, refresh }),
    [user, loading, refresh]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
