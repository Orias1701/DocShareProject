// src/services/fetchJson.js
const API_BASE = "http://localhost:3000/public/index.php";

export default async function fetchJson(actionOrUrl, options = {}) {
  // Cho phép truyền vào full URL (http...) hoặc chỉ action
  const isFullUrl = /^https?:\/\//i.test(actionOrUrl);
  const url = isFullUrl ? actionOrUrl : `${API_BASE}?action=${actionOrUrl}`;

  const res = await fetch(url, {
    credentials: "include",
    headers: {
      Accept: "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  const ct = res.headers.get("Content-Type") || "";
  const raw = await res.text(); // đọc body duy nhất 1 lần

  if (!res.ok) {
    throw new Error(raw || `HTTP ${res.status}`);
  }

  if (ct.includes("application/json")) {
    try {
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      console.error("[fetchJson] JSON parse error:", e, "body(start)=", raw.slice(0, 200));
      throw new Error("Lỗi parse JSON");
    }
  }

  // Thử “salvage” nếu server có in kèm HTML/warning
  const firstCurly = raw.indexOf("{");
  const firstBracket = raw.indexOf("[");
  let start = -1, end = -1;
  if (firstCurly !== -1 && (firstBracket === -1 || firstCurly < firstBracket)) {
    start = firstCurly; end = raw.lastIndexOf("}");
  } else if (firstBracket !== -1) {
    start = firstBracket; end = raw.lastIndexOf("]");
  }
  if (start !== -1 && end !== -1 && end > start) {
    try {
      const jsonSlice = raw.slice(start, end + 1);
      console.warn("[fetchJson] Salvaged JSON from noisy response:", raw.slice(0, 160));
      return JSON.parse(jsonSlice);
    } catch {}
  }

  console.error("[fetchJson] Expected JSON, got:", ct, " body(start)=", raw.slice(0, 200));
  throw new Error("API không trả JSON");
}
