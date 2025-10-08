// src/services/categoryServices.js
import fetchJson from "./fetchJson";

const ACTIONS = {
  list: "list_categories",
  detail: "category_detail",
  create: "create_category",
  update: "update_category",
  delete: "delete_category",
  countPost: "category_post_counts",
};

function postJson(action, payload) {
  return fetchJson(action, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload ?? {}),
  });
}

// Chuẩn hoá kết quả count từ BE
function normalizeCountsResponse(res) {
  if (res && typeof res === "object") {
    const categories = Array.isArray(res.categories)
      ? res.categories
      : Array.isArray(res.data)
      ? res.data
      : Array.isArray(res)
      ? res
      : [];
    return {
      ok: res.ok === undefined ? true : !!res.ok,
      total: typeof res.total === "number" ? res.total : categories.length,
      categories,
    };
  }
  if (Array.isArray(res)) {
    return { ok: true, total: res.length, categories: res };
  }
  return { ok: false, total: 0, categories: [] };
}

export const categoryServices = {
  list() {
    return fetchJson(ACTIONS.list);
  },

  detail(id) {
    return fetchJson(`${ACTIONS.detail}&id=${encodeURIComponent(id)}`);
  },

  create({ category_name }) {
    return postJson(ACTIONS.create, { category_name }).then((res) => {
      if (res && typeof res === "object" && !("status" in res)) {
        return { status: "ok", data: res };
      }
      return res;
    });
  },

  update({ category_id, category_name }) {
    return postJson(ACTIONS.update, {
      category_id,
      id: category_id,
      category_name,
    }).then((res) => {
      if (res && typeof res === "object" && !("status" in res)) {
        return { status: "ok", data: res };
      }
      return res;
    });
  },

  delete(id) {
    return postJson(ACTIONS.delete, { id }).then((res) => {
      if (res === true || res === 1 || (res && typeof res === "object" && !("status" in res))) {
        return { status: "ok", data: res };
      }
      return res;
    });
  },

  // ✅ GET: ?action=category_post_counts[&category_id=...]
  async countPost(category_id) {
    const url = category_id
      ? `${ACTIONS.countPost}&category_id=${encodeURIComponent(category_id)}`
      : ACTIONS.countPost;
    const res = await fetchJson(url);
    return normalizeCountsResponse(res);
  },
};

export default categoryServices;
