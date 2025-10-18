// [Tác dụng file] Quản lý bookmark (thêm/xoá/lấy danh sách)
import fetchJson from "./fetchJson";

// [Tác dụng] Action API cho bookmark
const ACTIONS = {
  add: "create_bookmark",
  remove: "delete_bookmark",
  list: "list_bookmarks"
};

// [Tác dụng] Kiểm tra response có status=success hay không
function isOk(res) {
  return !!res && String(res.status).toLowerCase() === "success";
}

// [Tác dụng] Chuyển object -> FormData để gửi POST
function toFormData(obj) {
  let fd = new FormData();
  if (obj) {
    for (let k in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, k)) {
        let v = obj[k];
        if (v !== undefined && v !== null) fd.append(k, v);
      }
    }
  }
  return fd;
}

export const bookmarkService = {
  // [Tác dụng] Thêm bookmark cho post_id
  add: async function (params) {
    let body = toFormData({ post_id: params && params.post_id });
    let res = await fetchJson(ACTIONS.add, { method: "POST", body: body });
    return { ok: isOk(res), raw: res };
  },

  // [Tác dụng] Xoá bookmark theo post_id
  remove: async function (params) {
    let body = toFormData({ post_id: params && params.post_id });
    let res = await fetchJson(ACTIONS.remove, { method: "POST", body: body });
    return { ok: isOk(res), raw: res };
  },

  // [Tác dụng] Lấy danh sách bookmark (trả về mảng thuần)
  list: async function () {
    let res = await fetchJson(ACTIONS.list);
    let arr;
    if (Array.isArray(res)) arr = res;
    else if (res && typeof res === "object" && Array.isArray(res.data)) arr = res.data;
    else arr = [];
    return arr;
  }
};

export default bookmarkService;
