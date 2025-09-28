// src/services/user_followServices.js
import fetchJson from "./fetchJson";

const ACTIONS = {
  toggle: "toggle_follow",
  top: "api_top_followed",
  following: "api_user_following",
  followers: "api_user_followers",
};

// Helper POST FormData (đừng set Content-Type tự tay)
async function postForm(action, payload = {}) {
  const fd = new FormData();
  Object.entries(payload).forEach(([k, v]) => {
    if (v !== undefined && v !== null) fd.append(k, v);
  });

  // Nếu fetchJson CHƯA set credentials, ta thêm ở đây:
  return fetchJson(action, {
    method: "POST",
    body: fd,
    credentials: "include", // 👈 đảm bảo mang cookie/session
  });
}

async function normalizeApiResponse(promise) {
  const res = await promise;
  // Log để nhìn rõ BE trả gì
  console.log("[followServices] raw response:", res);

  if (res && typeof res === "object" && "status" in res && "data" in res) {
    const status = String(res.status).toLowerCase() === "ok" ? "success" : String(res.status);
    return { status, data: Array.isArray(res.data) ? res.data : [] };
  }
  if (Array.isArray(res)) return { status: "success", data: res };
  return { status: "success", data: [] };
}

export const user_followServices = {
  // ⚠️ GỬI CẢ HAI: following_id VÀ user_id để “an toàn”
  toggle(targetUserId) {
    return normalizeApiResponse(
      postForm(ACTIONS.toggle, { following_id: targetUserId, user_id: targetUserId })
    );
  },
  top(limit = 10) {
    return normalizeApiResponse(fetchJson(`${ACTIONS.top}&limit=${encodeURIComponent(limit)}`, { credentials: "include" }));
  },
  userFollowing() {
    return normalizeApiResponse(fetchJson(ACTIONS.following, { credentials: "include" }));
  },
  userFollowers() {
    return normalizeApiResponse(fetchJson(ACTIONS.followers, { credentials: "include" }));
  },
};

export default user_followServices;
