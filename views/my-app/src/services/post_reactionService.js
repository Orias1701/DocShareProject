// [Tác dụng file] Quản lý reaction (like/dislike): bật/tắt, trạng thái, và đếm
import fetchJson from "./fetchJson";

// [Tác dụng] Action API cho reaction
const ACTIONS = {
  toggle: "toggle_reaction_api",
  getState: "get_reaction_state_api",
  count: "count_reactions"
};

// [Tác dụng] Tạo body FormData và gọi POST
function postForm(action, payload) {
  let fd = new FormData();
  let obj = payload || {};
  for (let k in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, k)) {
      let v = obj[k];
      if (v !== undefined && v !== null) fd.append(k, v);
    }
  }
  return fetchJson(action, { method: "POST", body: fd });
}

// [Tác dụng] Chuẩn hoá phản hồi về dạng có status/data hoặc status/error
async function normalizeApiResponse(promise) {
  let res = await promise;

  if (res && typeof res === "object" && "ok" in res) {
    if (res.ok === true) return { status: "success", data: res };
    return { status: "error", data: res };
  }
  if (Array.isArray(res)) return { status: "success", data: res };
  if (res && typeof res === "object" && "status" in res && "data" in res) return res;
  return { status: "success", data: Array.isArray(res) ? res : [res] };
}

export const post_reactionService = {
  // [Tác dụng] Bật/tắt 1 reaction cho post (like/dislike)
  toggle: function (postId, reactionType) {
    if (!postId) throw new Error("postId is required");
    if (reactionType !== "like" && reactionType !== "dislike") {
      throw new Error("reactionType must be 'like' or 'dislike'");
    }
    return normalizeApiResponse(
      postForm(ACTIONS.toggle, { post_id: postId, reaction_type: reactionType })
    );
  },

  // [Tác dụng] Lấy trạng thái reaction hiện tại của post cho người dùng
  getState: function (postId) {
    if (!postId) throw new Error("postId is required");
    return normalizeApiResponse(
      fetchJson(ACTIONS.getState + "&post_id=" + encodeURIComponent(postId))
    );
  },

  // [Tác dụng] Tạo nhanh like (wrapper)
  like: function (postId) {
    return this.toggle(postId, "like");
  },

  // [Tác dụng] Tạo nhanh dislike (wrapper)
  dislike: function (postId) {
    return this.toggle(postId, "dislike");
  },

  // [Tác dụng] Đếm số reaction của post
  count: function (postId) {
    if (!postId) throw new Error("postId is required");
    return normalizeApiResponse(
      fetchJson(ACTIONS.count + "&post_id=" + encodeURIComponent(postId))
    );
  }
};

export default post_reactionService;
