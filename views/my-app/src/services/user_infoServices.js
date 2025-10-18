// [Tác dụng file] CRUD thông tin người dùng (user_info) và các form liên quan
import fetchJson from "./fetchJson";

// [Tác dụng] Chuyển object → FormData cho POST (có thể có avatar)
function toFormData(obj) {
  let fd = new FormData();
  let o = obj || {};
  for (let k in o) {
    if (Object.prototype.hasOwnProperty.call(o, k)) {
      let v = o[k];
      if (v !== undefined && v !== null) fd.append(k, v);
    }
  }
  return fd;
}

// [Tác dụng] Các API cụ thể cho user info
export const userInfoApi = {
  // [Tác dụng] Lấy danh sách tất cả user_info
  listUserInfos: async function () {
    return fetchJson("list_user_infos");
  },

  // [Tác dụng] Lấy danh sách user chưa có user_info (để tạo mới)
  getAvailableUsers: async function () {
    let res = await fetchJson("show_create_form");
    return res;
  },

  // [Tác dụng] Tạo user_info: cho phép kèm avatar (File/Blob)
  createUserInfo: async function (params) {
    let body = toFormData({
      user_id: params && params.user_id,
      full_name: params && params.full_name,
      bio: params && params.bio,
      birth_date: params && params.birth_date,
      avatar: params && params.avatar ? params.avatar : undefined
    });
    return fetchJson("create_user_info", { method: "POST", body: body });
  },

  // [Tác dụng] Lấy dữ liệu hiện tại để edit user_info theo id
  getUserInfoForEdit: async function (id) {
    return fetchJson("show_edit_form&id=" + encodeURIComponent(id));
  },

  // [Tác dụng] Cập nhật user_info (cho phép thay avatar mới)
  updateUserInfo: async function (params) {
    let body = toFormData({
      user_id: params && params.user_id,
      full_name: params && params.full_name,
      bio: params && params.bio,
      birth_date: params && params.birth_date,
      avatar: params && params.avatar ? params.avatar : undefined
    });
    return fetchJson("update_user_info", { method: "POST", body: body });
  },

  // [Tác dụng] Xoá user_info theo id (dạng GET query)
  deleteUserInfo: async function (id) {
    return fetchJson("delete_user_info&id=" + encodeURIComponent(id));
  },

  // [Tác dụng] Xoá user_info qua POST (fallback nếu cần)
  deleteUserInfoViaPost: async function (id) {
    let body = toFormData({ id: id });
    return fetchJson("delete_user_info", { method: "POST", body: body });
  },

  // [Tác dụng] Hiển thị thông tin user_info theo id
  showUserInfo: async function (id) {
    return fetchJson("show_user_info&id=" + encodeURIComponent(id));
  }
};

export default userInfoApi;
