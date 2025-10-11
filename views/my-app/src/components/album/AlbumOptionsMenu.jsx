// src/components/albums/AlbumOptionsMenu.jsx
import React, { useEffect, useRef, useState } from "react";
import ConfirmModal from "../common/ConfirmModal";
import ModalEditAlbum from "../user_manager/modals/ModalEditAlbum";
import authApi from "../../services/usersServices";
import albumService from "../../services/albumService";

// ===== Helper: chuẩn hoá check =====
const noAccent = (s) =>
  String(s || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

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

const isUpdateSuccess = (res) => {
  if (!res || typeof res !== "object") return false;
  const status = String(res.status || res.data?.status || "").toLowerCase();
  if (["ok", "success", "updated"].includes(status)) return true;
  if (res.success === true || res.updated === true || res.ok === true) return true;
  const msg = noAccent(res.message || res.data?.message || "");
  if (/cap nhat|update thanh cong|updated/.test(msg)) return true;
  return false;
};

/**
 * AlbumOptionsMenu — menu 3 chấm của mỗi album
 * Props:
 *  - albumId
 *  - ownerId?
 *  - albumObj? (nếu có, dùng luôn để edit không cần fetch lại)
 *  - isOwner?
 *  - onEdit?(updatedAlbum)
 *  - onDeleted?(albumId)
 */
export default function AlbumOptionsMenu({
  albumId,
  ownerId,
  albumObj,
  isOwner = false,
  onEdit,
  onDeleted,
}) {
  const [open, setOpen] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [canDelete, setCanDelete] = useState(false);
  const [checking, setChecking] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState(null);

  // ✨ Modal Edit
  const [openEdit, setOpenEdit] = useState(false);
  const [editAlbum, setEditAlbum] = useState(null);

  const ref = useRef(null);

  // ===== Click ngoài để đóng menu =====
  useEffect(() => {
    const onDocClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  // ===== Kiểm tra quyền xóa =====
  useEffect(() => {
    let mounted = true;

    if (isOwner) {
      setCanDelete(true);
      setChecking(false);
      return () => (mounted = false);
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
          // ✅ gọi đúng chữ ký service: nhận object { album_id }
          const detail = await albumService.getAlbumDetail({ album_id: albumId }).catch(() => null);
          owner =
            detail?.user_id ??
            detail?.data?.user_id ??
            detail?.owner_id ??
            detail?.data?.owner_id ??
            null;
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

  // ===== XÓA =====
  const handleDelete = async () => {
    if (!albumId || deleting) return;
    setDeleting(true);
    try {
      const res = await albumService.delete(albumId);
      if (isDeleteSuccess(res)) {
        setShowConfirm(false);
        showToast("success", "🗑️ Xóa album thành công.");
        onDeleted?.(albumId);
      } else {
        const err =
          res?.message || res?.error || res?.data?.message || res?.data?.error || "Không rõ lỗi";
        showToast("error", `❌ Xóa thất bại: ${err}`);
      }
    } catch (e) {
      showToast("error", `❌ Xóa thất bại: ${e?.message || "Có lỗi xảy ra."}`);
    } finally {
      setDeleting(false);
    }
  };

  // ===== MỞ EDIT =====
  const handleOpenEdit = () => {
    setOpen(false);

    // nếu đã có dữ liệu albumObj thì dùng luôn, không cần fetch
    if (albumObj) {
      setEditAlbum(albumObj);
      setOpenEdit(true);
      return;
    }

    // fallback: tải chi tiết theo album_id (đúng tham số service)
    albumService
      .getAlbumDetail({ album_id: albumId })
      .then((detail) => {
        if (detail) {
          setEditAlbum(detail);
          setOpenEdit(true);
        } else {
          showToast("error", "Không thể tải chi tiết album.");
        }
      })
      .catch(() => showToast("error", "Không thể tải chi tiết album."));
  };

  // ===== LƯU EDIT =====
  const handleSaveEdit = async ({ album_id, album_name, description, thumbnailFile }) => {
    try {
      const res = await albumService.update({
        album_id,
        album_name,
        description,
        thumbnail: thumbnailFile,
      });
      if (isUpdateSuccess(res)) {
        showToast("success", "✅ Cập nhật album thành công.");
        onEdit?.({
          ...albumObj,
          album_id,
          album_name,
          description,
          url_thumbnail: thumbnailFile
            ? URL.createObjectURL(thumbnailFile)
            : albumObj?.url_thumbnail,
        });
        return { status: "ok", message: "Cập nhật album thành công." };
      }
      return { status: "error", message: res?.message || "Cập nhật thất bại." };
    } catch (e) {
      return { status: "error", message: e?.message || "Lỗi khi cập nhật." };
    }
  };

  return (
    <>
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
              onClick={handleOpenEdit}
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
      </div>

      {/* Toast nhỏ gọn */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 px-4 py-2 rounded-lg shadow-lg text-sm
          ${toast.type === "success" ? "bg-green-600 text-white" : ""}
          ${toast.type === "error" ? "bg-red-600 text-white" : ""}`}
        >
          {toast.text}
        </div>
      )}

      {/* Confirm delete */}
      <ConfirmModal
        open={showConfirm}
        message="Bạn có chắc muốn xóa album này? Hành động này không thể hoàn tác."
        onClose={() => setShowConfirm(false)}
        onConfirm={handleDelete}
      />

      {/* Modal Edit Album */}
      <ModalEditAlbum
        open={openEdit}
        onClose={() => setOpenEdit(false)}
        album={editAlbum}
        onSave={handleSaveEdit}
      />
    </>
  );
}
