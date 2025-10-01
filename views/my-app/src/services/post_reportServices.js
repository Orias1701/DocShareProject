// src/services/post_reportService.js
import fetchJson from "./fetchJson";

const ACTIONS = {
  toggle: "toggle_report",       // POST: post_id, reason
  listByPost: "list_reports",    // GET: post_id -> {ok, data}
  listAll: "list_all_reports",   // GET -> {ok, data}
};

// Gửi POST dạng FormData
function postForm(action, payload = {}) {
  const fd = new FormData();
  Object.entries(payload).forEach(([k, v]) => {
    if (v !== undefined && v !== null) fd.append(k, v);
  });
  return fetchJson(action, { method: "POST", body: fd });
}

// Chuẩn hoá response
async function normalizeApiResponse(promise) {
  const res = await promise;
  if (res && typeof res === "object" && "ok" in res) {
    return res.ok ? { status: "success", data: res.data ?? res } 
                  : { status: "error", error: res.error };
  }
  return { status: "success", data: res };
}

export const post_reportService = {
  toggle(postId, reason = "") {
    if (!postId) throw new Error("postId is required");
    return normalizeApiResponse(
      postForm(ACTIONS.toggle, { post_id: postId, reason })
    );
  },

  listByPost(postId) {
    if (!postId) throw new Error("postId is required");
    return normalizeApiResponse(
      fetchJson(`${ACTIONS.listByPost}&post_id=${encodeURIComponent(postId)}`)
    );
  },

  listAll() {
    return normalizeApiResponse(fetchJson(ACTIONS.listAll));
  },
};

export default post_reportService;
