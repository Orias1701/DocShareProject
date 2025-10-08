// src/services/post_reactionService.js
import fetchJson from "./fetchJson";

const ACTIONS = {
  toggle: "toggle_reaction_api",        // POST: post_id, reaction_type ('like'|'dislike')
  getState: "get_reaction_state_api",   // GET : post_id -> { ok, myReaction, counts }
  count: "count_reactions",     // GET : post_id -> { ok, likes, dislikes }
};

// Gửi POST dạng FormData
function postForm(action, payload = {}) {
  const fd = new FormData();
  Object.entries(payload).forEach(([k, v]) => {
    if (v !== undefined && v !== null) fd.append(k, v);
  });
  return fetchJson(action, { method: "POST", body: fd });
}

// Chuẩn hoá API response (tương thích cả {ok: true} hoặc {status,data})
async function normalizeApiResponse(promise) {
  const res = await promise;

  // Trường hợp API của reaction trả { ok: true, ... }
  if (res && typeof res === "object" && "ok" in res) {
    if (res.ok === true) return { status: "success", data: res };
    return { status: "error", data: res };
  }

  // Theo format mẫu
  if (Array.isArray(res)) return { status: "success", data: res };
  if (res && typeof res === "object" && "status" in res && "data" in res) return res;

  return { status: "success", data: Array.isArray(res) ? res : [res] };
}

export const post_reactionService = {
  /**
   * Toggle like/dislike cho 1 post
   * @param {number|string} postId
   * @param {'like'|'dislike'} reactionType
   */
  toggle(postId, reactionType) {
    if (!postId) throw new Error("postId is required");
    if (!["like", "dislike"].includes(reactionType)) {
      throw new Error("reactionType must be 'like' or 'dislike'");
    }
    return normalizeApiResponse(
      postForm(ACTIONS.toggle, {
        post_id: postId,
        reaction_type: reactionType,
      })
    );
  },

  /** Lấy trạng thái hiện tại (myReaction + counts) */
  getState(postId) {
    if (!postId) throw new Error("postId is required");
    return normalizeApiResponse(
      fetchJson(`${ACTIONS.getState}&post_id=${encodeURIComponent(postId)}`)
    );
  },

  /** Helper ngắn gọn */
  like(postId) {
    return this.toggle(postId, "like");
  },
  dislike(postId) {
    return this.toggle(postId, "dislike");
  },
  count(postId) {
    if (!postId) throw new Error("postId is required");
    return normalizeApiResponse(
      fetchJson(`${ACTIONS.count}&post_id=${encodeURIComponent(postId)}`)
    );
  },
};

export default post_reactionService;
