// src/services/categoryServices.js
import fetchJson from "./fetchJson";

/**
 * Map action names theo router/index.php
 * Nếu bạn đặt tên khác ở index.php, đổi các string dưới đây cho khớp.
 */
const ACTIONS = {
  list: "list_categories",
  detail: "category_detail",
  create: "create_category",
  update: "update_category",
  delete: "delete_category",
};

// Helpers
function postJson(action, payload) {
  return fetchJson(action, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload ?? {}),
  });
}

export const categoryServices = {
  /** GET /?action=list_categories */
  list() {
    return fetchJson(ACTIONS.list);
  },

  /** GET /?action=category_detail&id=... */
  detail(id) {
    return fetchJson(`${ACTIONS.detail}&id=${encodeURIComponent(id)}`);
  },

  /** POST /?action=create_category
   *  Body JSON: { category_name: string }
   */
  create({ category_name }) {
    return postJson(ACTIONS.create, { category_name });
  },

  /** POST|PUT /?action=update_category
   *  Body JSON: { category_id, category_name }
   */
  update({ category_id, category_name }) {
    return postJson(ACTIONS.update, { category_id, category_name });
  },

  /** DELETE/POST /?action=delete_category
   *  Ở đây dùng POST JSON: { id }
   */
  delete(id) {
    return postJson(ACTIONS.delete, { id });
  },
};

export default categoryServices;
