// [Mục đích] Gọi API theo action, hỗ trợ JSON / FormData, timeout, và "cứu hộ" JSON khi body lẫn HTML.

// Ưu tiên dùng VITE_API_BASE. Nếu không có, fallback từ VITE_API_URL + VITE_API_ENTRY
const FALLBACK_URL   = import.meta.env.VITE_API_URL   || window.location.origin;      // ví dụ: https://baotest.wuaze.com/DocShareProject
const FALLBACK_ENTRY = import.meta.env.VITE_API_ENTRY || "/public/index.php";         // ví dụ: /DocShareProject/public/index.php

const API_BASE = import.meta.env.VITE_API_BASE
  ? String(import.meta.env.VITE_API_BASE)
  : new URL(FALLBACK_ENTRY, FALLBACK_URL).toString(); // -> https://.../public/index.php

// (tuỳ chọn) log 1 lần để xác nhận env khi chạy thực tế
if (import.meta.env.DEV) {
  // eslint-disable-next-line no-console
  console.log("[fetchJson] API_BASE =", API_BASE);
}

export function buildActionUrl(action, extraParams) {
  const url = new URL(API_BASE);
  // Cho phép action có kèm query (vd: "get_posts_by_album&album_id=123")
  // -> tách phần sau & và append vào URL
  const idx = action.indexOf("&");
  if (idx !== -1) {
    const name = action.slice(0, idx);
    const rest = action.slice(idx + 1);
    url.searchParams.set("action", name);
    new URLSearchParams(rest).forEach((v, k) => url.searchParams.set(k, String(v)));
  } else {
    url.searchParams.set("action", action);
  }

  if (extraParams && typeof extraParams === "object") {
    Object.entries(extraParams).forEach(([k, v]) => {
      if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
    });
  }
  return url.toString();
}

function ensureJsonBodyAndHeaders(options = {}) {
  const opts = { ...options };
  const hasBody = opts.body !== undefined && opts.body !== null;

  // Nếu body là object thường: stringify + set header JSON
  if (hasBody && !(opts.body instanceof FormData) && typeof opts.body !== "string") {
    opts.body = JSON.stringify(opts.body);
    opts.headers = {
      "Content-Type": "application/json",
      ...(opts.headers || {}),
    };
  }
  // Nếu body là string mà caller chưa set Content-Type, mặc định coi là JSON
  if (hasBody && typeof opts.body === "string" && !(opts.body instanceof FormData)) {
    opts.headers = {
      "Content-Type": opts.headers?.["Content-Type"] || "application/json",
      ...(opts.headers || {}),
    };
  }
  // Nếu là FormData thì KHÔNG tự set Content-Type
  return opts;
}

async function safeParseJson(res) {
  if (res.status === 204) return null;

  const ctype =
    res.headers.get("Content-Type") ||
    res.headers.get("content-type") ||
    "";

  const raw = await res.text();
  const txt = raw.replace(/^\uFEFF/, "").trim(); // strip BOM + trim

  // Server báo JSON -> parse trực tiếp
  if (ctype.includes("application/json")) {
    return txt ? JSON.parse(txt) : {};
  }

  // Cứu hộ: response lẫn HTML — cố gắng cắt phần JSON ({} hoặc [])
  const firstCurly = txt.indexOf("{");
  const firstBracket = txt.indexOf("[");
  let start = -1, end = -1;

  if (firstCurly !== -1 && (firstBracket === -1 || firstCurly < firstBracket)) {
    start = firstCurly;
    end = txt.lastIndexOf("}");
  } else if (firstBracket !== -1) {
    start = firstBracket;
    end = txt.lastIndexOf("]");
  }

  if (start !== -1 && end !== -1 && end > start) {
    const jsonSlice = txt.slice(start, end + 1);
    try {
      return JSON.parse(jsonSlice);
    } catch {}
  }

  // Không parse nổi -> ném lỗi có snippet
  const snippet = txt.slice(0, 200).replace(/\s+/g, " ");
  throw new Error(
    `Không parse được JSON từ API. Content-Type: ${ctype || "N/A"}. Snippet: "${snippet}..."`
  );
}

/**
 * fetchJson:
 * - action: string, ví dụ "api_register" hoặc "get_posts_by_album&album_id=ALBUM123"
 * - options: { method, headers, body, credentials, signal, cache, timeoutMs, extraParams, mode }
 *   - extraParams: object -> append vào query (?action=...&k=v)
 */
export default async function fetchJson(action, options = {}) {
  const { timeoutMs, extraParams, ...rest } = options;
  const url = buildActionUrl(action, extraParams);

  // Chuẩn hóa body/headers (JSON vs FormData)
  const fetchOpts = ensureJsonBodyAndHeaders({
    method: rest.method || "GET",
    credentials: rest.credentials ?? "include",
    headers: { Accept: "application/json, text/plain, */*", ...(rest.headers || {}) },
    body: rest.body,
    signal: rest.signal,
    cache: rest.cache,
    mode: rest.mode || "cors",
  });

  // Timeout qua AbortController
  let controller;
  let timer;
  if (timeoutMs && Number.isFinite(timeoutMs)) {
    controller = new AbortController();
    fetchOpts.signal = controller.signal;
    timer = setTimeout(() => controller.abort(new Error("Request timeout")), timeoutMs);
  }

  let res;
  try {
    res = await fetch(url, fetchOpts);
  } catch (e) {
    if (timer) clearTimeout(timer);
    throw e.name === "AbortError" ? new Error("Kết nối hết thời gian chờ.") : e;
  }
  if (timer) clearTimeout(timer);

  if (!res.ok) {
    let details = "";
    try {
      const raw = await res.text();
      const snippet = raw.replace(/^\uFEFF/, "").trim().slice(0, 200).replace(/\s+/g, " ");
      details = snippet ? `; body="${snippet}..."` : "";
    } catch {}
    throw new Error(`HTTP ${res.status}${details}`);
  }

  return safeParseJson(res);
}
