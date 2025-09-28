// src/services/postService.js
import fetchJson from "./fetchJson";

const ACTIONS = {
  // Posts
  getLatest: "get_latest_posts",
  getPopular: "get_popular_posts",
  postDetail: "post_detail",
  postsByCategory: "get_posts_by_category",
  showPostDetail: "show_post_detail",
  listAll: "list_all_posts",
  create: "create_post",
  update: "update_post",
  delete: "delete_post",
  listPostByUser: "list_posts_by_user",
  listUserPosts : "list_posts_by_user",
  postsByAlbum: "get_posts_by_album",   
  // Post ↔ Hashtag
  listPostHashtags: "list_post_hashtags",
  postsByHashtag: "posts_by_hashtag",
  createPostHashtag: "create_post_hashtag",
  updatePostHashtag: "update_post_hashtag",
  deletePostHashtag: "delete_post_hashtag",

  // Master data cho form NewPost
  listCategories: "list_categories",
  listAlbums: "list_albums",
  listHashtags: "list_hashtags",

  // Feed từ người đang theo dõi
  getPostsFromFollowedUsers: "list_posts_by_following",
};

// --- helpers ---
function toFormData(obj = {}) {
  const fd = new FormData();
  Object.entries(obj).forEach(([k, v]) => {
    if (v !== undefined && v !== null) fd.append(k, v);
  });
  return fd;
}

function pickArray(payload) {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== "object") return [];
  // hỗ trợ nhiều kiểu BE hay trả
  const keys = ["data", "items", "list", "categories", "albums", "hashtags", "posts"];
  for (const k of keys) if (Array.isArray(payload[k])) return payload[k];
  return [];
}

function normalizeItem(obj, kind) {
  // Trả về { id, name } dù BE đặt tên khác
  const id =
    obj?.id ??
    obj?.category_id ??
    obj?.album_id ??
    obj?.hashtag_id ??
    obj?.cat_id ??
    obj?.alb_id ??
    obj?.tag_id;

  const name =
    obj?.name ??
    obj?.category_name ??
    obj?.album_name ??
    obj?.hashtag_name ??
    obj?.title ??
    obj?.label;

  return id && name ? { id, name } : null;
}

function normalizeList(arr, kind) {
  return arr.map((x) => normalizeItem(x, kind)).filter(Boolean);
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

  // Feed từ người đang theo dõi
  async listPostsByFollowing() {
    const res = await fetchJson(ACTIONS.getPostsFromFollowedUsers);
    return Array.isArray(res?.data) ? res.data : [];
  },

  // CRUD post
  create(params) {
    const body = toFormData({
      title: params.title,
      content: params.content,
      description: params.description, // bạn đang map summary/description ở page
      summary: params.summary,
      album_id: params.album_id,
      category_id: params.category_id,
      hashtags: params.hashtags, // chuỗi hashtags nếu BE hỗ trợ
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
  getByHashtagId(hashtag_id) {
    return fetchJson(`${ACTIONS.postsByHashtag}&hashtag_id=${encodeURIComponent(hashtag_id)}`);
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

  // Gán nhiều hashtag bằng tên (CSV hoặc mảng)
  addHashtagsToPostByNames({ post_id, names }) {
    const csv = Array.isArray(names) ? names.filter(Boolean).join(",") : String(names || "");
    const body = toFormData({ post_id, hashtag_name: csv }); // BE đọc 'hashtag_name'
    return fetchJson(ACTIONS.createPostHashtag, { method: "POST", body });
  },

  // ---------- Master data cho form ----------
  async listCategories() {
    const res = await fetchJson(ACTIONS.listCategories);
    return normalizeList(pickArray(res), "category");
  },
  async listAlbums() {
    const res = await fetchJson(ACTIONS.listAlbums);
    return normalizeList(pickArray(res), "album");
  },
  async listHashtags() {
    const res = await fetchJson(ACTIONS.listHashtags);
    return normalizeList(pickArray(res), "hashtag");
  },

  // ---------- My posts ----------
  async listMyPosts() {
    const res = await fetchJson(ACTIONS.listPostByUser); // GET
    return Array.isArray(res?.data) ? res.data : [];
  },
  // Lấy bài viết của user bất kỳ (dùng ở profile public)
  async listUserPosts(user_id) {
    const res = await fetchJson(
      `${ACTIONS.listUserPosts}&user_id=${encodeURIComponent(user_id)}`
    ); // GET
    return Array.isArray(res?.data) ? res.data : [];
  },
  getByAlbum(album_id) {
    return fetchJson(`${ACTIONS.postsByAlbum}&album_id=${encodeURIComponent(album_id)}`);
  },

};

export default postService;
