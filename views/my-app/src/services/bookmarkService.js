// src/services/bookmarkService.js
import fetchJson from "./fetchJson";

const ACTIONS = {
  add: "create_bookmark",
  remove: "delete_bookmark",
  list: "list_bookmarks",
};

// BE trả {"status":"success", ...} => ok khi status=success
function isOk(res) {
  return !!res && String(res.status).toLowerCase() === "success";
}

function toFormData(obj = {}) {
  const fd = new FormData();
  Object.entries(obj).forEach(([k, v]) => {
    if (v !== undefined && v !== null) fd.append(k, v);
  });
  return fd;
}

export const bookmarkService = {
  /** Thêm bookmark */
  async add({ post_id }) {
    const body = toFormData({ post_id });
    const res = await fetchJson(ACTIONS.add, { method: "POST", body });
    return { ok: isOk(res), raw: res };
  },

  /** Xoá bookmark */
  async remove({ post_id }) {
    const body = toFormData({ post_id });
    const res = await fetchJson(ACTIONS.remove, { method: "POST", body });
    return { ok: isOk(res), raw: res };
  },

  /** Lấy danh sách bookmark -> trả về mảng thuần để dễ dùng */
  async list() {
    const res = await fetchJson(ACTIONS.list);
    const arr = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : []);
    return arr;
  },
};

export default bookmarkService;
