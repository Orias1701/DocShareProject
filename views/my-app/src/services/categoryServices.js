// [Tác dụng file] CRUD category và đếm số post theo category
import fetchJson from "./fetchJson";

// [Tác dụng] Action API cho category
const ACTIONS = {
  list: "list_categories",
  detail: "category_detail",
  create: "create_category",
  update: "update_category",
  delete: "delete_category",
  countPost: "category_post_counts"
};

// [Tác dụng] POST JSON tiện lợi cho create/update/delete
function postJson(action, payload) {
  return fetchJson(action, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload || {})
  });
}

// [Tác dụng] Chuẩn hoá kết quả count để UI dễ dùng: { ok, total, categories }
function normalizeCountsResponse(res) {
  if (res && typeof res === "object") {
    let categories;
    if (Array.isArray(res.categories)) categories = res.categories;
    else if (Array.isArray(res.data)) categories = res.data;
    else if (Array.isArray(res)) categories = res;
    else categories = [];

    return {
      ok: res.ok === undefined ? true : !!res.ok,
      total: typeof res.total === "number" ? res.total : categories.length,
      categories: categories
    };
  }
  if (Array.isArray(res)) {
    return { ok: true, total: res.length, categories: res };
  }
  return { ok: false, total: 0, categories: [] };
}

export const categoryServices = {
  // [Tác dụng] Lấy danh sách category
  list: function () {
    return fetchJson(ACTIONS.list);
  },

  // [Tác dụng] Lấy chi tiết category theo id
  detail: function (id) {
    return fetchJson(ACTIONS.detail + "&id=" + encodeURIComponent(id));
  },

  // [Tác dụng] Tạo category mới với tên
  create: function (params) {
    return postJson(ACTIONS.create, { category_name: params && params.category_name }).then(function (res) {
      if (res && typeof res === "object" && !("status" in res)) {
        return { status: "ok", data: res };
      }
      return res;
    });
  },

  // [Tác dụng] Cập nhật category theo id + tên mới
  update: function (params) {
    let category_id = params && params.category_id;
    let category_name = params && params.category_name;
    return postJson(ACTIONS.update, {
      category_id: category_id,
      id: category_id,
      category_name: category_name
    }).then(function (res) {
      if (res && typeof res === "object" && !("status" in res)) {
        return { status: "ok", data: res };
      }
      return res;
    });
  },

  // [Tác dụng] Xoá category theo id
  delete: function (id) {
    return postJson(ACTIONS.delete, { id: id }).then(function (res) {
      if (res === true || res === 1 || (res && typeof res === "object" && !("status" in res))) {
        return { status: "ok", data: res };
      }
      return res;
    });
  },

  // [Tác dụng] Đếm số post theo category (hoặc tất cả nếu không truyền id)
  countPost: async function (category_id) {
    let url = ACTIONS.countPost;
    if (category_id !== undefined && category_id !== null && category_id !== "") {
      url = url + "&category_id=" + encodeURIComponent(category_id);
    }
    let res = await fetchJson(url);
    return normalizeCountsResponse(res);
  }
};

export default categoryServices;
