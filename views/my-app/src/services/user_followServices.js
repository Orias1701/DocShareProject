// src/services/user_followServices.js
import fetchJson from "./fetchJson";

// Action names phải khớp router/index.php của bạn
const ACTIONS = {
  toggle: "toggle_follow",            // UserFollowController::toggleFollow()
  top: "api_top_followed",            // lấy top user được follow nhiều nhất
  following: "api_user_following",    // lấy danh sách user mà mình đang follow
  followers: "api_user_followers",    // lấy danh sách user follow mình
};

// Gửi POST dạng FormData vì BE đọc từ $_POST (không parse JSON body)
function postForm(action, payload = {}) {
  const fd = new FormData();
  Object.entries(payload).forEach(([k, v]) => {
    if (v !== undefined && v !== null) fd.append(k, v);
  });
  return fetchJson(action, { method: "POST", body: fd });
}

// Normalize: luôn trả về { status, data } dù BE trả mảng thẳng hay object
async function normalizeApiResponse(promise) {
  const res = await promise;

  // Nếu res là mảng thẳng, wrap vào object
  if (Array.isArray(res)) {
    return { status: "success", data: res };
  }

  // Nếu res có status + data, trả nguyên
  if (res && typeof res === "object" && "status" in res && "data" in res) {
    return res;
  }

  // Fallback: nếu res object nhưng không có status
  return { status: "success", data: Array.isArray(res) ? res : [res] };
}

export const user_followServices = {
  // Bật/tắt follow 1 user
  toggle(following_id) {
    return normalizeApiResponse(postForm(ACTIONS.toggle, { following_id }));
  },

  // Lấy top user được follow nhiều nhất
  top(limit = 10) {
    return normalizeApiResponse(
      fetchJson(`${ACTIONS.top}&limit=${encodeURIComponent(limit)}`)
    );
  },

  // Lấy danh sách user mà mình đang follow
  userFollowing() {
    return normalizeApiResponse(fetchJson(ACTIONS.following));
  },

  // Lấy danh sách user follow mình
  userFollowers() {
    return normalizeApiResponse(fetchJson(ACTIONS.followers));
  },
};

export default user_followServices;
