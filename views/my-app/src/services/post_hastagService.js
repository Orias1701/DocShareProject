// src/services/post_hashtagService.js
import fetchJson from "./fetchJson";

const ACTIONS = {
  create: "create_post_hashtag", // POST
  update: "update_post_hashtag", // POST
  delete: "delete_post_hashtag", // POST hoặc GET tuỳ BE
  listByPost: "list_post_hashtags", // GET
  getPostsByHashtagId: "posts_by_hashtag", // GET
};

// Gửi POST dạng FormData
function postForm(action, payload = {}) {
  const fd = new FormData();
  Object.entries(payload).forEach(([k, v]) => {
    if (v !== undefined && v !== null) fd.append(k, v);
  });
  return fetchJson(action, { method: "POST", body: fd });
}

// Chuẩn hóa API response
async function normalizeApiResponse(promise) {
  const res = await promise;

  if (Array.isArray(res)) return { status: "success", data: res };
  if (res && typeof res === "object" && "status" in res && "data" in res)
    return res;
  return { status: "success", data: Array.isArray(res) ? res : [res] };
}

export const post_hashtagService = {
  create(postId, hashtagNames) {
    // hashtagNames: mảng ["#tag1", "#tag2"]
    return normalizeApiResponse(
      postForm(ACTIONS.create, {
        post_id: postId,
        hashtag_name: hashtagNames.join(","), // giống BE PHP cũ
      })
    );
  },

  update(postId, oldHashtagId, newHashtagId) {
    return normalizeApiResponse(
      postForm(ACTIONS.update, { post_id: postId, old_hashtag_id: oldHashtagId, new_hashtag_id: newHashtagId })
    );
  },

  delete(postId, hashtagId) {
    return normalizeApiResponse(
      postForm(ACTIONS.delete, { post_id: postId, hashtag_id: hashtagId })
    );
  },

  listByPost(postId) {
    return normalizeApiResponse(
      fetchJson(`${ACTIONS.listByPost}&post_id=${encodeURIComponent(postId)}`)
    );
  },

  getPostsByHashtagId(hashtagId) {
    return normalizeApiResponse(
      fetchJson(`${ACTIONS.getPostsByHashtagId}&hashtag_id=${encodeURIComponent(hashtagId)}`)
    );
  },
};

export default post_hashtagService;
