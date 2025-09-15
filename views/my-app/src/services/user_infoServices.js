// src/services/user_infoServices.js
import fetchJson from "./fetchJson";

/**
 * Gợi ý: PHP side cần đảm bảo KHÔNG echo gì khác ngoài JSON
 * (không BOM, không warning/notice) để tránh lỗi "Không parse được JSON".
 */

function toFormData(obj) {
  const fd = new FormData();
  Object.entries(obj).forEach(([k, v]) => {
    if (v !== undefined && v !== null) {
      fd.append(k, v);
    }
  });
  return fd;
}

export const userInfoApi = {
  /** GET /?action=list_user_infos */
  async listUserInfos() {
    return fetchJson("list_user_infos");
  },

  /** GET /?action=show_create_form
   *  -> trả về các user chưa có user_info (availableUsers)
   */
  async getAvailableUsers() {
    const res = await fetchJson("show_create_form");
    // res = { availableUsers: [...] }
    return res;
  },

  /** POST /?action=create_user_info
   *  params: { user_id, full_name, bio?, birth_date?, avatar? (File) }
   */
  async createUserInfo({ user_id, full_name, bio, birth_date, avatar }) {
    const body = toFormData({
      user_id,
      full_name,
      bio,
      birth_date,
      // avatar là File hoặc Blob; chỉ append khi có
      ...(avatar ? { avatar } : {}),
    });

    return fetchJson("create_user_info", {
      method: "POST",
      body,
      // KHÔNG set 'Content-Type' khi dùng FormData (tránh sai boundary)
    });
  },

  /** GET /?action=show_edit_form&id=:id
   *  -> lấy dữ liệu hiện tại để edit
   */
  async getUserInfoForEdit(id) {
    // fetchJson build URL: ...?action=${action}
    // nên mình "nhét" &id= vào action luôn
    return fetchJson(`show_edit_form&id=${encodeURIComponent(id)}`);
  },

  /** POST /?action=update_user_info
   *  params: { user_id, full_name, bio?, birth_date?, avatar? (File mới) }
   */
  async updateUserInfo({ user_id, full_name, bio, birth_date, avatar }) {
    const body = toFormData({
      user_id,
      full_name,
      bio,
      birth_date,
      ...(avatar ? { avatar } : {}),
    });

    return fetchJson("update_user_info", {
      method: "POST",
      body,
    });
  },

  /** DELETE /?action=delete_user_info&id=:id
   *  Nếu client khó gửi DELETE, PHP cũng cho phép POST (controller đã note).
   *  Ở đây mặc định dùng GET query cho đơn giản; muốn dùng POST thì xem hàm dưới.
   */
  async deleteUserInfo(id) {
    // Dùng query string: ...?action=delete_user_info&id=123
    return fetchJson(`delete_user_info&id=${encodeURIComponent(id)}`);
  },

  /** POST fallback cho xoá (nếu server chặn DELETE/GET)
   *  PHP controller đọc id từ $_GET['id'] hoặc $_POST['id'].
   */
  async deleteUserInfoViaPost(id) {
    const body = toFormData({ id });
    return fetchJson("delete_user_info", {
      method: "POST",
      body,
    });
  },

  /** GET /?action=show_user_info&id=:id
   *  -> trả về { user: {...}, isFollowing: bool }
   */
  async showUserInfo(id) {
    return fetchJson(`show_user_info&id=${encodeURIComponent(id)}`);
  },
};

export default userInfoApi;
