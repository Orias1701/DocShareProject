import fetchJson from "./fetchJson";

function toFormData(obj) {
  const fd = new FormData();
  Object.entries(obj).forEach(([k, v]) => {
    if (v !== undefined && v !== null) {
      fd.append(k, v);
    }
  });
  return fd;
}

const ACTIONS = {
  create: "create_album",
  update: "update_album",
  delete: "delete_album",
  listMine: "list_user_albums",
  listAll: "list_albums",
  listByUser: "list_albums_by_user",
};

export const albumService = {
  // Tạo album (có thumbnail file)
  create({ album_name, description, thumbnail }) {
    const body = toFormData({
      album_name,
      description,
      ...(thumbnail ? { thumbnail } : {}),
    });
    return fetchJson(ACTIONS.create, {
      method: "POST",
      body,
    });
  },

  // Cập nhật album
  update({ album_id, album_name, description, thumbnail }) {
    const body = toFormData({
      album_id,
      album_name,
      description,
      ...(thumbnail ? { thumbnail } : {}),
    });
    return fetchJson(ACTIONS.update, {
      method: "POST",
      body,
    });
  },

  // Các hàm khác giữ nguyên
  delete(id) {
    return fetchJson(ACTIONS.delete, { method: "POST", body: toFormData({ id }) });
  },
  listMyAlbums() {
    return fetchJson(ACTIONS.listMine);
  },
  listAllAlbums() {
    return fetchJson(ACTIONS.listAll);
  },
  listAlbumsByUserId(user_id) {
    return fetchJson(`${ACTIONS.listByUser}&user_id=${encodeURIComponent(user_id)}`);
  },
};

export default albumService;
