// src/services/categoryServices.js
import fetchJson from "./fetchJson";

const ACTIONS = {
  list: "list_categories",
  detail: "category_detail",
  create: "create_category",
  update: "update_category",
  delete: "delete_category",
};

function postJson(action, payload) {
  return fetchJson(action, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload ?? {}),
  });
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
      // fetchJson có thể trả {status:"ok",...} hoặc chỉ {data...}
      if (res && typeof res === "object" && !("status" in res)) {
        return { status: "ok", data: res };
      }
      return res;
    });
  },

  update({ category_id, category_name }) {
    return postJson(ACTIONS.update, {
      category_id,
      id: category_id, // tương thích BE nhận "id"
      category_name,
    }).then((res) => {
      // ✅ luôn đảm bảo có status
      if (res && typeof res === "object" && !("status" in res)) {
        return { status: "ok", data: res };
      }
      return res;
    });
  },

  delete(id) {
    return postJson(ACTIONS.delete, { id }).then((res) => {
      // Một số BE trả true/1/{} → chuẩn hoá thành ok
      if (res === true || res === 1 || (res && typeof res === "object" && !("status" in res))) {
        return { status: "ok", data: res };
      }
      return res;
    });
  },
};

export default categoryServices;
