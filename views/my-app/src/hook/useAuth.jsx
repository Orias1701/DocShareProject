// src/hook/useAuth.jsx
import { createContext, useContext, useEffect, useState } from "react";
import fetchJson from "../services/fetchJson";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    try {
      const data = await fetchJson("api_me", {
        method: "GET",
        headers: { Accept: "application/json" },
      });

      if (data && typeof data === "object" && data.status === "ok" && data.user) {
        const raw = data.user;

        let normalized = {};
        for (let k in raw) {
          if (Object.prototype.hasOwnProperty.call(raw, k)) {
            normalized[k] = raw[k];
          }
        }

        const fallbackAvatar = "https://cdn2.fptshop.com.vn/small/avatar_trang_1_cd729c335b.jpg";
        const avatarUrl = raw?.avatar_url || raw?.avatar || raw?.profile_image || fallbackAvatar;
        const fullName  = raw?.full_name || raw?.name || raw?.username || "User name";

        normalized.avatar_url = avatarUrl;
        normalized.full_name = fullName;

        setUser(normalized);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    }
  }

  useEffect(() => {
    let mounted = true;
    (async () => {
      await refresh();
      if (mounted) setLoading(false);
    })();
    return () => { mounted = false; };
  }, []);

  const value = { user, setUser, loading, refresh, isAuthenticated: !!user };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
