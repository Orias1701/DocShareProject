// src/services/fetchJson.js
const API_BASE = "http://localhost:3000/public/index.php";

export default async function fetchJson(action, options = {}) {
  const url = `${API_BASE}?action=${action}`;
  const res = await fetch(url, {
    credentials: "include", // Đảm bảo rằng credentials được gửi đi
    headers: {
      Accept: "application/json", // Chỉ chấp nhận JSON từ server
      ...(options.headers || {}),
    },
    ...options, // Thêm các options khác từ bên ngoài nếu có
  });

  const contentType = res.headers.get("content-type") || "";
  const text = await res.text(); // Đọc toàn bộ nội dung response

  let data = null;
  if (contentType.includes("application/json")) {
    try {
      data = text ? JSON.parse(text) : {}; // Parse nếu là JSON
    } catch (e) {
      console.error(`[fetchJson] JSON parse error for action="${action}" →`, text);
    }
  } else if (contentType.includes("text/html")) {
    // Nếu là HTML, thường là lỗi 403 hoặc 404, có thể từ PHP errors hoặc trang lỗi
    console.error(`[fetchJson] HTML response for action="${action}" →`, text);
  } else {
    // Nếu không phải JSON hoặc HTML
    console.error(`[fetchJson] Unexpected response for action="${action}" →`, text);
  }

  // Nếu không parse được JSON hoặc dữ liệu trả về không hợp lệ
  if (!data) {
    console.error(`[fetchJson] Cannot parse JSON. status=${res.status}, action=${action}, body(start)=`, text.slice(0, 500));
    throw new Error("Không parse được JSON từ API");
  }

  // Kiểm tra lỗi từ API (status === "error")
  if (!res.ok || data.status === "error") {
    const msg = data?.message || `HTTP ${res.status}`;
    throw new Error(msg);
  }

  return data.data ?? data; // Trả về data nếu có, nếu không trả về toàn bộ
}
