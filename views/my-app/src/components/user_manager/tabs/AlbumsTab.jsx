// src/pages/user_manager/tabs/AlbumsTab.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

import AlbumItem from "../../../components/user_manager/list/AlbumItem";
import AlbumInfoPanel from "../../../components/user_manager/panels/AlbumInfoPanel";
import ConfirmModal from "../../../components/user_manager/modals/ConfirmModal";

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

  // 🔔 banner gọn
  const [banner, setBanner] = React.useState(null); // {type:'success'|'error'|'info', text}
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
      setSelectedId(mapped[0]?.id);
    } catch (e) {
      console.error("[AlbumsTab] fetchAlbums error:", e);
      setError(e?.message || "Failed to load albums");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (!fetched && !loading) fetchAlbums();
  }, []); // once

  React.useEffect(() => setPage(1), [fetched]);

  // ====== CẬP NHẬT UI SAU XOÁ (không reload) ======
  const removeFromLocal = (albumId) => {
    setData((prev) => {
      const next = prev.filter((x) => x.id !== albumId);

      // sửa selected nếu đang trỏ vào album vừa xoá
      setSelectedId((prevSel) => {
        if (prevSel === albumId) {
          return next[0]?.id;
        }
        return prevSel;
      });

      // điều chỉnh page nếu trang hiện tại rỗng
      const newTotalPages = Math.max(1, Math.ceil(next.length / PAGE_SIZE));
      setPage((p) => Math.min(p, newTotalPages));
      return next;
    });
  };

  // ====== THỰC THI XOÁ ======
  const doDelete = async (albumId) => {
    console.log("[AlbumsTab] 🔸 Deleting album:", albumId);
    const res = await albumService.delete(albumId);
    console.log("[AlbumsTab] ↩ delete response:", res);
    // Chuẩn hoá check status (tương thích nhiều BE)
    const ok =
      res?.status === "ok" ||
      res?.status === "success" ||
      res?.message?.toLowerCase?.().includes("đã xoá") ||
      res === true;
    if (!ok) {
      throw new Error(res?.message || "Delete failed");
    }
    return res;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Album List</h2>
          <div className="flex items-center gap-2">
            <button
              className="px-3 py-1.5 rounded-md border border-white/20 text-white/90 hover:text-white"
              onClick={fetchAlbums}
              disabled={loading}
              title="Refresh albums"
            >
              <i className="fa-solid fa-rotate"></i>
            </button>
          </div>
        </div>

        {/* 🔔 banner */}
        {banner && (
          <div
            className={
              "px-3 py-2 rounded-md text-sm border " +
              (banner.type === "success"
                ? "bg-emerald-900/30 text-emerald-200 border-emerald-700/40"
                : banner.type === "error"
                ? "bg-red-900/30 text-red-200 border-red-700/40"
                : "bg-white/5 text-white/80 border-white/10")
            }
          >
            {banner.text}
          </div>
        )}

        {loading && !fetched && (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-14 rounded-xl bg-white/5 border border-white/10 animate-pulse"
              />
            ))}
          </div>
        )}

        {error && data.length === 0 && (
          <div className="text-red-300 bg-red-900/20 border border-red-500/30 rounded-xl p-4">
            Failed to load albums: {error}
            <div className="mt-3">
              <button
                onClick={fetchAlbums}
                className="px-3 py-1.5 rounded-md bg-white text-black"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {fetched && data.length === 0 && (
          <div className="text-white/70 bg-white/5 border border-white/10 rounded-xl p-4">
            No albums found.
          </div>
        )}

        <div className="space-y-3">
          {pageData.map((a) => (
            <AlbumItem
              key={a.id}
              album={a}
              active={a.id === selectedId}
              onClick={() => setSelectedId(a.id)}
              onEdit={() => alert("Edit album")}
              onDelete={() => setConfirm({ open: true, target: a })}
              onView={() => navigate(`/album/${encodeURIComponent(a.id)}`)}
            />
          ))}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-2">
            <button
              className="px-3 py-1.5 rounded-md border border-white/10 text-sm text-white/90 disabled:opacity-40"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Prev
            </button>
            <div className="text-sm text-white/80">
              Page <span className="font-semibold">{page}</span> / {totalPages}
            </div>
            <button
              className="px-3 py-1.5 rounded-md border border-white/10 text-sm text-white/90 disabled:opacity-40"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next
            </button>
          </div>
        )}
      </div>

      <aside>
        {currentAlbum ? (
          <AlbumInfoPanel album={currentAlbum} />
        ) : (
          <div className="bg-[#1C2028] p-6 rounded-xl border border-[#2d2d33] text-white/70">
            Nothing to show here.
          </div>
        )}
      </aside>

      <ConfirmModal
        open={confirm.open}
        message={`Are you sure you want to delete ${confirm.target?.name || "this album"}?`}
        onClose={() => setConfirm({ open: false, target: null })}
        onConfirm={async () => {
          const albumId = confirm.target?.id;
          console.log("[AlbumsTab] ✅ Confirm delete, albumId=", albumId);
          try {
            const res = await doDelete(albumId);
            removeFromLocal(albumId);
            showBanner("success", "Đã xoá album.");
            console.log("[AlbumsTab] 🟢 Xoá thành công:", res);
          } catch (e) {
            console.error("[AlbumsTab] 🔴 Delete failed:", e);
            showBanner("error", e?.message || "Delete failed");
          } finally {
            setConfirm({ open: false, target: null });
          }
        }}
      />
    </div>
  );
}
