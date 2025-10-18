// [Tác dụng file] Theo dõi/ngừng theo dõi người dùng; lấy top, danh sách following/followers; đếm
import fetchJson from "./fetchJson";

// [Tác dụng] Action API cho follow
const ACTIONS = {
  toggle: "toggle_follow",
  top: "api_top_followed",
  following: "api_user_following",
  followers: "api_user_followers",
  countFollowers: "count_followers",
  countFollowing: "count_following"
};

// [Tác dụng] POST FormData tiện dụng cho các hành động cần body
async function postForm(action, payload) {
  let fd = new FormData();
  let obj = payload || {};
  for (let k in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, k)) {
      let v = obj[k];
      if (v !== undefined && v !== null) fd.append(k, v);
    }
  }
  return fetchJson(action, { method: "POST", body: fd, credentials: "include" });
}

// [Tác dụng] Chuẩn hoá phản hồi về {status, data}
async function normalizeApiResponse(promise) {
  let res = await promise;
  if (res && typeof res === "object" && "status" in res && "data" in res) {
    let status = String(res.status).toLowerCase() === "ok" ? "success" : String(res.status);
    return { status: status, data: res.data };
  }
  if (Array.isArray(res)) return { status: "success", data: res };
  return { status: "success", data: [] };
}

// [Tác dụng] Gom API follow
export const user_followServices = {
  // [Tác dụng] Toggle follow/unfollow một user
  toggle: function (targetUserId) {
    return normalizeApiResponse(
      postForm(ACTIONS.toggle, { following_id: targetUserId, user_id: targetUserId })
    );
  },

  // [Tác dụng] Lấy danh sách user được theo dõi nhiều nhất (giới hạn)
  top: function (limit) {
    let lim = (typeof limit === "number" ? limit : 10);
    return normalizeApiResponse(
      fetchJson(ACTIONS.top + "&limit=" + encodeURIComponent(lim), { credentials: "include" })
    );
  },

  // [Tác dụng] Lấy danh sách mình đang theo dõi (theo session)
  userFollowing: function () {
    return normalizeApiResponse(fetchJson(ACTIONS.following, { credentials: "include" }));
  },

  // [Tác dụng] Lấy danh sách theo dõi mình (followers)
  userFollowers: function () {
    return normalizeApiResponse(fetchJson(ACTIONS.followers, { credentials: "include" }));
  },

  // [Tác dụng] Đếm followers (có thể đếm theo user chỉ định)
  countFollowers: async function (userId) {
    let url = userId ? (ACTIONS.countFollowers + "&user_id=" + encodeURIComponent(userId)) : ACTIONS.countFollowers;
    let res = await fetchJson(url, { credentials: "include" });
    let count = (res && res.data && typeof res.data.count !== "undefined") ? Number(res.data.count) : 0;
    return { status: "success", data: { count: count } };
  },

  // [Tác dụng] Đếm following (có thể đếm theo user chỉ định)
  countFollowing: async function (userId) {
    let url = userId ? (ACTIONS.countFollowing + "&user_id=" + encodeURIComponent(userId)) : ACTIONS.countFollowing;
    let res = await fetchJson(url, { credentials: "include" });
    let count = (res && res.data && typeof res.data.count !== "undefined") ? Number(res.data.count) : 0;
    return { status: "success", data: { count: count } };
  }
};

export default user_followServices;
