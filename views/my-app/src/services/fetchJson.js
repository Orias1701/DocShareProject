// src/services/fetchJson.js
const API_BASE = "http://localhost:3000/public/index.php";

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

  // Nếu header đúng JSON, thử parse luôn
  if (contentType.includes("application/json")) {
    try {
      return text ? JSON.parse(text) : {};
    } catch (e) {
      // rơi xuống salvage
    }
  }

  // Salvage mode: cố gắng trích đoạn JSON từ text lẫn warning
  // 1) kiếm khối JSON bắt đầu bằng { ... } hoặc mảng [ ... ]
  const firstCurly = text.indexOf("{");
  const firstBracket = text.indexOf("[");
  let start = -1;
  let end = -1;

  if (firstCurly !== -1 && (firstBracket === -1 || firstCurly < firstBracket)) {
    // tìm cặp { ... }
    start = firstCurly;
    end = text.lastIndexOf("}");
  } else if (firstBracket !== -1) {
    // tìm cặp [ ... ]
    start = firstBracket;
    end = text.lastIndexOf("]");
  }

  if (start !== -1 && end !== -1 && end > start) {
    const jsonSlice = text.slice(start, end + 1);
    try {
      const data = JSON.parse(jsonSlice);
      // vẫn log cảnh báo để còn xử lý BE
      console.warn("[fetchJson] Salvaged JSON from noisy response:", text.slice(0, 160));
      return data;
    } catch (e) {
      // ignore, throw below
    }
  }

  console.error(`[fetchJson] Cannot parse JSON. status=${res.status}, action=${action}, body(start)=`, text.slice(0, 200));
  throw new Error("Không parse được JSON từ API");
}
