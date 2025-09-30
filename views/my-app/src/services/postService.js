// src/services/postService.js
import fetchJson from "./fetchJson";

const ACTIONS = {
  // Posts
  getLatest: "latest_posts",
  getPopular: "popular_posts",
  postDetail: "post_detail_api",
  postsByCategory: "list_posts_by_category",
  listAll: "list_all_posts",
  create: "create_post",
  update: "update_post",
  delete: "delete_post",
  listPostByUser: "list_posts_by_user",
  listUserPosts: "list_posts_by_user",
  postsByAlbum: "get_posts_by_album",

  // Post ↔ Hashtag
  listPostHashtags: "list_post_hashtags",
  postsByHashtag: "posts_by_hashtag", // ← BE của bạn
  createPostHashtag: "create_post_hashtag",
  updatePostHashtag: "update_post_hashtag",
  deletePostHashtag: "delete_post_hashtag",

  // Master data
  listCategories: "list_categories",
  listAlbums: "list_albums",
  listHashtags: "list_hashtags",

  // Feed
  getPostsFromFollowedUsers: "list_posts_by_following",

  // ▼▼▼ Count posts (mới thêm, khớp routes bạn đưa) ▼▼▼
  countAllPosts: "count_posts_all",
  countPostsByUser: "count_posts_by_user",     // ?user_id=... | (session nếu không truyền)
  countPostsByAlbum: "count_posts_by_album",   // ?album_id=...
};

// --- helpers ---
function toFormData(obj = {}) {
  const fd = new FormData();
  Object.entries(obj).forEach(([k, v]) => {
    if (v !== undefined && v !== null) fd.append(k, v);
  });
  return fd;
}

function normalizePost(p) {
  if (!p) return null;
  return {
    post_id: p.post_id,
    title: p.title,
    content: p.content,
    banner_url: p.banner_url,
    created_at: p.created_at,
    album_id: p.album_id,
    album_name: p.album_name,
    user_id: p.user_id,
    username: p.username,
    email: p.email,
  };
}

// Chuẩn hoá kết quả count do BE có thể trả {status, data:{count}} hoặc {count}
function pickCount(res) {
  // ưu tiên { data: { count } }
  if (res && typeof res === "object") {
    if (res.data && typeof res.data.count !== "undefined") {
      return Number(res.data.count) || 0;
    }
    if (typeof res.count !== "undefined") {
      return Number(res.count) || 0;
    }
  }
  return 0;
}

export const postService = {
  // ---------- Posts ----------
  getLatest() {
    return fetchJson(ACTIONS.getLatest);
  },
  getPopular() {
    return fetchJson(ACTIONS.getPopular);
  },
  getByIdCompact(post_id) {
    return fetchJson(`${ACTIONS.postDetail}&post_id=${encodeURIComponent(post_id)}`);
  },
  getByCategory(category_id) {
    return fetchJson(`${ACTIONS.postsByCategory}&category_id=${encodeURIComponent(category_id)}`);
  },
  showDetail(post_id) {
    return fetchJson(`${ACTIONS.showPostDetail}&post_id=${encodeURIComponent(post_id)}`);
  },
  listAll() {
    return fetchJson(ACTIONS.listAll);
  },

  // Feed
  async listPostsByFollowing() {
    const res = await fetchJson(ACTIONS.getPostsFromFollowedUsers);
    return Array.isArray(res?.data) ? res.data : [];
  },

  // CRUD post
  create(params) {
    const body = toFormData({
      title: params.title,
      content: params.content,
      description: params.description,
      summary: params.summary,
      album_id: params.album_id,
      category_id: params.category_id,
      hashtags: params.hashtags,
      ...(params.banner ? { banner: params.banner } : {}),
      ...(params.content_file ? { content_file: params.content_file } : {}),
    });
    return fetchJson(ACTIONS.create, { method: "POST", body });
  },
  update(params) {
    const body = toFormData({
      post_id: params.post_id,
      title: params.title,
      content: params.content,
      description: params.description,
      summary: params.summary,
      album_id: params.album_id,
      category_id: params.category_id,
      ...(params.banner ? { banner: params.banner } : {}),
      ...(params.content_file ? { content_file: params.content_file } : {}),
    });
    return fetchJson(ACTIONS.update, { method: "POST", body });
  },
  remove(id) {
    return fetchJson(`${ACTIONS.delete}&id=${encodeURIComponent(id)}`);
  },
  removeViaPost(id) {
    const body = toFormData({ id });
    return fetchJson(ACTIONS.delete, { method: "POST", body });
  },

  // ---------- Post ↔ Hashtag ----------
  listHashtagsByPost(post_id) {
    return fetchJson(`${ACTIONS.listPostHashtags}&post_id=${encodeURIComponent(post_id)}`);
  },

  /**
   * Lấy posts theo hashtag.
   * Bạn có thể truyền { hashtag_id } *hoặc* { hashtag_name }.
   * BE trả JSON dạng: { status: "success", data: [ ...posts ] }
   */
  async getPostsByHashtag({ hashtag_id, hashtag_name }) {
    const q =
      hashtag_id != null
        ? `${ACTIONS.postsByHashtag}&hashtag_id=${encodeURIComponent(hashtag_id)}`
        : `${ACTIONS.postsByHashtag}&hashtag_name=${encodeURIComponent(hashtag_name ?? "")}`;

    const res = await fetchJson(q);
    const arr = Array.isArray(res?.data) ? res.data : [];
    return arr.map(normalizePost).filter(Boolean);
  },

  addHashtagToPost({ post_id, hashtag_id }) {
    const body = toFormData({ post_id, hashtag_id });
    return fetchJson(ACTIONS.createPostHashtag, { method: "POST", body });
  },
  updatePostHashtag({ post_id, old_hashtag_id, new_hashtag_id }) {
    const body = toFormData({ post_id, old_hashtag_id, new_hashtag_id });
    return fetchJson(ACTIONS.updatePostHashtag, { method: "POST", body });
  },
  deletePostHashtag({ post_id, hashtag_id }) {
    const body = toFormData({ post_id, hashtag_id });
    return fetchJson(ACTIONS.deletePostHashtag, { method: "POST", body });
  },

  // ---------- Master data ----------
  async listCategories() {
    const res = await fetchJson(ACTIONS.listCategories);
    const arr = Array.isArray(res?.data) ? res.data : [];
    return arr
      .map((x) => ({ id: x.category_id ?? x.id, name: x.category_name ?? x.name }))
      .filter(Boolean);
  },
  async listAlbums() {
    const res = await fetchJson(ACTIONS.listAlbums);
    const arr = Array.isArray(res?.data) ? res.data : [];
    return arr
      .map((x) => ({ id: x.album_id ?? x.id, name: x.album_name ?? x.name }))
      .filter(Boolean);
  },
  async listHashtags() {
    const res = await fetchJson(ACTIONS.listHashtags);
    const arr = Array.isArray(res?.data) ? res.data : [];
    return arr
      .map((x) => ({ id: x.hashtag_id ?? x.id, name: x.hashtag_name ?? x.name }))
      .filter(Boolean);
  },

  // ---------- My posts ----------
  async listMyPosts() {
    const res = await fetchJson(ACTIONS.listPostByUser);
    return Array.isArray(res?.data) ? res.data : [];
  },
  async listUserPosts(user_id) {
    const res = await fetchJson(`${ACTIONS.listUserPosts}&user_id=${encodeURIComponent(user_id)}`);
    return Array.isArray(res?.data) ? res.data : [];
  },

  getByAlbum(album_id) {
    return fetchJson(`${ACTIONS.postsByAlbum}&album_id=${encodeURIComponent(album_id)}`);
  },

  // ---------- COUNT POSTS (mới) ----------
  /**
   * Đếm tổng số bài viết trong hệ thống.
   * BE route: case 'count_posts_all'
   * Trả về: number
   */
  async countAllPosts() {
    const res = await fetchJson(ACTIONS.countAllPosts);
    return pickCount(res);
  },

  /**
   * Đếm số bài viết của một user.
   * Nếu không truyền user_id → BE dùng session (user hiện tại).
   * BE route: case 'count_posts_by_user'
   * Trả về: number
   */
  async countPostsByUser(user_id) {
    const url = user_id
      ? `${ACTIONS.countPostsByUser}&user_id=${encodeURIComponent(user_id)}`
      : ACTIONS.countPostsByUser; // dùng session
    const res = await fetchJson(url);
    return pickCount(res);
  },

  /**
   * Đếm số bài viết trong một album (bắt buộc album_id).
   * BE route: case 'count_posts_by_album'
   * Trả về: number
   */
  async countPostsByAlbum(album_id) {
    if (!album_id) throw new Error("album_id is required");
    const res = await fetchJson(
      `${ACTIONS.countPostsByAlbum}&album_id=${encodeURIComponent(album_id)}`
    );
    return pickCount(res);
  },
};

export default postService;
