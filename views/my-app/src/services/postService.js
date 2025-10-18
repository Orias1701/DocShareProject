// [Tác dụng file] Cung cấp các hàm thao tác với bài viết (posts), hashtag liên quan, master data và đếm số bài
import fetchJson from "./fetchJson";

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
  // [Tác dụng] Lấy bài mới nhất
  getLatest: function () {
    return fetchJson(ACTIONS.getLatest);
  },

  // [Tác dụng] Lấy bài phổ biến
  getPopular: function () {
    return fetchJson(ACTIONS.getPopular);
  },

  // [Tác dụng] Lấy chi tiết gọn cho một bài theo id
  getByIdCompact: function (post_id) {
    return fetchJson(ACTIONS.postDetail + "&post_id=" + encodeURIComponent(post_id));
  },

  // [Tác dụng] Lấy bài theo category_id
  getByCategory: function (category_id) {
    return fetchJson(ACTIONS.postsByCategory + "&category_id=" + encodeURIComponent(category_id));
  },

  // [Tác dụng] Lấy chi tiết đầy đủ theo post_id
  showDetail: function (post_id) {
    return fetchJson(ACTIONS.postDetail + "&post_id=" + encodeURIComponent(post_id));
  },

  // [Tác dụng] Lấy tất cả bài
  listAll: function () {
    return fetchJson(ACTIONS.listAll);
  },

  // [Tác dụng] Lấy feed từ những người mình theo dõi (trả về mảng)
  listPostsByFollowing: async function () {
    let res = await fetchJson(ACTIONS.getPostsFromFollowedUsers);
    return res && typeof res === "object" && Array.isArray(res.data) ? res.data : [];
  },

  // [Tác dụng] Tạo bài viết mới (hỗ trợ banner, content_file)
  create: function (params) {
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

  // [Tác dụng] Cập nhật bài viết (cả meta + nội dung + file)
  update: function (params) {
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

  // [Tác dụng] Xoá bài (GET theo id)
  remove: function (id) {
    return fetchJson(ACTIONS.delete + "&post_id=" + encodeURIComponent(id));
  },

  // [Tác dụng] Xoá bài (POST theo id)
  removeViaPost: function (id) {
    let body = toFormData({ post_id: id });
    return fetchJson(ACTIONS.delete, { method: "POST", body: body });
  },

  // [Tác dụng] Lấy hashtag của một bài
  listHashtagsByPost: function (post_id) {
    return fetchJson(ACTIONS.listPostHashtags + "&post_id=" + encodeURIComponent(post_id));
  },

  // [Tác dụng] Lấy danh sách bài theo hashtag (truyền hashtag_id hoặc hashtag_name)
  getPostsByHashtag: async function (params) {
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

  // [Tác dụng] Thêm hashtag vào bài
  addHashtagToPost: function (params) {
    let body = toFormData({ post_id: params && params.post_id, hashtag_id: params && params.hashtag_id });
    return fetchJson(ACTIONS.createPostHashtag, { method: "POST", body: body });
  },

  // [Tác dụng] Đổi hashtag của bài (old → new)
  updatePostHashtag: function (params) {
    let body = toFormData({
      post_id: params && params.post_id,
      old_hashtag_id: params && params.old_hashtag_id,
      new_hashtag_id: params && params.new_hashtag_id
    });
    return fetchJson(ACTIONS.updatePostHashtag, { method: "POST", body: body });
  },

  // [Tác dụng] Xoá hashtag khỏi bài
  deletePostHashtag: function (params) {
    let body = toFormData({ post_id: params && params.post_id, hashtag_id: params && params.hashtag_id });
    return fetchJson(ACTIONS.deletePostHashtag, { method: "POST", body: body });
  },

  // [Tác dụng] Lấy danh mục (chuẩn hoá {id, name})
  listCategories: async function () {
    let res = await fetchJson(ACTIONS.listCategories);
    let arr = res && typeof res === "object" && Array.isArray(res.data) ? res.data : [];
    let out = [];
    for (let i = 0; i < arr.length; i++) {
      let x = arr[i];
      out.push({ id: x.category_id !== undefined ? x.category_id : x.id, name: x.category_name !== undefined ? x.category_name : x.name });
    }
    return out;
  },

  // [Tác dụng] Lấy album (chuẩn hoá {id, name})
  listAlbums: async function () {
    let res = await fetchJson(ACTIONS.listAlbums);
    let arr = res && typeof res === "object" && Array.isArray(res.data) ? res.data : [];
    let out = [];
    for (let i = 0; i < arr.length; i++) {
      let x = arr[i];
      out.push({ id: x.album_id !== undefined ? x.album_id : x.id, name: x.album_name !== undefined ? x.album_name : x.name });
    }
    return out;
  },

  // [Tác dụng] Lấy hashtag (chuẩn hoá {id, name})
  listHashtags: async function () {
    let res = await fetchJson(ACTIONS.listHashtags);
    let arr = res && typeof res === "object" && Array.isArray(res.data) ? res.data : [];
    let out = [];
    for (let i = 0; i < arr.length; i++) {
      let x = arr[i];
      out.push({ id: x.hashtag_id !== undefined ? x.hashtag_id : x.id, name: x.hashtag_name !== undefined ? x.hashtag_name : x.name });
    }
    return out;
  },

  // [Tác dụng] Lấy bài của tôi (theo session)
  listMyPosts: async function () {
    let res = await fetchJson(ACTIONS.listPostByUser);
    return res && typeof res === "object" && Array.isArray(res.data) ? res.data : [];
  },

  // [Tác dụng] Lấy bài theo user_id chỉ định
  listUserPosts: async function (user_id) {
    let res = await fetchJson(ACTIONS.listUserPosts + "&user_id=" + encodeURIComponent(user_id));
    return res && typeof res === "object" && Array.isArray(res.data) ? res.data : [];
  },

  // [Tác dụng] Lấy bài theo album_id
  getByAlbum: function (album_id) {
    return fetchJson(ACTIONS.postsByAlbum + "&album_id=" + encodeURIComponent(album_id));
  },

  // [Tác dụng] Đếm tổng số bài
  countAllPosts: async function () {
    let res = await fetchJson(ACTIONS.countAllPosts);
    return pickCount(res);
  },

  // [Tác dụng] Đếm số bài theo user (nếu không truyền user_id → BE dùng session)
  countPostsByUser: async function (user_id) {
    let url = user_id ? (ACTIONS.countPostsByUser + "&user_id=" + encodeURIComponent(user_id)) : ACTIONS.countPostsByUser;
    let res = await fetchJson(url);
    return pickCount(res);
  },

  // [Tác dụng] Đếm số bài trong một album
  countPostsByAlbum: async function (album_id) {
    if (!album_id) throw new Error("album_id is required");
    let res = await fetchJson(ACTIONS.countPostsByAlbum + "&album_id=" + encodeURIComponent(album_id));
    return pickCount(res);
  },

  // [Tác dụng] Tải file đính kèm của bài (trình duyệt sẽ tải xuống)
  download: async function (postId) {
    if (!postId) throw new Error("postId is required");
    let API_BASE = "http://localhost:3000/public/index.php";
    let url = API_BASE + "?action=download&post_id=" + encodeURIComponent(postId);

    let res = await fetch(url, { credentials: "include" });
    if (!res.ok) {
      let msg = await res.text();
      throw new Error("Download failed: " + res.status + " " + msg);
    }

    let filename = "downloaded_file";
    let disposition = res.headers.get("Content-Disposition");
    if (disposition && disposition.indexOf("filename=") !== -1) {
      filename = decodeURIComponent(disposition.split("filename=")[1].replace(/["']/g, ""));
    }

    let blob = await res.blob();
    let link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    URL.revokeObjectURL(link.href);
    link.remove();
  }
};

export default postService;
