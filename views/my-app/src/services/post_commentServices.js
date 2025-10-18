// [Tác dụng file] Quản lý bình luận theo bài viết (list/đếm/tạo/sửa/xoá)
import fetchJson from "./fetchJson";

// [Tác dụng] Action API cho comment
const ACTIONS = {
  listByPost: "list_comments_by_post",
  countCommentByPost: "count_comments_by_post",
  create: "create_comment",
  update: "update_comment",
  remove: "delete_comment"
};

export const post_commentServices = {
  // [Tác dụng] Lấy danh sách comment theo post_id
  listByPost: function (post_id) {
    return fetchJson(ACTIONS.listByPost + "&post_id=" + encodeURIComponent(post_id));
  },

  // [Tác dụng] Đếm số comment theo post_id
  countCommentByPost: function (post_id) {
    return fetchJson(ACTIONS.countCommentByPost + "&post_id=" + encodeURIComponent(post_id));
  },

  // [Tác dụng] Tạo comment mới cho post_id
  create: function (params) {
    let body = JSON.stringify({
      post_id: params && params.post_id,
      content: params && params.content
    });
    return fetchJson(ACTIONS.create, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: body
    });
  },

  // [Tác dụng] Cập nhật nội dung comment theo comment_id
  update: function (params) {
    let body = JSON.stringify({
      comment_id: params && params.comment_id,
      content: params && params.content
    });
    return fetchJson(ACTIONS.update, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: body
    });
  },

  // [Tác dụng] Xoá comment theo id
  remove: function (id) {
    return fetchJson(ACTIONS.remove + "&id=" + encodeURIComponent(id));
  }
};

export default post_commentServices;
