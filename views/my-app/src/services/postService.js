// src/services/postService.js
import fetchJson, { buildActionUrl } from "./fetchJson"; 

// [Tác dụng] Khai báo các action do backend cung cấp cho post
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
  //Dowload
  download: "download",
  // Post ↔ Hashtag
  listPostHashtags: "list_post_hashtags",
  postsByHashtag: "posts_by_hashtag",
  createPostHashtag: "create_post_hashtag",
  updatePostHashtag: "update_post_hashtag",
  deletePostHashtag: "delete_post_hashtag",
  // Master data
  listCategories: "list_categories",
  listAlbums: "list_albums",
  listHashtags: "list_hashtags",
  // Feed
  getPostsFromFollowedUsers: "list_posts_by_following",
  // Count
  countAllPosts: "count_posts_all",
  countPostsByUser: "count_posts_by_user",
  countPostsByAlbum: "count_posts_by_album"
};

// [Tác dụng] Chuyển object → FormData để gửi POST (có thể kèm file)
function toFormData(obj) {
  let fd = new FormData();
  if (obj && typeof obj === "object") {
    for (let k in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, k)) {
        let v = obj[k];
        if (v !== undefined && v !== null) {
          fd.append(k, v);
        }
      }
    }
  }
  return fd;
}

// [Tác dụng] Chuẩn hoá 1 post về cấu trúc gọn gàng
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
    email: p.email
  };
}

// [Tác dụng] Trích số đếm từ nhiều kiểu response khác nhau ({data:{count}} | {count} | ...)
function pickCount(res) {
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

// [Tác dụng] Gom các API thao tác với post
export const postService = {
  getLatest() {
    return fetchJson(ACTIONS.getLatest);
  },

  getPopular() {
    return fetchJson(ACTIONS.getPopular);
  },

  getByIdCompact(post_id) {
    return fetchJson(ACTIONS.postDetail + "&post_id=" + encodeURIComponent(post_id));
  },

  getByCategory(category_id) {
    return fetchJson(ACTIONS.postsByCategory + "&category_id=" + encodeURIComponent(category_id));
  },

  showDetail(post_id) {
    return fetchJson(ACTIONS.postDetail + "&post_id=" + encodeURIComponent(post_id));
  },

  listAll() {
    return fetchJson(ACTIONS.listAll);
  },

  async listPostsByFollowing() {
    let res = await fetchJson(ACTIONS.getPostsFromFollowedUsers);
    return res && typeof res === "object" && Array.isArray(res.data) ? res.data : [];
  },

  create(params) {
    let fd = new FormData();
    if (params) {
      if ("title" in params) fd.append("title", params.title);
      if ("content" in params) fd.append("content", params.content);
      if ("description" in params) fd.append("description", params.description);
      if ("summary" in params) fd.append("summary", params.summary);
      if ("album_id" in params) fd.append("album_id", params.album_id);
      if ("category_id" in params) fd.append("category_id", params.category_id);
      if ("hashtags" in params) fd.append("hashtags", params.hashtags);
      if ("banner" in params && params.banner) fd.append("banner", params.banner);
      if ("content_file" in params && params.content_file) fd.append("content_file", params.content_file);
    }
    return fetchJson(ACTIONS.create, { method: "POST", body: fd });
  },

  update(params) {
    let fd = new FormData();
    function has(k) { return params && Object.prototype.hasOwnProperty.call(params, k); }
    function app(k) { if (has(k)) fd.append(k, params[k]); }

    // Bắt buộc
    app("post_id");

    // Meta
    app("title");
    app("banner_url");
    if (has("bannerFile") && params.bannerFile) fd.append("banner", params.bannerFile);
    if (has("banner") && params.banner) fd.append("banner", params.banner);

    // Chuyển album/category
    app("album_id_new");
    app("category_id_new");

    // Admin-only: đổi tên album/category
    app("album_name_new");
    app("category_name_new");

    // Nhóm chỉnh nội dung đầy đủ (flow cũ)
    app("content");
    app("description");
    app("summary");
    app("album_id");
    app("category_id");
    if (has("content_file") && params.content_file) fd.append("content_file", params.content_file);

    return fetchJson(ACTIONS.update, { method: "POST", body: fd });
  },

  remove(id) {
    return fetchJson(ACTIONS.delete + "&post_id=" + encodeURIComponent(id));
  },

  removeViaPost(id) {
    let body = toFormData({ post_id: id });
    return fetchJson(ACTIONS.delete, { method: "POST", body: body });
  },

  listHashtagsByPost(post_id) {
    return fetchJson(ACTIONS.listPostHashtags + "&post_id=" + encodeURIComponent(post_id));
  },

  async getPostsByHashtag(params) {
    let hashtag_id = params && params.hashtag_id;
    let hashtag_name = params && params.hashtag_name;
    let q;
    if (hashtag_id !== undefined && hashtag_id !== null) {
      q = ACTIONS.postsByHashtag + "&hashtag_id=" + encodeURIComponent(hashtag_id);
    } else {
      let name = hashtag_name || "";
      q = ACTIONS.postsByHashtag + "&hashtag_name=" + encodeURIComponent(name);
    }

    let res = await fetchJson(q);
    let arr = res && typeof res === "object" && Array.isArray(res.data) ? res.data : [];
    let out = [];
    for (let i = 0; i < arr.length; i++) {
      let n = normalizePost(arr[i]);
      if (n) out.push(n);
    }
    return out;
  },

  addHashtagToPost(params) {
    let body = toFormData({ post_id: params && params.post_id, hashtag_id: params && params.hashtag_id });
    return fetchJson(ACTIONS.createPostHashtag, { method: "POST", body: body });
  },

  updatePostHashtag(params) {
    let body = toFormData({
      post_id: params && params.post_id,
      old_hashtag_id: params && params.old_hashtag_id,
      new_hashtag_id: params && params.new_hashtag_id
    });
    return fetchJson(ACTIONS.updatePostHashtag, { method: "POST", body: body });
  },

  deletePostHashtag(params) {
    let body = toFormData({ post_id: params && params.post_id, hashtag_id: params && params.hashtag_id });
    return fetchJson(ACTIONS.deletePostHashtag, { method: "POST", body: body });
  },

  async listCategories() {
    let res = await fetchJson(ACTIONS.listCategories);
    let arr = res && typeof res === "object" && Array.isArray(res.data) ? res.data : [];
    let out = [];
    for (let i = 0; i < arr.length; i++) {
      let x = arr[i];
      out.push({ id: x.category_id !== undefined ? x.category_id : x.id, name: x.category_name !== undefined ? x.category_name : x.name });
    }
    return out;
  },

  async listAlbums() {
    let res = await fetchJson(ACTIONS.listAlbums);
    let arr = res && typeof res === "object" && Array.isArray(res.data) ? res.data : [];
    let out = [];
    for (let i = 0; i < arr.length; i++) {
      let x = arr[i];
      out.push({ id: x.album_id !== undefined ? x.album_id : x.id, name: x.album_name !== undefined ? x.album_name : x.name });
    }
    return out;
  },

  async listHashtags() {
    let res = await fetchJson(ACTIONS.listHashtags);
    let arr = res && typeof res === "object" && Array.isArray(res.data) ? res.data : [];
    let out = [];
    for (let i = 0; i < arr.length; i++) {
      let x = arr[i];
      out.push({ id: x.hashtag_id !== undefined ? x.hashtag_id : x.id, name: x.hashtag_name !== undefined ? x.hashtag_name : x.name });
    }
    return out;
  },

  async listMyPosts() {
    let res = await fetchJson(ACTIONS.listPostByUser);
    return res && typeof res === "object" && Array.isArray(res.data) ? res.data : [];
  },

  async listUserPosts(user_id) {
    let res = await fetchJson(ACTIONS.listUserPosts + "&user_id=" + encodeURIComponent(user_id));
    return res && typeof res === "object" && Array.isArray(res.data) ? res.data : [];
  },

  getByAlbum(album_id) {
    return fetchJson(ACTIONS.postsByAlbum + "&album_id=" + encodeURIComponent(album_id));
  },

  async countAllPosts() {
    let res = await fetchJson(ACTIONS.countAllPosts);
    return pickCount(res);
  },

  async countPostsByUser(user_id) {
    let url = user_id ? (ACTIONS.countPostsByUser + "&user_id=" + encodeURIComponent(user_id)) : ACTIONS.countPostsByUser;
    let res = await fetchJson(url);
    return pickCount(res);
  },

  async countPostsByAlbum(album_id) {
    if (!album_id) throw new Error("album_id is required");
    let res = await fetchJson(ACTIONS.countPostsByAlbum + "&album_id=" + encodeURIComponent(album_id));
    return pickCount(res);
  },

  async download(postId) {
    if (!postId) throw new Error("postId is required");
    const url = buildActionUrl("download", { post_id: postId });

    const res = await fetch(url, { credentials: "include" });
    if (!res.ok) {
      const msg = await res.text();
      throw new Error("Download failed: " + res.status + " " + msg);
    }

    let filename = "downloaded_file";
    const disposition = res.headers.get("Content-Disposition");
    if (disposition && disposition.indexOf("filename=") !== -1) {
      filename = decodeURIComponent(disposition.split("filename=")[1].replace(/["']/g, ""));
    }

    const blob = await res.blob();
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    URL.revokeObjectURL(link.href);
    link.remove();
  }
};

export default postService;
