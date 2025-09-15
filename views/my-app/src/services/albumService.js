// src/services/albumService.js
import fetchJson from "./fetchJson";

// Map action name theo router/index.php của bạn.
// Nếu bạn dùng tên khác, đổi ở đây cho khớp.
const ACTIONS = {
  create: "create_album",
  update: "update_album",
  delete: "delete_album",
  listMine: "list_user_albums",        // -> AlbumController::listUserAlbums
  listAll: "list_all_albums",
  listByUserId: "list_albums_by_user_id",
  detail: "album_detail",
};

// Helpers
function postJson(action, payload) {
  return fetchJson(action, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload ?? {}),
  });
}

function toFormData(obj = {}) {
  const fd = new FormData();
  Object.entries(obj).forEach(([k, v]) => {
    if (v !== undefined && v !== null) fd.append(k, v);
  });
  return fd;
}

export const albumService = {
  /**
   * Tạo album
   * Body: { album_name: string, description?: string }
   * AlbumController::create chấp nhận JSON hoặc form. Mặc định gửi JSON.
   */
  create({ album_name, description = null }) {
    return postJson(ACTIONS.create, { album_name, description });
  },

  /**
   * Cập nhật album
   * Body: { album_id: string|number, album_name: string, description?: string }
   * Controller cho phép POST/PUT; ở đây dùng POST JSON.
   */
  update({ album_id, album_name, description = null }) {
    return postJson(ACTIONS.update, { album_id, album_name, description });
  },

  /**
   * Xoá album
   * - BE cho phép DELETE hoặc POST. Ở đây dùng POST cho đơn giản.
   */
  delete(id) {
    return postJson(ACTIONS.delete, { id });
  },
  // Nếu bạn muốn dùng DELETE thật:
  // deleteViaMethod(id) {
  //   const fd = toFormData({ id });
  //   return fetchJson(ACTIONS.delete, { method: "DELETE", body: fd });
  // },

  /**
   * Lấy album của chính user đang đăng nhập (dựa trên session)
   * GET /?action=list_user_albums
   */
  listMyAlbums() {
    return fetchJson(ACTIONS.listMine);
  },

  /**
   * Lấy tất cả album (nếu cần)
   * GET /?action=list_all_albums
   */
  listAllAlbums() {
    return fetchJson(ACTIONS.listAll);
  },

  /**
   * Lấy album theo user_id bất kỳ (admin/hoặc trang profile người khác)
   * GET /?action=list_albums_by_user_id&user_id=...
   */
  listAlbumsByUserId(user_id) {
    return fetchJson(`${ACTIONS.listByUserId}&user_id=${encodeURIComponent(user_id)}`);
  },

  /**
   * Chi tiết 1 album
   * GET /?action=album_detail&id=...
   */
  detail(id) {
    return fetchJson(`${ACTIONS.detail}&id=${encodeURIComponent(id)}`);
  },
};

export default albumService;
