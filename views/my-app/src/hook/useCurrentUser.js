// src/hooks/useCurrentUser.js
import { useEffect, useState } from "react";
import { authApi } from "../services/usersServices";
import { userInfoApi } from "../services/user_infoServices";

// Cache đơn giản trong module để tránh fetch lặp lại giữa các component
let cachedUser = null;
let inFlight = null;

export default function useCurrentUser() {
  const [user, setUser] = useState(cachedUser);
  const [loading, setLoading] = useState(!cachedUser);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (cachedUser) return; // đã có cache

    // nếu có request đang bay thì share promise
    if (!inFlight) {
      inFlight = (async () => {
        try {
          const meRes = await authApi.me(); // -> { status, user }
          const me = meRes?.user;
          const id = me?.user_id;
          if (!id) throw new Error("Không tìm thấy user_id từ api_me");

          let infoUser = null;
          try {
            const infoRes = await userInfoApi.showUserInfo(id); // -> { user, isFollowing } hoặc biến thể
            infoUser =
              infoRes?.user ??
              infoRes?.data?.user ??
              infoRes?.data ??
              infoRes ??
              null;
          } catch {
            infoUser = me;
          }

          // Chuẩn hoá trường hiển thị
          const normalized = {
            ...infoUser,
            __display: {
              avatar:
                infoUser?.avatar_url ||
                infoUser?.avatar ||
                "https://i.pravatar.cc/150?img=1",
              name:
                infoUser?.full_name ||
                infoUser?.real_name ||
                infoUser?.username ||
                "User name",
              username: infoUser?.username || "no-username",
            },
          };

          cachedUser = normalized;
          return normalized;
        } finally {
          inFlight = null;
        }
      })();
    }

    (async () => {
      try {
        const result = await inFlight;
        setUser(result);
      } catch (e) {
        setError(e?.message || "Lỗi không xác định");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return { user, loading, error };
}
