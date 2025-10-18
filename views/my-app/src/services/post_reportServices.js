// [Tác dụng file] Báo cáo bài viết: toggle, liệt kê, tất cả, và đếm số report
import fetchJson from "./fetchJson";

// [Tác dụng] Action API cho report
const ACTIONS = {
  toggle: "toggle_report",
  listByPost: "list_reports",
  listAll: "list_all_reports",
  countReports: "count_reports"
};

// [Tác dụng] Tạo body FormData và gọi POST
function postForm(action, payload) {
  let fd = new FormData();
  let obj = payload || {};
  for (let k in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, k)) {
      let v = obj[k];
      if (v !== undefined && v !== null) fd.append(k, v);
    }
  }
  return fetchJson(action, { method: "POST", body: fd });
}

// [Tác dụng] Chuẩn hoá phản hồi về { status, data|error } để dễ dùng
async function normalizeApiResponse(promise) {
  let res = await promise;
  if (res && typeof res === "object" && "ok" in res) {
    return res.ok ? { status: "success", data: ("data" in res ? res.data : res) }
                  : { status: "error", error: res.error };
  }
  return { status: "success", data: res };
}

export const post_reportService = {
  // [Tác dụng] Bật/tắt report cho post với lý do (optional)
  toggle: function (postId, reason) {
    if (!postId) throw new Error("postId is required");
    return normalizeApiResponse(
      postForm(ACTIONS.toggle, { post_id: postId, reason: reason || "" })
    );
  },

  // [Tác dụng] Liệt kê các report của một post
  listByPost: function (postId) {
    if (!postId) throw new Error("postId is required");
    return normalizeApiResponse(
      fetchJson(ACTIONS.listByPost + "&post_id=" + encodeURIComponent(postId))
    );
  },

  // [Tác dụng] Lấy tất cả report (tuỳ quyền)
  listAll: function () {
    return normalizeApiResponse(fetchJson(ACTIONS.listAll));
  },

  // [Tác dụng] Đếm số report của một post
  countReports: function (postId) {
    if (!postId) throw new Error("postId is required");
    return normalizeApiResponse(
      fetchJson(ACTIONS.countReports + "&post_id=" + encodeURIComponent(postId))
    );
  }
};

export default post_reportService;
