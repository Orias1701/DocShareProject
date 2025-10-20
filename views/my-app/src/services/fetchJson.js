// src/services/fetchJson.js
const API_URL  = import.meta.env.VITE_API_URL  || window.location.origin;         
const API_ENTRY= import.meta.env.VITE_API_BASE || "/DocShareProject/public/index.php";
const API_BASE = new URL(API_ENTRY, API_URL).toString(); 
console.log("🔗 API_BASE =", API_BASE); // Debug khi deploy

export function buildActionUrl(action, extraParams) {
  const url = new URL(API_BASE);
  url.searchParams.set("action", action);
  if (extraParams && typeof extraParams === "object") {
    Object.entries(extraParams).forEach(([k,v]) => {
      if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
    });
  }
  return url.toString();
}

function ensureJsonBodyAndHeaders(options = {}) {
  const o = { ...options };
  const hasBody = o.body !== undefined && o.body !== null;
  if (hasBody && !(o.body instanceof FormData) && typeof o.body !== "string") {
    o.body = JSON.stringify(o.body);
    o.headers = { "Content-Type": "application/json", ...(o.headers || {}) };
  }
  if (hasBody && typeof o.body === "string" && !(o.body instanceof FormData)) {
    o.headers = { "Content-Type": o.headers?.["Content-Type"] || "application/json", ...(o.headers || {}) };
  }
  return o;
}

async function safeParseJson(res) {
  if (res.status === 204) return null;
  const ct = res.headers.get("content-type")?.toLowerCase() || "";
  const raw = await res.text();
  const txt = raw.replace(/^\uFEFF/, "").trim();
  if (ct.includes("application/json")) return txt ? JSON.parse(txt) : {};
  const fc = txt.indexOf("{"), fb = txt.indexOf("[");
  let s=-1,e=-1;
  if (fc!==-1 && (fb===-1 || fc<fb)) { s=fc; e=txt.lastIndexOf("}"); }
  else if (fb!==-1) { s=fb; e=txt.lastIndexOf("]"); }
  if (s!==-1 && e!==-1 && e>s) {
    const slice = txt.slice(s,e+1);
    try { return JSON.parse(slice); } catch {}
  }
  const sn = txt.slice(0,200).replace(/\s+/g," ");
  throw new Error(`Không parse được JSON từ API. Content-Type: ${ct||"N/A"}. Snippet: "${sn}..."`);
}

/**
 * fetchJson(action, { method, body, timeoutMs, extraParams, ... })
 * Luôn append action ở query; nếu POST mà host chặn query, ta **đính kèm action vào body** dự phòng.
 */
export default async function fetchJson(action, options = {}) {
  const { timeoutMs, extraParams, ...rest } = options;
  const url = buildActionUrl(action, extraParams);

  const init = ensureJsonBodyAndHeaders({
    method: rest.method || "GET",
    credentials: rest.credentials ?? "include",
    headers: { Accept: "application/json, text/plain, */*", ...(rest.headers || {}) },
    body: rest.body,
    signal: rest.signal,
    cache: rest.cache,
    mode: rest.mode,
  });

  // Dự phòng: nếu host chặn query, thêm action vào body
  if ((init.method || "GET").toUpperCase() === "POST" && action) {
    if (init.body instanceof FormData) {
      if (!init.body.has("action")) init.body.append("action", action);
    } else if (typeof init.body === "string" && (init.headers?.["Content-Type"] || "").includes("application/json")) {
      try {
        const obj = JSON.parse(init.body || "{}");
        if (!obj.action) obj.action = action;
        init.body = JSON.stringify(obj);
      } catch {}
    }
  }

  // Timeout
  let controller, timer;
  if (timeoutMs && Number.isFinite(timeoutMs)) {
    controller = new AbortController();
    init.signal = controller.signal;
    timer = setTimeout(() => controller.abort(new Error("Request timeout")), timeoutMs);
  }

  let res;
  try { res = await fetch(url, init); }
  catch (e) {
    if (timer) clearTimeout(timer);
    throw e.name === "AbortError" ? new Error("Kết nối hết thời gian chờ.") : e;
  }
  if (timer) clearTimeout(timer);

  if (!res.ok) {
    let details = "";
    try {
      const raw = await res.text();
      const sn = raw.replace(/^\uFEFF/, "").trim().slice(0,200).replace(/\s+/g," ");
      details = sn ? `: ${sn}` : "";
    } catch {}
    throw new Error(`HTTP ${res.status}${details ? " - " + details : ""}`);
  }

  return safeParseJson(res);
}
