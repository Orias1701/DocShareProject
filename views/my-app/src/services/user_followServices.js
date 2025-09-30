// src/services/user_followServices.js
import fetchJson from "./fetchJson";

const ACTIONS = {
  toggle: "toggle_follow",
  top: "api_top_followed",
  following: "api_user_following",
  followers: "api_user_followers",
  countFollowers: "count_followers",   // hoặc 'api_count_followers' nếu router của bạn như thế
  countFollowing: "count_following",   // hoặc 'api_count_following'
};

// Helper POST FormData
async function postForm(action, payload = {}) {
  const fd = new FormData();
  Object.entries(payload).forEach(([k, v]) => {
    if (v !== undefined && v !== null) fd.append(k, v);
  });

  return fetchJson(action, {
    method: "POST",
    body: fd,
    credentials: "include",
  });
}

async function normalizeApiResponse(promise) {
  const res = await promise;
  if (res && typeof res === "object" && "status" in res && "data" in res) {
    const status = String(res.status).toLowerCase() === "ok" ? "success" : String(res.status);
    return { status, data: res.data };
  }
  if (Array.isArray(res)) return { status: "success", data: res };
  return { status: "success", data: [] };
}

export const user_followServices = {
  toggle(targetUserId) {
    return normalizeApiResponse(
      postForm(ACTIONS.toggle, { following_id: targetUserId, user_id: targetUserId })
    );
  },
  top(limit = 10) {
    return normalizeApiResponse(
      fetchJson(`${ACTIONS.top}&limit=${encodeURIComponent(limit)}`, { credentials: "include" })
    );
  },
  userFollowing() {
    return normalizeApiResponse(fetchJson(ACTIONS.following, { credentials: "include" }));
  },
  userFollowers() {
    return normalizeApiResponse(fetchJson(ACTIONS.followers, { credentials: "include" }));
  },

  /** ✅ Đếm followers: nếu truyền userId → đếm cho user đó, không ăn theo session */
  async countFollowers(userId) {
    const url = userId
      ? `${ACTIONS.countFollowers}&user_id=${encodeURIComponent(userId)}`
      : ACTIONS.countFollowers;
    const res = await fetchJson(url, { credentials: "include" });
    const count = (res && res.data && typeof res.data.count !== "undefined") ? Number(res.data.count) : 0;
    return { status: "success", data: { count } };
  },

  /** ✅ Đếm following: nếu truyền userId → đếm cho user đó */
  async countFollowing(userId) {
    const url = userId
      ? `${ACTIONS.countFollowing}&user_id=${encodeURIComponent(userId)}`
      : ACTIONS.countFollowing;
    const res = await fetchJson(url, { credentials: "include" });
    const count = (res && res.data && typeof res.data.count !== "undefined") ? Number(res.data.count) : 0;
    return { status: "success", data: { count } };
  },
};

export default user_followServices;
