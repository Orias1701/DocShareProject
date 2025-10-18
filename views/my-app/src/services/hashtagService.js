// [Tác dụng file] CRUD hashtag và lấy hashtag của người dùng
import fetchJson from "./fetchJson";

// [Tác dụng] Action API cho hashtag
const ACTIONS = {
  list: "list_hashtags",
  detail: "hashtag_detail",
  create: "create_hashtag",
  update: "update_hashtag",
  delete: "delete_hashtag",
  myHashtag: "my_hashtags"
};

// [Tác dụng] POST JSON tiện lợi
function postJson(action, payload) {
  return fetchJson(action, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload || {})
  });
}

export const hashtagService = {
  // [Tác dụng] Lấy danh sách hashtag
  list: function () {
    return fetchJson(ACTIONS.list);
  },

  // [Tác dụng] Lấy chi tiết hashtag theo id
  detail: function (id) {
    return fetchJson(ACTIONS.detail + "&id=" + encodeURIComponent(id));
  },

  // [Tác dụng] Tạo hashtag mới
  create: function (params) {
    return postJson(ACTIONS.create, { hashtag_name: params && params.hashtag_name });
  },

  // [Tác dụng] Cập nhật hashtag theo id + tên mới
  update: function (params) {
    return postJson(ACTIONS.update, {
      hashtag_id: params && params.hashtag_id,
      hashtag_name: params && params.hashtag_name
    });
  },

  // [Tác dụng] Xoá hashtag theo id
  delete: function (id) {
    return postJson(ACTIONS.delete, { id: id });
  },

  // [Tác dụng] Lấy hashtag của tài khoản hiện tại
  myHashtag: function () {
    return fetchJson(ACTIONS.myHashtag);
  }
};

export default hashtagService;
