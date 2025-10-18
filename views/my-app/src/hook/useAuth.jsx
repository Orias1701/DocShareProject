// [Tác dụng file] Tạo context xác thực; cung cấp AuthProvider và hook useAuth để lấy user/refresh/login state
import { createContext, useContext, useEffect, useState } from "react";

// [Tác dụng] URL kiểm tra phiên đăng nhập (lấy thông tin người dùng hiện tại)
const API_ME_URL = "http://localhost:3000/public/index.php?action=api_me";

// [Tác dụng] Context lưu trạng thái xác thực (user, loading, v.v.)
const AuthContext = createContext(null);

// [Tác dụng] Bao bọc ứng dụng, cung cấp giá trị xác thực cho các component con
export function AuthProvider({ children }) {
  // [Tác dụng] Trạng thái người dùng và cờ tải
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // [Tác dụng] Làm mới (fetch) thông tin đăng nhập hiện tại và chuẩn hoá user
  async function refresh() {
    try {
      const res = await fetch(API_ME_URL, {
        method: "GET",
        credentials: "include",
        headers: { Accept: "application/json" }
      });

      if (!res.ok) {
        setUser(null);
        return;
      }

      // [Tác dụng] Cố gắng parse JSON; nếu lỗi thì trả object rỗng
      let data = {};
      try {
        data = await res.json();
      } catch (e) {
        data = {};
      }

      // [Tác dụng] Kiểm tra cấu trúc phản hồi và chuẩn hoá các field hiển thị
      if (data && typeof data === "object" && data.status === "ok" && data.user) {
        const raw = data.user;

        // Sao chép an toàn tất cả key từ raw sang normalized (tránh spread)
        let normalized = {};
        for (let k in raw) {
          if (Object.prototype.hasOwnProperty.call(raw, k)) {
            normalized[k] = raw[k];
          }
        }

        // Bổ sung các field fallback để UI luôn hiển thị được
        let fallbackAvatar = "https://cdn2.fptshop.com.vn/small/avatar_trang_1_cd729c335b.jpg";
        let avatarUrl = (raw && raw.avatar_url) ? raw.avatar_url
          : (raw && raw.avatar) ? raw.avatar
          : (raw && raw.profile_image) ? raw.profile_image
          : fallbackAvatar;
        let fullName = (raw && raw.full_name) ? raw.full_name
          : (raw && raw.name) ? raw.name
          : (raw && raw.username) ? raw.username
          : "User name";

        normalized.avatar_url = avatarUrl;
        normalized.full_name = fullName;

        setUser(normalized);
      } else {
        setUser(null);
      }
    } catch (e) {
      // [Tác dụng] Lỗi mạng/khác → coi như chưa đăng nhập
      setUser(null);
    }
  }

  // [Tác dụng] Tự động refresh 1 lần khi mount; sau đó tắt cờ loading
  useEffect(function () {
    let mounted = true;
    (async function () {
      await refresh();
      if (mounted) setLoading(false);
    })();
    return function () { mounted = false; };
  }, []);

  // [Tác dụng] Giá trị cung cấp qua context cho toàn app
  const value = {
    user: user,
    setUser: setUser,
    loading: loading,
    refresh: refresh,
    isAuthenticated: !!user
  };

  // [Tác dụng] Render provider bao ngoài children
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// [Tác dụng] Hook tiện lấy giá trị xác thực trong component con
export default function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within <AuthProvider>");
  }
  return ctx;
}
