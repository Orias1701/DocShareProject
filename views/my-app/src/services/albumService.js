// [Tác dụng file] Cung cấp hàm làm việc với album (tạo/sửa/xoá/lấy danh sách/chi tiết)
import fetchJson from "./fetchJson";

// [Tác dụng] Chuyển object -> FormData (hỗ trợ gửi file)
function toFormData(obj) {
  let fd = new FormData();
  if (obj) {
    for (let k in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, k)) {
        let v = obj[k];
        if (v !== undefined && v !== null) fd.append(k, v);
      }
    }
  }
  return fd;
}

// [Tác dụng] Tập hợp action của API cho album
const ACTIONS = {
  create: "create_album",
  update: "update_album",
  delete: "delete_album",
  listMine: "list_user_albums",
  listAll: "list_albums",
  listByUser: "list_albums_by_user",
  detail: "get_album_detail"
};

// [Tác dụng] Chuẩn hoá response thành mảng nếu server trả dạng khác nhau
function pickArray(payload) {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== "object") return [];
  let keys = ["data", "items", "list", "albums"];
  for (let i = 0; i < keys.length; i++) {
    let key = keys[i];
    if (payload[key] && Array.isArray(payload[key])) return payload[key];
  }
  return [];
}

export const albumService = {
  // [Tác dụng] Tạo album mới (hỗ trợ file thumbnail)
  create: function (params) {
    let body = toFormData({
      album_name: params && params.album_name,
      description: params && params.description,
      thumbnail: params && params.thumbnail
    });
    return fetchJson(ACTIONS.create, { method: "POST", body: body });
  },

  // [Tác dụng] Cập nhật album theo album_id
  update: function (params) {
    let body = toFormData({
      album_id: params && params.album_id,
      album_name: params && params.album_name,
      description: params && params.description,
      thumbnail: params && params.thumbnail
    });
    return fetchJson(ACTIONS.update, { method: "POST", body: body });
  },

  // [Tác dụng] Xoá album theo id
  delete: function (id) {
    return fetchJson(ACTIONS.delete, {
      method: "POST",
      body: toFormData({ album_id: id })
    });
  },

  // [Tác dụng] Lấy danh sách album của người dùng hiện tại
  listMyAlbums: async function () {
    let res = await fetchJson(ACTIONS.listMine);
    return pickArray(res);
  },

  // [Tác dụng] Lấy toàn bộ album
  listAllAlbums: async function () {
    let res = await fetchJson(ACTIONS.listAll);
    return pickArray(res);
  },

  // [Tác dụng] Lấy album theo user_id
  listAlbumsByUserId: async function (user_id) {
    let url = ACTIONS.listByUser + "&user_id=" + encodeURIComponent(user_id);
    let res = await fetchJson(url);
    return pickArray(res);
  },

  // [Tác dụng] Lấy chi tiết một album theo album_id
  getAlbumDetail: async function (params) {
    let album_id = params && params.album_id;
    let url = ACTIONS.detail + "&album_id=" + encodeURIComponent(album_id);
    let res = await fetchJson(url);
    if (res && typeof res === "object" && res.data !== undefined) return res.data;
    return res || null;
  }
};

export default albumService;
