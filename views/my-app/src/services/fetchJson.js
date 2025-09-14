// src/api/fetchJson.js
const API_BASE = "http://localhost:3000/public/index.php";

export default async function fetchJson(action, options = {}) {
  const url = `${API_BASE}?action=${action}`;
  const res = await fetch(url, {
    credentials: "include", // để gửi cookie PHP session
    headers: {
      Accept: "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch (err) {
    throw new Error("Không parse được JSON từ API");
  }

  if (!res.ok || data.status === "error") {
    throw new Error(data?.message || "Lỗi API");
  }

  // chỉ trả về phần data cho tiện
  return data.data ?? data;
}
