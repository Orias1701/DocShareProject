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

  let data = null;
  if (contentType.includes("application/json")) {
    try {
      data = text ? JSON.parse(text) : {};
    } catch (e) {
      // JSON header nhưng body vẫn lỗi
    }
  } else {
    // Không phải JSON — thường là HTML error, PHP warning/notice
    console.error(`[fetchJson] Non-JSON response for action="${action}" →`, text);
  }

  if (!data) {
    // Log thêm status và phần đầu body để dễ lần bug
    console.error(`[fetchJson] Cannot parse JSON. status=${res.status}, action=${action}, body(start)=`, text.slice(0, 500));
    throw new Error("Không parse được JSON từ API");
  }

  if (!res.ok || data.status === "error") {
    const msg = data?.message || `HTTP ${res.status}`;
    throw new Error(msg);
  }

  return data.data ?? data;
}
