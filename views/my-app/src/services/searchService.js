// [Tác dụng file] Cung cấp hàm tìm kiếm tổng hợp trả về {posts, albums, categories, hashtags}
import fetchJson from "./fetchJson";

// [Tác dụng] Action tìm kiếm chung
const ACTION = "search";

// [Tác dụng] Tìm kiếm với query; luôn trả về đủ 4 mảng để UI dễ dùng
export async function searchCombined(query) {
  if (!query || !query.trim || !query.trim()) {
    return { posts: [], albums: [], categories: [], hashtags: [] };
  }

  let payload = await fetchJson(ACTION + "&q=" + encodeURIComponent(query));

  // Chuẩn hoá an toàn
  let obj = (payload && typeof payload === "object") ? payload : { data: payload };

  let posts = [];
  let albums = [];
  let categories = [];
  let hashtags = [];

  if (obj.posts && Array.isArray(obj.posts)) posts = obj.posts;
  else if (obj.data && Array.isArray(obj.data)) posts = obj.data;

  if (obj.albums && Array.isArray(obj.albums)) albums = obj.albums;
  if (obj.categories && Array.isArray(obj.categories)) categories = obj.categories;
  if (obj.hashtags && Array.isArray(obj.hashtags)) hashtags = obj.hashtags;

  return { posts: posts, albums: albums, categories: categories, hashtags: hashtags };
}
