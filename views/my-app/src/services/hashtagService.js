// src/services/hashtagService.js
import fetchJson from "./fetchJson";

const ACTIONS = {
  list: "list_hashtags",
  detail: "hashtag_detail",
  create: "create_hashtag",
  update: "update_hashtag",
  delete: "delete_hashtag",
};

function postJson(action, payload) {
  return fetchJson(action, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload ?? {}),
  });
}

export const hashtagService = {
  /** Lấy tất cả hashtag */
  list() {
    return fetchJson(ACTIONS.list); // -> {status:'ok', data:[...]} (fetchJson đã unwrap)
  },

  /** Chi tiết hashtag theo id */
  detail(id) {
    return fetchJson(`${ACTIONS.detail}&id=${encodeURIComponent(id)}`);
  },

  /** Tạo hashtag (tự thêm # ở BE, nhưng bạn có thể truyền 'abc' hoặc '#abc') */
  create({ hashtag_name }) {
    return postJson(ACTIONS.create, { hashtag_name });
  },

  /** Cập nhật hashtag */
  update({ hashtag_id, hashtag_name }) {
    return postJson(ACTIONS.update, { hashtag_id, hashtag_name });
  },

  /** Xoá hashtag */
  remove(id) {
    return postJson(ACTIONS.delete, { id });
    // hoặc: return fetchJson(`${ACTIONS.delete}&id=${encodeURIComponent(id)}`, { method:'POST' })
  },
};

export default hashtagService;
