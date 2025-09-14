import fetchJson from "./fetchJson";
export const authApi = {
  // Đăng nhập
  login: async ({ identifier, password }) =>
    fetchJson("api_login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier, password }),
    }),

  // Đăng ký
  register: async (payload) =>
    fetchJson("api_register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }),

  // Lấy thông tin user hiện tại
  me: async () => fetchJson("api_me"),
};
