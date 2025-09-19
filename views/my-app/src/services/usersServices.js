// src/services/usersServices.js
import fetchJson from "./fetchJson";

/** 
 * LƯU Ý:
 * - fetchJson đã cấu hình credentials: "include" → gửi/nhận PHP session cookie.
 * - fetchJson trả về `data.data ?? data`, nên nếu API trả {status, user} thì bạn nhận nguyên object đó.
 */

function postJson(action, payload) {
  return fetchJson(action, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload ?? {}),
  });a
}

export const authApi = {
  /** POST /?action=api_login
   * Body: { identifier, password }
   * Response: { status: "ok", user: {...} } hoặc { status:"error", message:... }
   */
  login({ identifier, password }) {
    return postJson("api_login", { identifier, password });
  },

  /** POST /?action=api_register
   * Body: {
   *   username, email, password, full_name, birth_date,
   *   avatar_url (optional), bio (optional)
   * }
   * Response: { status: "ok", message: "Đăng ký thành công" }
   */
  register({ username, email, password, full_name, birth_date, avatar_url = null, bio = null }) {
    return postJson("api_register", {
      username,
      email,
      password,
      full_name,
      birth_date,
      avatar_url,
      bio,
    });
  },

  /** POST /?action=api_logout
   * Response: { status: "ok", message: "Đã đăng xuất" }
   */
  logout() {
    // Không cần body
    return postJson("api_logout", {});
  },

  /** GET /?action=api_me
   * Response (khi đã đăng nhập):
   * {
   *   status:"ok",
   *   user: { user_id, username, email, full_name, phone, bio, avatar_url }
   * }
   * Nếu chưa đăng nhập: { status:"error", message:"Chưa đăng nhập" }
   */
  me() {
    return fetchJson("api_me");
  },
};

export default authApi;
