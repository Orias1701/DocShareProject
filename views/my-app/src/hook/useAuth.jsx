// [AuthProvider] Cấp context xác thực toàn cục, kết hợp dữ liệu từ api_me + api_admin
// Fix "lần đầu vào 403" bằng 2 cờ: ready + userLoaded

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import authApi from "../services/usersServices"; // phải có authApi.me() và authApi.admin()

// ------------------------------------------------------------
// Mapping label cho role (tùy backend bạn)
// ------------------------------------------------------------
const ROLE_LABELS = {
  ROLE000: "Admin",
  ROLE011: "Người dùng",
};

const AuthContext = createContext(null);

// ------------------------------------------------------------
// Chuẩn hoá user từ api_me
// ------------------------------------------------------------
function normalizeUserFromMe(me) {
  if (!me || me.status !== "ok" || !me.user) return null;

  const raw = me.user;
  const normalized = { ...raw };

  const fallbackAvatar = "https://cdn2.fptshop.com.vn/small/avatar_trang_1_cd729c335b.jpg";
  normalized.avatar_url =
    raw?.avatar_url ?? raw?.avatar ?? raw?.profile_image ?? fallbackAvatar;

  normalized.full_name = raw?.full_name ?? raw?.name ?? raw?.username ?? "User name";

  const roleId = raw?.role_id ?? null;
  normalized.role_id = roleId;
  normalized.roles = Array.isArray(raw?.roles) ? raw.roles : roleId ? [roleId] : [];
  normalized.role_label = roleId && ROLE_LABELS[roleId] ? ROLE_LABELS[roleId] : "user";

  return normalized;
}

// ------------------------------------------------------------
// Gộp thông tin từ api_admin vào user
// ------------------------------------------------------------
function mergeAdminInfo(user, adminPayload) {
  if (!user) return null;
  const merged = { ...user };

  if (adminPayload && adminPayload.status === "ok") {
    merged.is_admin = !!adminPayload.isAdmin;

    if (adminPayload.roleId && adminPayload.roleId !== merged.role_id) {
      merged.role_id = adminPayload.roleId;
      merged.roles = [adminPayload.roleId];
      merged.role_label = ROLE_LABELS[adminPayload.roleId] ?? merged.role_label ?? "user";
    }

    merged.session_user = adminPayload.session_user ?? merged.session_user;
    merged.session_data = adminPayload.session_data ?? merged.session_data;
    merged.admin_message = adminPayload.message ?? merged.admin_message;
  } else {
    merged.is_admin = false;
  }

  return merged;
}

// ------------------------------------------------------------
// Helpers quyền
// ------------------------------------------------------------
const hasRole = (u, roleId) =>
  !!u && (Array.isArray(u.roles) ? u.roles.includes(roleId) : u.role_id === roleId);
const hasAnyRole = (u, roleIds = []) => !!u && roleIds.some((r) => hasRole(u, r));
const hasAllRoles = (u, roleIds = []) => !!u && roleIds.every((r) => hasRole(u, r));
const isAdminUser = (u) => !!u && (u.is_admin || hasRole(u, "ROLE000"));

// ------------------------------------------------------------
// AuthProvider
// ------------------------------------------------------------
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  // loading: trạng thái tổng lần đầu
  const [loading, setLoading] = useState(true);

  // refreshing: khi gọi refresh() thủ công
  const [refreshing, setRefreshing] = useState(false);

  // ✅ ready: đã chạy refresh lần đầu xong
  const [ready, setReady] = useState(false);

  // ✅ userLoaded: đã cố load profile xong (thành công/ thất bại đều true)
  const [userLoaded, setUserLoaded] = useState(false);

  // Gọi lại API để cập nhật user và quyền
  async function refresh() {
    setRefreshing(true);
    try {
      const [meRes, adminRes] = await Promise.allSettled([authApi.me(), authApi.admin()]);
      const meVal = meRes.status === "fulfilled" ? meRes.value : null;
      const normalized = normalizeUserFromMe(meVal);

      if (!normalized) {
        setUser(null);
        return null;
      }

      const adminVal = adminRes.status === "fulfilled" ? adminRes.value : null;
      const merged = mergeAdminInfo(normalized, adminVal);

      setUser(merged);
      return merged;
    } catch (_) {
      setUser(null);
      return null;
    } finally {
      setRefreshing(false);
      setUserLoaded(true); // ✅ đã cố gắng load user
      setLoading(false);   // hết loading tổng
      setReady(true);      // ✅ refresh đầu tiên đã hoàn thành
    }
  }

  // Refresh ngay khi mount
  useEffect(() => {
    let mounted = true;
    (async () => {
      const u = await refresh();
      if (!mounted) return;
      if (!u) setUser(null);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const value = useMemo(
    () => ({
      user,
      setUser,
      loading,
      refreshing,
      ready,
      userLoaded,
      refresh,
      isAuthenticated: !!user,
      // helpers
      hasRole: (roleId) => hasRole(user, roleId),
      hasAnyRole: (roleIds) => hasAnyRole(user, roleIds),
      hasAllRoles: (roleIds) => hasAllRoles(user, roleIds),
      isAdmin: () => isAdminUser(user),
    }),
    [user, loading, refreshing, ready, userLoaded]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook
export default function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}

// ------------------------------------------------------------
// RoleGate: Hiển thị/ẩn theo quyền (tuỳ chọn)
// ------------------------------------------------------------
export function RoleGate({ anyOf = [], allOf = [], fallback = null, children }) {
  const auth = useAuth();
  if (auth.loading) return null;
  const okAny = anyOf.length === 0 || auth.hasAnyRole(anyOf);
  const okAll = allOf.length === 0 || auth.hasAllRoles(allOf);
  return okAny && okAll ? children : fallback;
}
