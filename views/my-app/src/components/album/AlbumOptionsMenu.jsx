// src/components/albums/AlbumOptionsMenu.jsx
import React, { useEffect, useRef, useState } from "react";
import ConfirmModal from "../common/ConfirmModal";
import authApi from "../../services/usersServices";
import albumService from "../../services/albumService";

// bỏ dấu để so khớp thông điệp
const noAccent = (s) =>
  String(s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

const isDeleteSuccess = (res) => {
  if (!res || typeof res !== "object") return false;
  const status = String(res.status || res.data?.status || "").toLowerCase();
  if (["ok", "success", "deleted"].includes(status)) return true;
  if (res.success === true || res.deleted === true || res.ok === true) return true;
  if (Number(res.code) === 200 || Number(res.affected_rows) > 0) return true;
  const msg = noAccent(res.message || res.data?.message || "");
  if (/da xoa|xoa thanh cong|deleted|remove success/.test(msg)) return true;
  return false;
};

/**
 * Props:
 *  - albumId (bắt buộc)
 *  - ownerId?         : user_id chủ album (nếu có)
 *  - isOwner? boolean : nếu chắc chắn là album của chính mình (ví dụ trang My Albums), set true để bỏ qua kiểm tra
 *  - onEdit?          : () => void
 *  - onDeleted?       : (albumId) => void
 */
export default function AlbumOptionsMenu({ albumId, ownerId, isOwner = false, onEdit, onDeleted }) {
  const [open, setOpen] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [canDelete, setCanDelete] = useState(false);
  const [checking, setChecking] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState(null);
  const ref = useRef(null);

  // đóng menu khi click ra ngoài
  useEffect(() => {
    const onDocClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  // kiểm tra quyền
  useEffect(() => {
    let mounted = true;

    // 1) Nếu isOwner = true (trang My Albums) → cho phép luôn
    if (isOwner) {
      setCanDelete(true);
      setChecking(false);
      return () => { mounted = false; };
    }

    (async () => {
      if (!albumId) {
        mounted && setCanDelete(false);
        mounted && setChecking(false);
        return;
      }
      setChecking(true);
      try {
        const meRes = await authApi.me().catch(() => null);
        const meId =
          meRes?.user?.user_id ??
          meRes?.user_id ??
          meRes?.data?.user?.user_id ??
          meRes?.data?.user_id ??
          null;

        let owner = ownerId ?? null;
        if (owner == null && typeof albumService.getAlbumDetail === "function") {
          const detail = await albumService.getAlbumDetail(albumId).catch(() => null);
          owner =
            detail?.user_id ?? detail?.data?.user_id ?? detail?.owner_id ?? detail?.data?.owner_id ?? null;
        }

        const ok = !!meId && !!owner && String(meId) === String(owner);
        if (mounted) setCanDelete(ok);
      } catch {
        if (mounted) setCanDelete(false);
      } finally {
        if (mounted) setChecking(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [albumId, ownerId, isOwner]);

  const showToast = (type, text) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 2500);
  };

  const handleDelete = async () => {
    if (!albumId || deleting) return;
    setDeleting(true);
    try {
      let res;
      if (typeof albumService.removeViaPost === "function") {
        res = await albumService.removeViaPost(albumId);
      } else if (typeof albumService.delete === "function") {
        res = await albumService.delete(albumId);
      } else if (typeof albumService.remove === "function") {
        res = await albumService.remove(albumId);
      } else {
        throw new Error("albumService không có hàm xóa (delete/remove).");
      }

      if (isDeleteSuccess(res)) {
        setShowConfirm(false);
        showToast("success", "🗑️ Xóa album thành công.");
        onDeleted?.(albumId);
        return;
      }

      const err =
        res?.message || res?.error || res?.data?.message || res?.data?.error || "Không rõ lỗi";
      showToast("error", `❌ Xóa thất bại: ${err}`);
    } catch (e) {
      showToast("error", `❌ Xóa thất bại: ${e?.message || "Có lỗi xảy ra."}`);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="relative" ref={ref}>
      <button
        className="text-gray-400 hover:text-white"
        aria-label="Album options"
        onClick={() => setOpen((v) => !v)}
        disabled={checking && !open}
      >
        <i className="fa-solid fa-ellipsis-vertical" />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-40 bg-[#1C2028] border border-gray-700 rounded-lg shadow-lg z-50">
          <button
            onClick={() => {
              setOpen(false);
              onEdit?.();
            }}
            className="flex items-center gap-2 w-full px-3 py-2 text-left text-sm text-gray-300 hover:bg-gray-700/40 rounded-t-lg"
          >
            <i className="fa-solid fa-pen-to-square text-blue-400"></i>
            Sửa
          </button>

          {canDelete ? (
            <button
              onClick={() => {
                setOpen(false);
                setShowConfirm(true);
              }}
              className="flex items-center gap-2 w-full px-3 py-2 text-left text-sm text-red-400 hover:bg-gray-700/40 rounded-b-lg"
            >
              <i className="fa-solid fa-trash-can text-red-500"></i>
              Xóa
            </button>
          ) : (
            <div className="px-3 py-2 text-xs text-gray-500 border-t border-gray-800 rounded-b-lg">
              Không có quyền xóa
            </div>
          )}
        </div>
      )}

      {toast && (
        <div
          className={`fixed bottom-6 right-6 px-4 py-2 rounded-lg shadow-lg text-sm
            ${toast.type === "success" ? "bg-green-600 text-white" : ""}
            ${toast.type === "error" ? "bg-red-600 text-white" : ""}`}
        >
          {toast.text}
        </div>
      )}

      <ConfirmModal
        open={showConfirm}
        message="Bạn có chắc muốn xóa album này? Hành động này không thể hoàn tác."
        onClose={() => setShowConfirm(false)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
