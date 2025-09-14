// src/api/userInfoApi.js
import fetchJson from "./fetchJson";

export const userInfoApi = {
  // GET tất cả user info
  list: () => fetchJson("list_user_infos"),

  // GET chi tiết user info theo id
  detail: (id) => fetchJson(`user_detail&id=${id}`),

  // Tạo user info mới
  create: (formData) =>
    fetchJson("create_user_info", {
      method: "POST",
      body: formData, // FormData hỗ trợ upload file
    }),

  // Update user info
  update: (formData) =>
    fetchJson("update_user_info", {
      method: "POST",
      body: formData,
    }),

  // Delete user info
  delete: (id) =>
    fetchJson(`delete_user_info&id=${id}`, {
      method: "DELETE",
    }),
};
