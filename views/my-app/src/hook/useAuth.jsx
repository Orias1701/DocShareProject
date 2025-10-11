import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const API_ME_URL = "http://localhost:3000/public/index.php?action=api_me";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

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
      if (data?.status === "ok" && data.user) {
        const raw = data.user;
        const normalized = {
          ...raw,
          avatar_url:
            raw.avatar_url ||
            raw.avatar ||
            raw.profile_image ||
            "https://cdn2.fptshop.com.vn/small/avatar_trang_1_cd729c335b.jpg",
          full_name: raw.full_name || raw.name || raw.username || "User name",
        };
        setUser(normalized);
      } else {
        setUser(null);
      }
      
    } catch (e) {
      console.error("Auth refresh failed:", e);
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
    () => ({
      user,
      setUser,
      loading,
      refresh,
      isAuthenticated: !!user,
    }),
    [user, loading, refresh]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within <AuthProvider>");
  }
  return ctx;
}
