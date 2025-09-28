// src/services/searchService.js
import fetchJson from "./fetchJson";

const ACTION = "search";

/**
 * Trả về dạng chuẩn:
 * { posts: [], albums: [], categories: [], hashtags: [] }
 * Back-end của bạn đang trả đúng bốn key như thế, nhưng mình vẫn “fallback”
 * để không vỡ nếu payload khác format.
 */
export async function searchCombined(query) {
  if (!query || !query.trim()) {
    return { posts: [], albums: [], categories: [], hashtags: [] };
  }
  const payload = await fetchJson(`${ACTION}&q=${encodeURIComponent(query)}`);

  // Chuẩn hoá an toàn
  const obj =
    payload && typeof payload === "object" ? payload : { data: payload };

  const posts      = Array.isArray(obj.posts)      ? obj.posts      : Array.isArray(obj.data) ? obj.data : [];
  const albums     = Array.isArray(obj.albums)     ? obj.albums     : [];
  const categories = Array.isArray(obj.categories) ? obj.categories : [];
  const hashtags   = Array.isArray(obj.hashtags)   ? obj.hashtags   : [];

  return { posts, albums, categories, hashtags };
}
