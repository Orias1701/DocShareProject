// src/services/albumService.js
import fetchJson from "./fetchJson";

function toFormData(obj) {
  const fd = new FormData();
  Object.entries(obj).forEach(([k, v]) => {
    if (v !== undefined && v !== null) fd.append(k, v);
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
  detail: "get_album_detail",   
};

// Helper: bóc mảng từ nhiều kiểu payload khác nhau
const pickArray = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== "object") return [];
  for (const key of ["data", "items", "list", "albums"]) {
    if (Array.isArray(payload[key])) return payload[key];
  }
  return [];
};

export const albumService = {
  create({ album_name, description, thumbnail }) {
    const body = toFormData({ album_name, description, ...(thumbnail ? { thumbnail } : {}) });
    return fetchJson(ACTIONS.create, { method: "POST", body });
  },

  update({ album_id, album_name, description, thumbnail }) {
    const body = toFormData({ album_id, album_name, description, ...(thumbnail ? { thumbnail } : {}) });
    return fetchJson(ACTIONS.update, { method: "POST", body });
  },

  delete(id) {
    return fetchJson(ACTIONS.delete, {
      method: "POST",
      body: toFormData({ album_id: id }), // ✅ đổi key id → album_id
    });
  },
  

  // ✅ Trả về MẢNG albums đã bóc từ payload
  async listMyAlbums() {
    const res = await fetchJson(ACTIONS.listMine);
    return pickArray(res);
  },
  async listAllAlbums() {
    const res = await fetchJson(ACTIONS.listAll);
    return pickArray(res);
  },
  async listAlbumsByUserId(user_id) {
    const res = await fetchJson(`${ACTIONS.listByUser}&user_id=${encodeURIComponent(user_id)}`);
    return pickArray(res);
  },
  async getAlbumDetail(album_id) {
    const res = await fetchJson(`${ACTIONS.detail}&album_id=${encodeURIComponent(album_id)}`);
    // trả về object album
    return res?.data || res || null;
  },

  
};

export default albumService;
