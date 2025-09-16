// src/services/user_followServices.js
import fetchJson from "./fetchJson";

// Action names phải khớp router/index.php của bạn
const ACTIONS = {
  toggle: "toggle_follow",          // -> UserFollowController::toggleFollow()
  top: "top_followed_users",        // -> UserFollowController::topFollowedUsers()
};

// Gửi POST dạng FormData vì BE đọc từ $_POST (không parse JSON body)
function postForm(action, payload = {}) {
  const fd = new FormData();
  Object.entries(payload).forEach(([k, v]) => {
    if (v !== undefined && v !== null) fd.append(k, v);
  });
  return fetchJson(action, { method: "POST", body: fd });
}

export const user_followServices = {
  /**
   * Bật/tắt follow 1 user
   * Response (success): { status: "success", following: boolean }
   * Lỗi chưa đăng nhập (status:"error") sẽ bị fetchJson throw
   */
  toggle(following_id) {
    return postForm(ACTIONS.toggle, { following_id });
  },

  /**
   * Lấy top user được follow nhiều nhất
   * Trả về mảng users (fetchJson đã unwrap data)
   */
  top(limit = 10) {
    return fetchJson(`${ACTIONS.top}&limit=${encodeURIComponent(limit)}`);
  },
};

export default user_followServices;
