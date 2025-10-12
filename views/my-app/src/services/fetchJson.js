// ✅ src/services/fetchJson.js
// Dùng env, fallback cùng origin tới /api/public/index.php
const API_BASE =
  import.meta.env.VITE_API_URL ||
  `${window.location.origin}/api/public/index.php`;

export default async function fetchJson(action, options = {}) {
  const url = `${API_BASE}?action=${action}`;
  const res = await fetch(url, {
    credentials: "include",
    headers: {
      Accept: "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  const contentType = res.headers.get("content-type") || "";
  const text = await res.text();

  if (contentType.includes("application/json")) {
    try {
      return text ? JSON.parse(text) : {};
    } catch (e) {
      console.error("[fetchJson] JSON parse error:", e, "body(start)=", text.slice(0, 200));
      throw new Error("Phản hồi JSON không hợp lệ từ API.");
    }
  }

  // Cứu hộ nếu backend vô tình lẫn HTML
  const firstCurly = text.indexOf("{");
  const firstBracket = text.indexOf("[");
  let start = -1, end = -1;
  if (firstCurly !== -1 && (firstBracket === -1 || firstCurly < firstBracket)) {
    start = firstCurly; end = text.lastIndexOf("}");
  } else if (firstBracket !== -1) {
    start = firstBracket; end = text.lastIndexOf("]");
  }
  if (start !== -1 && end !== -1 && end > start) {
    try { return JSON.parse(text.slice(start, end + 1)); } catch {}
  }

  console.error(`[fetchJson] Cannot parse JSON. status=${res.status}, action=${action}, body(start)=`, text.slice(0, 200));
  throw new Error("Không parse được JSON từ API");
}
