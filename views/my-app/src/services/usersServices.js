// usersServices.js
// [Tác dụng file] Xử lý đăng nhập/đăng ký/đăng xuất, lấy thông tin người dùng, cập nhật tài khoản, xoá user
import fetchJson from "./fetchJson";

// Helper: POST JSON tiện dụng
function postJson(action, payload) {
  return fetchJson(action, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload || {}),
  });
}

export const authApi = {
  // Đăng nhập bằng identifier (username/email) + password
  login(params) {
    return postJson("api_login", {
      identifier: params?.identifier,
      password: params?.password,
    });
  },

  // Đăng ký tài khoản mới
  register(params) {
    return postJson("api_register", {
      username: params?.username,
      email: params?.email,
      password: params?.password,
      full_name: params?.full_name,
      birth_date: params?.birth_date,
      avatar_url: params?.avatar_url !== undefined ? params.avatar_url : null,
      bio: params?.bio !== undefined ? params.bio : null,
    });
  },

  // Đăng xuất
  logout() {
    return postJson("api_logout", {});
  },

  // Xoá người dùng theo user_id (method DELETE)
  deleteUser(user_id) {
    if (!user_id) throw new Error("user_id is required");
    return fetchJson("api_delete_user", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id }),
    });
  },

  // Lấy thông tin người dùng hiện tại
  me() {
    return fetchJson("api_me");
  },

  // Kiểm tra quyền admin
  admin() {
    return fetchJson("api_admin");
  },

  // Cập nhật tài khoản
  updateAccount(params) {
    const payload = {};
    if (params && "user_id" in params) payload.user_id = params.user_id;
    if (params && params.email !== undefined) payload.email = params.email;
    if (params && params.new_password !== undefined) payload.new_password = params.new_password;
    if (params && params.role_id !== undefined) payload.role_id = params.role_id;
    return postJson("api_update_account", payload);
  },

  // Quên mật khẩu — BE đọc $body['email']
  forgotPassword(email) {
    return postJson("forgot-password", { email });
    // Nếu bạn có alias PHP: return postJson("api_forgot_password", { email });
  },

  // Đặt lại mật khẩu
  resetPassword({ token, new_password }) {
    return postJson("reset-password", { token, new_password });
    // Nếu bạn có alias PHP: return postJson("api_reset_password", { token, new_password });
  },
};

export default authApi;
