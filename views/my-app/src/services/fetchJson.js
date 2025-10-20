// src/services/fetchJson.js

export const API_ORIGIN = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');
export const API_ENTRY  = (import.meta.env.VITE_API_ENTRY || '/public/index.php');
const DEFAULT_TIMEOUT_MS = 15000;

// Lấy origin (ưu tiên ENV, fallback window)
function getBaseOrigin() {
  if (API_ORIGIN) return API_ORIGIN;
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin.replace(/\/+$/, '');
  }
  return '';
}

// Biến entry thành URL tuyệt đối
function toAbsoluteUrlLike(origin, entry) {
  if (/^https?:\/\//i.test(entry)) return entry; // absolute rồi
  const base = origin || (typeof window !== 'undefined' ? window.location.origin : '');
  return new URL(entry.replace(/^\/+/, '/'), base || 'http://localhost').toString();
}

// Build URL: ?action=...&query=...
export function buildActionUrl(action, extraQuery = {}) {
  const base = getBaseOrigin();
  const entryAbs = toAbsoluteUrlLike(base, API_ENTRY);

  const url = new URL(entryAbs);
  url.searchParams.set('action', action);

  for (const [k, v] of Object.entries(extraQuery || {})) {
    if (v === undefined || v === null) continue;
    if (Array.isArray(v)) v.forEach(item => url.searchParams.append(k, String(item)));
    else url.searchParams.set(k, String(v));
  }
  return url.toString();
}

// fetch JSON có timeout + "cứu hộ" parse JSON lẫn HTML
async function fetchJson(action, options = {}) {
  const {
    query,
    timeoutMs,
    method = 'GET',
    headers: headersIn = {},
    body: bodyIn,
    credentials = 'include',
    ...rest
  } = options;

  const url = buildActionUrl(action, query);
  const headers = { Accept: 'application/json', ...headersIn };

  // Tự stringify body nếu là object thường
  let body = bodyIn;
  if (body && typeof body === 'object' && !(body instanceof FormData) && !(body instanceof URLSearchParams)) {
    if (!headers['Content-Type'] && !headers['content-type']) {
      headers['Content-Type'] = 'application/json';
    }
    body = JSON.stringify(body);
  }

  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs ?? DEFAULT_TIMEOUT_MS);

  let res, text;
  try {
    res = await fetch(url, {
      method,
      credentials,
      headers,
      body,
      signal: controller.signal,
      ...rest,
    });
    text = await res.text();
  } catch (err) {
    clearTimeout(id);
    if (err?.name === 'AbortError') throw new Error('Yêu cầu quá thời gian (timeout).');
    throw err;
  } finally {
    clearTimeout(id);
  }

  const ct = res.headers.get('content-type') || '';
  if (!res.ok) {
    const snippet = (text || '').slice(0, 300);
    throw new Error(`HTTP ${res.status}: ${snippet}`);
  }

  // Trường hợp chuẩn
  if (ct.includes('application/json')) {
    try { return text ? JSON.parse(text) : {}; }
    catch { throw new Error('Phản hồi JSON không hợp lệ từ API.'); }
  }

  // Cứu hộ khi phản hồi lẫn HTML/warning
  const firstCurly = text.indexOf('{');
  const firstBracket = text.indexOf('[');
  const starts = [firstCurly, firstBracket].filter(i => i >= 0);
  const start = starts.length ? Math.min(...starts) : -1;
  const end = Math.max(text.lastIndexOf('}'), text.lastIndexOf(']'));
  if (start >= 0 && end > start) {
    const slice = text.slice(start, end + 1);
    try { return JSON.parse(slice); } catch {}
  }

  throw new Error('Không parse được JSON từ API.');
}

// 👉 Xuất cả named & default
export { fetchJson };
export default fetchJson;
