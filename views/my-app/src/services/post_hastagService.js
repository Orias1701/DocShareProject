// [Tác dụng file] Gắn/Xoá/Đổi hashtag cho post; liệt kê hashtag của post; lấy post theo hashtag
import fetchJson from "./fetchJson";

// [Tác dụng] Action API cho post-hashtag
const ACTIONS = {
  create: "create_post_hashtag",
  update: "update_post_hashtag",
  delete: "delete_post_hashtag",
  listByPost: "list_post_hashtags",
  getPostsByHashtagId: "posts_by_hashtag"
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

// [Tác dụng] Chuẩn hoá phản hồi về dạng có status/data để dễ dùng
async function normalizeApiResponse(promise) {
  let res = await promise;

  if (Array.isArray(res)) return { status: "success", data: res };
  if (res && typeof res === "object" && "status" in res && "data" in res) return res;
  return { status: "success", data: Array.isArray(res) ? res : [res] };
}

export const post_hashtagService = {
  // [Tác dụng] Gắn nhiều hashtag cho post (truyền mảng tên)
  create: function (postId, hashtagNames) {
    let names = Array.isArray(hashtagNames) ? hashtagNames.join(",") : "";
    return normalizeApiResponse(
      postForm(ACTIONS.create, { post_id: postId, hashtag_name: names })
    );
  },

  // [Tác dụng] Đổi hashtag cho post (old_hashtag_id -> new_hashtag_id)
  update: function (postId, oldHashtagId, newHashtagId) {
    return normalizeApiResponse(
      postForm(ACTIONS.update, {
        post_id: postId,
        old_hashtag_id: oldHashtagId,
        new_hashtag_id: newHashtagId
      })
    );
  },

  // [Tác dụng] Xoá 1 hashtag khỏi post
  delete: function (postId, hashtagId) {
    return normalizeApiResponse(
      postForm(ACTIONS.delete, { post_id: postId, hashtag_id: hashtagId })
    );
  },

  // [Tác dụng] Liệt kê các hashtag của 1 post
  listByPost: function (postId) {
    return normalizeApiResponse(
      fetchJson(ACTIONS.listByPost + "&post_id=" + encodeURIComponent(postId))
    );
  },

  // [Tác dụng] Lấy các post theo 1 hashtag_id
  getPostsByHashtagId: function (hashtagId) {
    return normalizeApiResponse(
      fetchJson(ACTIONS.getPostsByHashtagId + "&hashtag_id=" + encodeURIComponent(hashtagId))
    );
  }
};

export default post_hashtagService;
