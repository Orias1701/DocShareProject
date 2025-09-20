// src/services/user_followServices.js
import fetchJson from "./fetchJson";

// Action names phải khớp router/index.php của bạn
const ACTIONS = {
  toggle: "toggle_follow",
  top: "api_top_followed",         // ✅ API bạn cung cấp
  following: "api_user_following",
  followers: "api_user_followers",
};

// Gửi POST dạng FormData vì BE đọc từ $_POST (không parse JSON body)
function postForm(action, payload = {}) {
  const fd = new FormData();
  Object.entries(payload).forEach(([k, v]) => {
    if (v !== undefined && v !== null) fd.append(k, v);
  });
  return fetchJson(action, { method: "POST", body: fd });
}

// Luôn trả {status, data}
async function normalizeApiResponse(promise) {
  const res = await promise;

  // BE của bạn trả {"status":"ok","data":[...]}
  if (res && typeof res === "object" && "status" in res && "data" in res) {
    // Chuẩn hoá status về 'success' cho FE dễ dùng
    const status =
      String(res.status).toLowerCase() === "ok" ? "success" : String(res.status);
    return { status, data: Array.isArray(res.data) ? res.data : [] };
  }

  // Nếu trả mảng thẳng
  if (Array.isArray(res)) return { status: "success", data: res };

  // Fallback
  return { status: "success", data: [] };
}

export const user_followServices = {
  toggle(following_id) {
    return normalizeApiResponse(postForm(ACTIONS.toggle, { following_id }));
  },
  top(limit = 10) {
    return normalizeApiResponse(
      fetchJson(`${ACTIONS.top}&limit=${encodeURIComponent(limit)}`)
    );
  },
  userFollowing() {
    return normalizeApiResponse(fetchJson(ACTIONS.following));
  },
  userFollowers() {
    return normalizeApiResponse(fetchJson(ACTIONS.followers));
  },
};

export default user_followServices;
