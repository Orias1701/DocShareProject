// [AuthProvider] Cấp context xác thực toàn cục, kết hợp dữ liệu từ api_me + api_admin
// Dùng để xác định người dùng hiện tại, vai trò (role), quyền admin, và cung cấp các helper kiểm tra quyền.

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import authApi from "../services/usersServices"; // Import file chứa các API xác thực

// ------------------------------------------------------------
// Cấu hình tên hiển thị (label) cho từng role_id
// Bạn có thể mở rộng theo backend của mình.
// ------------------------------------------------------------
const ROLE_LABELS = {
  ROLE000: "Admin",
  ROLE011: "Người dùng",
};
const AuthContext = createContext(null);
// ------------------------------------------------------------
// [Hàm chuẩn hoá user từ phản hồi api_me]
// Nhận JSON từ api_me -> lọc, đổi tên, thêm fallback ảnh, tên, role.
// ------------------------------------------------------------
function normalizeUserFromMe(me) {
  if (!me || me.status !== "ok" || !me.user) return null;

  const raw = me.user;
  const normalized = { ...raw };

  // [1] Avatar fallback nếu user chưa có
  const fallbackAvatar = "https://cdn2.fptshop.com.vn/small/avatar_trang_1_cd729c335b.jpg";
  normalized.avatar_url =
    raw?.avatar_url ?? raw?.avatar ?? raw?.profile_image ?? fallbackAvatar;

  // [2] Tên hiển thị fallback
  normalized.full_name = raw?.full_name ?? raw?.name ?? raw?.username ?? "User name";

  // [3] Role chuẩn hoá
  const roleId = raw?.role_id ?? null;
  normalized.role_id = roleId;
  normalized.roles = Array.isArray(raw?.roles) ? raw.roles : roleId ? [roleId] : [];
  normalized.role_label = roleId && ROLE_LABELS[roleId] ? ROLE_LABELS[roleId] : "user";

  return normalized;
}

// ------------------------------------------------------------
// [Hàm hợp nhất dữ liệu admin]
// Kết hợp kết quả từ api_admin vào user hiện tại (nếu có).
// ------------------------------------------------------------
function mergeAdminInfo(user, adminPayload) {
  if (!user) return null;

  const merged = { ...user };

  if (adminPayload && adminPayload.status === "ok") {
    // [1] Gắn cờ admin
    merged.is_admin = !!adminPayload.isAdmin;

    // [2] Nếu api_admin có roleId rõ ràng hơn → ưu tiên
    if (adminPayload.roleId && adminPayload.roleId !== merged.role_id) {
      merged.role_id = adminPayload.roleId;
      merged.roles = [adminPayload.roleId];
      merged.role_label =
        ROLE_LABELS[adminPayload.roleId] ?? merged.role_label ?? "user";
    }

    // [3] Gộp thêm thông tin phiên (session)
    merged.session_user = adminPayload.session_user ?? merged.session_user;
    merged.session_data = adminPayload.session_data ?? merged.session_data;
    merged.admin_message = adminPayload.message ?? merged.admin_message;
  } else {
    // Nếu không phải admin hoặc gọi api_admin lỗi → gán false
    merged.is_admin = false;
  }

  return merged;
}

// ------------------------------------------------------------
// [AuthProvider Component]
// Bao quanh toàn bộ ứng dụng, lưu và chia sẻ trạng thái xác thực.
// ------------------------------------------------------------
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);           // Dữ liệu user hiện tại
  const [loading, setLoading] = useState(true);     // Cờ tải ban đầu
  const [refreshing, setRefreshing] = useState(false); // Cờ khi đang refresh thủ công

  // ------------------------------------------------------------
  // [Helpers kiểm tra quyền] — dùng cả trong context và UI
  // ------------------------------------------------------------
  const hasRole = (u, roleId) =>
    !!u && (Array.isArray(u.roles) ? u.roles.includes(roleId) : u.role_id === roleId);
  const hasAnyRole = (u, roleIds = []) => !!u && roleIds.some((r) => hasRole(u, r));
  const hasAllRoles = (u, roleIds = []) => !!u && roleIds.every((r) => hasRole(u, r));
  const isAdminUser = (u) => !!u && (u.is_admin || hasRole(u, "ROLE000"));

  // ------------------------------------------------------------
  // [refresh()] Gọi lại API để cập nhật thông tin user và quyền
  // ------------------------------------------------------------
  async function refresh() {
    setRefreshing(true);
    try {
      // Gọi song song api_me và api_admin để giảm thời gian chờ
      const [meRes, adminRes] = await Promise.allSettled([authApi.me(), authApi.admin()]);

      // Xử lý kết quả api_me
      const meVal = meRes.status === "fulfilled" ? meRes.value : null;
      const normalized = normalizeUserFromMe(meVal);

      if (!normalized) {
        setUser(null);
        return null;
      }

      // Hợp nhất với kết quả api_admin
      const adminVal = adminRes.status === "fulfilled" ? adminRes.value : null;
      const merged = mergeAdminInfo(normalized, adminVal);

      setUser(merged);
      return merged;
    } catch (_) {
      // Gặp lỗi mạng hoặc API → reset user
      setUser(null);
      return null;
    } finally {
      // Dù thành công hay thất bại đều tắt cờ loading
      setRefreshing(false);
      setLoading(false);
    }
  }

  // ------------------------------------------------------------
  // [useEffect] — tự động refresh khi mount lần đầu
  // ------------------------------------------------------------
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

  // ------------------------------------------------------------
  // [Giá trị Context] — truyền cho toàn bộ app
  // ------------------------------------------------------------
  const value = useMemo(
    () => ({
      user,
      setUser,
      loading,
      refreshing,
      refresh,
      isAuthenticated: !!user,
      // Helpers gắn sẵn user hiện tại
      hasRole: (roleId) => hasRole(user, roleId),
      hasAnyRole: (roleIds) => hasAnyRole(user, roleIds),
      hasAllRoles: (roleIds) => hasAllRoles(user, roleIds),
      isAdmin: () => isAdminUser(user),
    }),
    [user, loading, refreshing]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ------------------------------------------------------------
// [useAuth()] Hook tiện lợi để lấy context xác thực trong component
// ------------------------------------------------------------
export default function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}

// ------------------------------------------------------------
// [RoleGate] Component ẩn/hiện nội dung theo quyền người dùng
// anyOf: chỉ cần 1 role khớp
// allOf: yêu cầu tất cả role khớp
// fallback: JSX hiển thị nếu không có quyền
// ------------------------------------------------------------
export function RoleGate({ anyOf = [], allOf = [], fallback = null, children }) {
  const auth = useAuth();
  if (auth.loading) return null; // hoặc return spinner khi đang tải
  const okAny = anyOf.length === 0 || auth.hasAnyRole(anyOf);
  const okAll = allOf.length === 0 || auth.hasAllRoles(allOf);
  return okAny && okAll ? children : fallback;
}
