import React from "react";
import { useNavigate } from "react-router-dom";

import AlbumItem from "../../../components/user_manager/list/AlbumItem";
import AlbumInfoPanel from "../../../components/user_manager/panels/AlbumInfoPanel";
import ConfirmModal from "../../common/ConfirmModal";
import ModalEditAlbum from "../../../components/user_manager/modals/ModalEditAlbum";
import albumService from "../../../services/albumService";

const mapApiAlbum = (a) => ({
  id: a.album_id,
  name: a.album_name,
  description: a.description || "",
  thumbnail: a.url_thumbnail || "",
  userId: a.user_id,
  createdAt: a.created_at,
  raw: a,
});

export default function AlbumsTab() {
  const navigate = useNavigate();
  const [data, setData] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [fetched, setFetched] = React.useState(false);
  const [selectedId, setSelectedId] = React.useState();
  const [page, setPage] = React.useState(1);
  const PAGE_SIZE = 10;

  const [confirm, setConfirm] = React.useState({ open: false, target: null });
  const [openEdit, setOpenEdit] = React.useState(false);
  const [editAlbum, setEditAlbum] = React.useState(null);
  const [banner, setBanner] = React.useState(null);

  const showBanner = (type, text, ms = 2200) => {
    setBanner({ type, text });
    window.clearTimeout(showBanner._t);
    showBanner._t = window.setTimeout(() => setBanner(null), ms);
  };

  const totalPages = Math.max(1, Math.ceil(data.length / PAGE_SIZE));
  const pageData = React.useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return data.slice(start, start + PAGE_SIZE);
  }, [data, page]);

  const currentAlbum =
    data.find((a) => a.id === selectedId) ?? pageData[0] ?? null;

  const fetchAlbums = async () => {
    try {
      setLoading(true);
      setError(null);
      const arr = await albumService.listAllAlbums();
      const mapped = (Array.isArray(arr) ? arr : []).map(mapApiAlbum);
      setData(mapped);
      setFetched(true);
      setSelectedId((prev) => prev ?? mapped[0]?.id);
    } catch (e) {
      setError(e?.message || "Failed to load albums");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (!fetched && !loading) fetchAlbums();
  }, []); 

  React.useEffect(() => setPage(1), [fetched]);

  const removeFromLocal = (albumId) => {
    setData((prev) => {
      const next = prev.filter((x) => x.id !== albumId);
      setSelectedId((prevSel) => (prevSel === albumId ? next[0]?.id : prevSel));
      const newTotalPages = Math.max(1, Math.ceil(next.length / PAGE_SIZE));
      setPage((p) => Math.min(p, newTotalPages));
      return next;
    });
  };

  const doDelete = async (albumId) => {
    const res = await albumService.delete(albumId);
    const ok =
      res?.status === "ok" ||
      res?.status === "success" ||
      res?.message?.toLowerCase?.().includes("đã xoá") ||
      res === true;
    if (!ok) throw new Error(res?.message || "Delete failed");
    return res;
  };

  const handleUpdateAlbum = async ({
    album_id,
    album_name,
    description,
    thumbnailFile,
  }) => {
    try {
      const res = await albumService.update({
        album_id,
        album_name,
        description,
        thumbnail: thumbnailFile,
      });
      if (res?.status === "ok" || res?.status === "success") {
        await fetchAlbums();
        setSelectedId(album_id);
        showBanner("success", res?.message || "Cập nhật album thành công.");
        return { status: "ok" };
      }
      return { status: "error", message: res?.message || "Update failed" };
    } catch (e) {
      return { status: "error", message: e?.message || "Network error" };
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Album List</h2>
          <button
            className="btn btn-outline"
            onClick={fetchAlbums}
            disabled={loading}
            title="Refresh albums"
          >
            <i className="fa-solid fa-rotate"></i>
          </button>
        </div>

        {banner && <div className={`banner banner--${banner.type}`}>{banner.text}</div>}

        {loading && !fetched && (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-14 rounded-xl bg-white/5 border border-white/10 animate-pulse" />
            ))}
          </div>
        )}

        {error && data.length === 0 && (
          <div className="panel panel-muted text-red-300">
            Failed to load albums: {error}
            <div className="mt-3">
              <button onClick={fetchAlbums} className="btn btn-primary">Retry</button>
            </div>
          </div>
        )}

        {fetched && data.length === 0 && (
          <div className="panel panel-muted">No albums found.</div>
        )}

        <div className="space-y-3">
          {pageData.map((a) => (
            <AlbumItem
              key={a.id}
              album={a}
              active={a.id === selectedId}
              onClick={() => setSelectedId(a.id)}
              onEdit={() => {
                setEditAlbum(a);
                setOpenEdit(true);
              }}
              onDelete={() => setConfirm({ open: true, target: a })}
              onView={() => navigate(`/album/${encodeURIComponent(a.id)}`)}
            />
          ))}
        </div>

        {totalPages > 1 && (
          <div className="pagination">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >Prev</button>
            <div>Page <strong>{page}</strong> / {totalPages}</div>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >Next</button>
          </div>
        )}
      </div>

      <aside>
        {currentAlbum ? (
          <AlbumInfoPanel album={currentAlbum} />
        ) : (
          <div className="panel panel-muted">Nothing to show here.</div>
        )}
      </aside>

      <ModalEditAlbum
        open={openEdit}
        onClose={() => setOpenEdit(false)}
        album={editAlbum}
        onSave={async (payload) => {
          const r = await handleUpdateAlbum(payload);
          if (r.status === "ok") setOpenEdit(false);
          return r;
        }}
      />

      <ConfirmModal
        open={confirm.open}
        message={`Are you sure you want to delete ${confirm.target?.name || "this album"}?`}
        onClose={() => setConfirm({ open: false, target: null })}
        onConfirm={async () => {
          const albumId = confirm.target?.id;
          try {
            await doDelete(albumId);
            removeFromLocal(albumId);
            showBanner("success", "Đã xoá album.");
          } catch (e) {
            showBanner("error", e?.message || "Delete failed");
          } finally {
            setConfirm({ open: false, target: null });
          }
        }}
      />
    </div>
  );
}
