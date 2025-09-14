// src/api/postApi.js
import fetchJson from "./fetchJson";

export const postApi = {
  // feeds
  latest: () => fetchJson("latest_posts"),
  popular: () => fetchJson("popular_posts"),

  // detail
  detail: (postId) => fetchJson(`post_detail_api&post_id=${postId}`),

  // list all
  listAll: () => fetchJson("list_all_posts"),

  // create/update/delete
  create: (formData) => fetchJson("create_post", { method: "POST", body: formData }),
  update: (formData) => fetchJson("update_post", { method: "POST", body: formData }),
  delete: (id) => fetchJson(`delete_post&id=${id}`, { method: "DELETE" }),

  // by category / hashtags
  listByCategory: (categoryId) => fetchJson(`list_posts_by_category&category_id=${categoryId}`),
  listByHashtags: (idsCsv) => fetchJson(`list_posts_by_hashtag&hashtag_ids=${encodeURIComponent(idsCsv)}`),

  // 🔽 NEW: lấy dữ liệu động cho select
  listCategories: () => fetchJson("list_categories"),      // GET → [{id, name}]
  listAlbums: () => fetchJson("list_albums"),              // GET → [{id, name}]
  listHashtags: () => fetchJson("list_hashtags"),          // GET → [{id, name}] (tùy backend)
};
