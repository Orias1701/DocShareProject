// src/services/albumService.js
import fetchJson from "./fetchJson";

// Khớp 1-1 với router/index.php
const ACTIONS = {
  create: "create_album",
  update: "update_album",
  delete: "delete_album",
  listMine: "list_user_albums",
  listAll: "list_albums",              // ✅ đổi từ list_all_albums -> list_albums
  listByUser: "list_albums_by_user",   // ✅ đổi từ list_albums_by_user_id -> list_albums_by_user
};

function postJson(action, payload) {
  return fetchJson(action, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload ?? {}),
  });
}

export const albumService = {
  // Tạo album
  create({ album_name, description = null }) {
    return postJson(ACTIONS.create, { album_name, description });
  },

  // Cập nhật album
  update({ album_id, album_name, description = null }) {
    return postJson(ACTIONS.update, { album_id, album_name, description });
  },

  // Xoá album (dùng POST theo BE)
  delete(id) {
    return postJson(ACTIONS.delete, { id });
  },

  // Lấy album của chính user (dựa session)
  listMyAlbums() {
    return fetchJson(ACTIONS.listMine);
  },

  // Lấy tất cả album
  listAllAlbums() {
    return fetchJson(ACTIONS.listAll);
  },

  // Lấy album theo user_id bất kỳ
  listAlbumsByUserId(user_id) {
    // router nhận query ?user_id=
    return fetchJson(`${ACTIONS.listByUser}&user_id=${encodeURIComponent(user_id)}`);
  },
};

export default albumService;
