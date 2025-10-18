// [Tác dụng file] Hook lấy "người dùng hiện tại" đã chuẩn hoá, có cache để tránh gọi lặp
import { useEffect, useState } from "react";
import { authApi } from "../services/usersServices";
import { userInfoApi } from "../services/user_infoServices";

// [Tác dụng] Biến module-level để cache user giữa nhiều component
let cachedUser = null;
let inFlight = null;

// [Tác dụng] Hook trả về { user, loading, error } cho UI
export default function useCurrentUser() {
  // [Tác dụng] Khởi tạo state từ cache (nếu có)
  const [user, setUser] = useState(cachedUser);
  const [loading, setLoading] = useState(!cachedUser);
  const [error, setError] = useState(null);

  // [Tác dụng] Khi mount: nếu chưa có cache thì thực hiện fetch chuỗi me → info
  useEffect(function () {
    // Nếu đã có cache, không cần fetch lại
    if (cachedUser) return;

    // Nếu chưa có request đang chạy, khởi động một request dùng chung (share promise)
    if (!inFlight) {
      inFlight = (async function () {
        try {
          // 1) Lấy thông tin đăng nhập hiện tại
          const meRes = await authApi.me();
          let me = (meRes && typeof meRes === "object" && meRes.user) ? meRes.user : null;
          let id = (me && (typeof me.user_id !== "undefined")) ? me.user_id : null;
          if (!id) throw new Error("Không tìm thấy user_id từ api_me");

          // 2) Cố lấy thông tin chi tiết từ user_info; nếu lỗi thì dùng dữ liệu thô từ me
          let infoUser = null;
          try {
            const infoRes = await userInfoApi.showUserInfo(id);
            if (infoRes && typeof infoRes === "object") {
              if (infoRes.user) infoUser = infoRes.user;
              else if (infoRes.data && infoRes.data.user) infoUser = infoRes.data.user;
              else if (infoRes.data) infoUser = infoRes.data;
              else infoUser = infoRes;
            } else {
              infoUser = me;
            }
          } catch (e) {
            infoUser = me;
          }

          // 3) Chuẩn hoá field hiển thị tối thiểu để UI không bị thiếu
          let normalized = {};
          if (infoUser && typeof infoUser === "object") {
            for (let k in infoUser) {
              if (Object.prototype.hasOwnProperty.call(infoUser, k)) {
                normalized[k] = infoUser[k];
              }
            }
          }

          let fallbackAvatar = "https://cdn2.fptshop.com.vn/small/avatar_trang_1_cd729c335b.jpg";
          let avatar =
            (infoUser && infoUser.avatar_url) ? infoUser.avatar_url
            : (infoUser && infoUser.avatar) ? infoUser.avatar
            : fallbackAvatar;
          let name =
            (infoUser && infoUser.full_name) ? infoUser.full_name
            : (infoUser && infoUser.real_name) ? infoUser.real_name
            : (infoUser && infoUser.username) ? infoUser.username
            : "User name";
          let username =
            (infoUser && infoUser.username) ? infoUser.username : "no-username";

          normalized.__display = {
            avatar: avatar,
            name: name,
            username: username
          };

          // Lưu cache và trả về
          cachedUser = normalized;
          return normalized;
        } finally {
          // Dù thành công hay thất bại, giải phóng cờ inFlight
          inFlight = null;
        }
      })();
    }

    // Chờ request dùng chung, rồi cập nhật state hiện tại
    (async function () {
      try {
        const result = await inFlight;
        setUser(result);
      } catch (e) {
        setError((e && e.message) ? e.message : "Lỗi không xác định");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // [Tác dụng] Trả về cho component: user/đang tải/lỗi
  return { user: user, loading: loading, error: error };
}
