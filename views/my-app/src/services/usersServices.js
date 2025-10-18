// [Tác dụng file] Xử lý đăng nhập/đăng ký/đăng xuất, lấy thông tin người dùng, cập nhật tài khoản, xoá user
import fetchJson from "./fetchJson";

// [Tác dụng] POST JSON tiện dụng (dùng cho các API body JSON)
function postJson(action, payload) {
  return fetchJson(action, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload || {})
  });
}

// [Tác dụng] Gom các API xác thực và quản trị người dùng
export const authApi = {
  // [Tác dụng] Đăng nhập bằng identifier (username/email) + password
  login: function (params) {
    return postJson("api_login", {
      identifier: params && params.identifier,
      password: params && params.password
    });
  },

  // [Tác dụng] Đăng ký tài khoản mới
  register: function (params) {
    return postJson("api_register", {
      username: params && params.username,
      email: params && params.email,
      password: params && params.password,
      full_name: params && params.full_name,
      birth_date: params && params.birth_date,
      avatar_url: params && params.avatar_url !== undefined ? params.avatar_url : null,
      bio: params && params.bio !== undefined ? params.bio : null
    });
  },

  // [Tác dụng] Đăng xuất (huỷ session)
  logout: function () {
    return postJson("api_logout", {});
  },

  // [Tác dụng] Xoá người dùng theo user_id (method DELETE)
  deleteUser: function (user_id) {
    if (!user_id) throw new Error("user_id is required");
    return fetchJson("api_delete_user", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: user_id })
    });
  },

  // [Tác dụng] Lấy thông tin người dùng hiện tại
  me: function () {
    return fetchJson("api_me");
  },

  // [Tác dụng] Kiểm tra quyền admin
  admin: function () {
    return fetchJson("api_admin");
  },

  // [Tác dụng] Cập nhật tài khoản
  updateAccount: function (params) {
    let payload = {};
    if (params && "user_id" in params) payload.user_id = params.user_id;
    if (params && params.email !== undefined) payload.email = params.email;
    if (params && params.new_password !== undefined) payload.new_password = params.new_password;
    if (params && params.role_id !== undefined) payload.role_id = params.role_id;

    return postJson("api_update_account", payload);
  }
};

export default authApi;
