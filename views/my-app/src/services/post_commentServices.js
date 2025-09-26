import fetchJson from "./fetchJson";

const ACTIONS = {
  listByPost: "list_comments_by_post",
  countCommentByPost:"count_comments_by_post",
  create: "create_comment",
  update: "update_comment",
  remove: "delete_comment",
};

export const post_commentServices = {
  listByPost(post_id) {
    return fetchJson(`${ACTIONS.listByPost}&post_id=${encodeURIComponent(post_id)}`);
  },
  countCommentByPost(post_id) {
    return fetchJson(`${ACTIONS.countCommentByPost}&post_id=${encodeURIComponent(post_id)}`);
  },

  // Gửi JSON
  create({ post_id, content }) {
    const body = JSON.stringify({ post_id, content });
    return fetchJson(ACTIONS.create, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    });
  },

  update({ comment_id, content }) {
    const body = JSON.stringify({ comment_id, content });
    return fetchJson(ACTIONS.update, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    });
  },

  remove(id) {
    return fetchJson(`${ACTIONS.remove}&id=${encodeURIComponent(id)}`);
  },
};

export default post_commentServices;
