// Menu 3 chấm của Post: Sửa, Xoá (chủ bài), Report/Unreport, Tải
import React, { useState, useRef, useEffect } from "react";
import postService from "../../services/postService";
import post_reportService from "../../services/post_reportServices";
import authApi from "../../services/usersServices";
import ConfirmModal from "../common/ConfirmModal";
import ModalEditPost from "../user_manager/modals/ModalEditPost";
import { albumService } from "../../services/albumService";
import { categoryServices } from "../../services/categoryServices";

export default function PostOptionsMenu({
  postId,
  ownerId,
  postRaw,                // raw data để fill modal
  onDeleted,              // (postId) => void
  onEdited,               // (updated) => void
  initialIsReported,      // cờ report ban đầu
  onReportChange,         // (postId, nextIsReported) => void
}) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState(null);
  const [isReported, setIsReported] = useState(Boolean(initialIsReported));
  const [canDelete, setCanDelete] = useState(false);
  const [checking, setChecking] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const ref = useRef(null);

  // Modal Edit
  const [openEdit, setOpenEdit] = useState(false);
  const [albums, setAlbums] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loadingMeta, setLoadingMeta] = useState(false);

  // Helpers
  const pickMeUserId = (meRes) =>
    meRes?.user?.user_id ??
    meRes?.user_id ??
    meRes?.data?.user?.user_id ??
    meRes?.data?.user_id ??
    null;

  const pickPostOwnerId = (postRes) =>
    postRes?.user_id ??
    postRes?.data?.user_id ??
    postRes?.post?.user_id ??
    postRes?.data?.post?.user_id ??
    null;

  const noAccent = (s) =>
    String(s || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();

  const isDeleteSuccess = (res) => {
    if (!res || typeof res !== "object") return false;
    if (res.success === true) return true;
    if (res.deleted === true || res.deleted === 1) return true;
    if (res.ok === true) return true;
    if (res.affected_rows > 0 || res.affected === 1) return true;
    const status = String(res.status || res.data?.status || "").toLowerCase();
    if (["ok", "success", "deleted"].includes(status)) return true;
    const action = String(res.action || res.data?.action || "").toLowerCase();
    if (["deleted", "remove", "removed"].includes(action)) return true;
    const msg = noAccent(res.message || res.data?.message || "");
    if (/da xoa|xoa thanh cong|deleted|remove success/.test(msg)) return true;
    if (Number(res.code) === 200) return true;
    return false;
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  // Đóng menu khi click ra ngoài
  useEffect(() => {
    const onDocClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  // Sync state report khi điều hướng
  useEffect(() => {
    setIsReported(Boolean(initialIsReported));
  }, [postId, initialIsReported]);

  // Kiểm tra quyền chủ bài
  useEffect(() => {
    let mounted = true;
    async function run() {
      if (!postId) {
        mounted && setCanDelete(false);
        mounted && setChecking(false);
        return;
      }
      setChecking(true);
      try {
        const meRes = await authApi.me().catch(() => null);
        const meId = pickMeUserId(meRes);
        let owner = ownerId ?? null;
        if (owner == null) {
          const postRes = await postService.getByIdCompact(postId).catch(() => null);
          owner = pickPostOwnerId(postRes);
        }
        const ok = !!meId && !!owner && String(meId) === String(owner);
        if (mounted) setCanDelete(ok);
      } catch {
        if (mounted) setCanDelete(false);
      } finally {
        if (mounted) setChecking(false);
      }
    }
    run();
    return () => {
      mounted = false;
    };
  }, [postId, ownerId]);

  // Download
  const handleDownload = async () => {
    if (!postId) {
      showMessage("error", "❌ Không có postId để tải!");
      return;
    }
    try {
      await postService.download(postId);
      showMessage("success", "✅ Tải tài liệu thành công.");
    } catch (err) {
      const msg = err?.message || "";
      if (msg.includes("401")) showMessage("warning", "⚠️ Cần đăng nhập để tải.");
      else if (msg.includes("403")) showMessage("error", "🚫 Không có quyền tải.");
      else if (msg.includes("404")) showMessage("error", "❌ File không tồn tại.");
      else if (msg.toLowerCase().includes("failed to fetch"))
        showMessage("error", "⚠️ Lỗi mạng/CORS, không thể tải.");
      else showMessage("error", `❌ Tải thất bại: ${msg || "Có lỗi xảy ra."}`);
    }
  };

  // Report / Unreport
  const handleReport = async () => {
    if (!postId) {
      showMessage("error", "❌ Không có postId để report!");
      return;
    }
    try {
      const res = await post_reportService.toggle(postId, "Nội dung không phù hợp");
      if (res?.status === "success") {
        let next;
        if (res.data?.action === "created") {
          next = true;
          showMessage("success", "✅ Report thành công.");
        } else if (res.data?.action === "deleted") {
          next = false;
          showMessage("warning", "🗑️ Bạn đã gỡ report.");
        } else {
          next = !isReported;
          showMessage("success", "✅ Report xử lý xong.");
        }
        setIsReported(Boolean(next));
        onReportChange?.(postId, Boolean(next));
      } else {
        showMessage("error", `❌ Lỗi report: ${res?.error || "Không rõ"}`);
      }
    } catch (err) {
      const msg = err?.message || "Có lỗi xảy ra.";
      if (msg.includes("401")) showMessage("warning", "⚠️ Cần đăng nhập để report.");
      else showMessage("error", `❌ Report thất bại: ${msg}`);
    }
  };

  // Xoá
  const confirmDelete = () => {
    setOpen(false);
    setShowConfirm(true);
  };

  const handleDelete = async () => {
    if (!postId || deleting) return;
    setDeleting(true);
    try {
      let res;
      try {
        res = await postService.removeViaPost(postId);
      } catch {
        res = await postService.remove(postId);
      }
      if (isDeleteSuccess(res)) {
        setShowConfirm(false);
        showMessage("success", "🗑️ Xoá bài viết thành công.");
        onDeleted?.(postId);
        return;
      }
      const errMsg =
        res?.message || res?.error || res?.data?.message || res?.data?.error || "Không rõ lỗi";
      showMessage("error", `❌ Xoá thất bại: ${errMsg}`);
    } catch (err) {
      const msg = err?.message || "";
      if (msg.includes("401")) showMessage("warning", "⚠️ Cần đăng nhập để xoá.");
      else if (msg.includes("403")) showMessage("error", "🚫 Không có quyền xoá.");
      else if (msg.includes("404")) showMessage("error", "❌ Bài viết không tồn tại.");
      else if (/^405|method not allowed/i.test(msg))
        showMessage("error", "❌ BE yêu cầu phương thức đúng (thử POST).");
      else showMessage("error", `❌ Xoá thất bại: ${msg || "Có lỗi xảy ra."}`);
    } finally {
      setDeleting(false);
    }
  };

  // Edit — mở modal
  const openEditModal = async () => {
    if (!canDelete) {
      showMessage("error", "🚫 Bạn không có quyền sửa bài này.");
      setOpen(false);
      return;
    }
    setOpen(false);
    setLoadingMeta(true);
    try {
      const [myAlbums, cats] = await Promise.all([
        albumService.listMyAlbums().catch(() => []),
        categoryServices.list().catch(() => ({ data: [] })),
      ]);

      setAlbums(
        (myAlbums || []).map((a) => ({
          album_id: a.album_id ?? a.id,
          album_name: a.album_name ?? a.name,
        }))
      );

      const catArr = Array.isArray(cats?.data) ? cats.data : Array.isArray(cats) ? cats : [];
      setCategories(
        catArr.map((c) => ({
          category_id: c.category_id ?? c.id,
          category_name: c.category_name ?? c.name,
        }))
      );

      if ((myAlbums?.length ?? 0) === 0 && (catArr?.length ?? 0) === 0) {
        showMessage("warning", "⚠️ Chưa có Album/Danh mục. Hãy tạo/chọn trước khi sửa.");
        return;
      }

      setOpenEdit(true);
    } finally {
      setLoadingMeta(false);
    }
  };

  // Edit — lưu
  const handleSaveEdit = async (payload) => {
    const maxTitleLen = 120;
    const title = String(payload?.title ?? "").trim();
    if (!title) {
      showMessage("error", "❌ Thiếu tiêu đề.");
      return { status: "error", message: "Vui lòng nhập tiêu đề." };
    }
    if (title.length > maxTitleLen) {
      showMessage("error", `❌ Tiêu đề quá dài (tối đa ${maxTitleLen} ký tự).`);
      return { status: "error", message: `Tiêu đề quá dài (tối đa ${maxTitleLen} ký tự).` };
    }

    const banner = String(payload?.banner_url ?? "").trim();
    if (banner) {
      try {
        new URL(banner);
      } catch {
        showMessage("error", "❌ URL banner không hợp lệ.");
        return { status: "error", message: "URL banner không hợp lệ." };
      }
    }

    const albumIdNew = payload.album_id_new ?? postRaw?.album_id;
    const categoryIdNew = payload.category_id_new ?? postRaw?.category_id;
    if (!albumIdNew) return { status: "error", message: "Hãy chọn Album." };
    if (!categoryIdNew) return { status: "error", message: "Hãy chọn Danh mục." };

    if (payload.album_id_new) {
      const okAlbum = albums.some((a) => String(a.album_id) === String(payload.album_id_new));
      if (!okAlbum) return { status: "error", message: "Album đích không thuộc bạn." };
    }

    try {
      const res = await postService.update(payload);
      if (res?.status === "ok" || res?.status === "success") {
        const newAlbumId = payload.album_id_new ?? postRaw?.album_id;
        const newAlbumName = payload.album_id_new
          ? (albums.find((a) => String(a.album_id) === String(payload.album_id_new))?.album_name ||
             postRaw?.album_name)
          : postRaw?.album_name;

        const newCategoryId = payload.category_id_new ?? postRaw?.category_id;
        const newCategoryName = payload.category_id_new
          ? (categories.find((c) => String(c.category_id) === String(payload.category_id_new))?.category_name ||
             postRaw?.category_name)
          : postRaw?.category_name;

        const updated = {
          post_id: payload.post_id,
          title: payload.title ?? postRaw?.title,
          banner_url: payload.banner_url || postRaw?.banner_url,
          album_id: newAlbumId,
          album_name: newAlbumName,
          category_id: newCategoryId,
          category_name: newCategoryName,
          created_at: postRaw?.created_at,
          user_id: ownerId,
        };

        onEdited?.(updated);
        showMessage("success", res?.message || "✅ Đã cập nhật bài viết.");
        return { status: "ok", message: res?.message || "Đã cập nhật bài viết." };
      }
      return { status: "error", message: res?.message || "Cập nhật thất bại." };
    } catch (e) {
      return { status: "error", message: e?.message || "Lỗi khi cập nhật." };
    } finally {
      setOpenEdit(false);
    }
  };

  const downloadTailClass = !canDelete ? "rounded-b-lg" : "";

  return (
    <div className="relative" ref={ref}>
      <button
        className="text-[var(--color-icon-default)] hover:text-[var(--color-icon-hover)]"
        aria-label="more options"
        onClick={() => setOpen((v) => !v)}
        disabled={checking && !open}
        type="button"
      >
        <i className="fa-solid fa-ellipsis-vertical"></i>
      </button>

      {open && (
        <div
          className="
            absolute right-0 mt-2 w-48
            bg-[var(--color-menu-bg)]
            border border-[var(--color-menu-border)]
            rounded-lg shadow-[var(--shadow-soft)] z-50 overflow-hidden
          "
        >
          {/* Edit (chỉ chủ bài) */}
          {canDelete && (
            <button
              onClick={openEditModal}
              className="flex items-center gap-2 w-full px-3 py-2 text-left text-sm text-[var(--color-text)] hover:bg-[var(--color-menu-hover)]"
              disabled={loadingMeta}
              type="button"
            >
              <i className="fa-solid fa-pen-to-square text-[var(--color-link)]"></i>
              {loadingMeta ? "Đang tải…" : "Sửa bài viết"}
            </button>
          )}

          {/* Report / Unreport */}
          <button
            onClick={() => {
              setOpen(false);
              handleReport();
            }}
            className={`flex items-center gap-2 w-full px-3 py-2 text-left text-sm hover:bg-[var(--color-menu-hover)] ${
              isReported ? "text-yellow-300" : "text-[var(--color-text)]"
            }`}
            type="button"
            title={isReported ? "Unreport" : "Report"}
          >
            <i className={`fa-regular fa-flag ${isReported ? "text-yellow-400" : "text-red-400"}`}></i>
            {isReported ? "Unreport" : "Report"}
          </button>

          {/* Download */}
          <button
            onClick={async () => {
              setOpen(false);
              await handleDownload();
            }}
            className={`flex items-center gap-2 w-full px-3 py-2 text-left text-sm text-[var(--color-text)] hover:bg-[var(--color-menu-hover)] ${downloadTailClass}`}
            type="button"
          >
            <i className="fa-solid fa-download text-[var(--color-link)]"></i>
            Tải tài liệu
          </button>

          {/* Delete (chủ bài) */}
          {canDelete && (
            <button
              onClick={confirmDelete}
              className="flex items-center gap-2 w-full px-3 py-2 text-left text-sm text-red-400 hover:bg-[var(--color-menu-hover)] rounded-b-lg"
              type="button"
            >
              <i className="fa-solid fa-trash-can text-red-500"></i>
              Xóa bài viết
            </button>
          )}
        </div>
      )}

      {/* Toast mini */}
      {message && (
        <div
          className={`fixed bottom-6 right-6 px-4 py-2 rounded-lg shadow-[var(--shadow-soft)] text-sm border border-[var(--color-modal-border)]
            ${message.type === "success" ? "bg-[var(--color-modal-bg)] text-[var(--color-text)]" : ""}
            ${message.type === "error" ? "bg-[var(--color-modal-bg)] text-[var(--color-text)]" : ""}
            ${message.type === "warning" ? "bg-[var(--color-modal-bg)] text-[var(--color-text)]" : ""}
          `}
        >
          {message.text}
        </div>
      )}

      {/* Confirm delete */}
      <ConfirmModal
        open={showConfirm}
        message="Bạn có chắc muốn xoá bài viết này? Hành động này không thể hoàn tác."
        onClose={() => setShowConfirm(false)}
        onConfirm={handleDelete}
      />

      {/* Modal Edit */}
      <ModalEditPost
        open={openEdit}
        onClose={() => setOpenEdit(false)}
        post={{
          post_id: postRaw?.post_id ?? postId,
          title: postRaw?.title,
          banner_url: postRaw?.banner_url ?? postRaw?.banner,
          album_id: postRaw?.album_id,
          album_name: postRaw?.album_name,
          category_id: postRaw?.category_id,
          category_name: postRaw?.category_name,
          author_id: postRaw?.user_id ?? ownerId,
          created_at: postRaw?.created_at,
        }}
        albums={albums}
        categories={categories}
        isAdmin={false}
        onSave={handleSaveEdit}
      />
    </div>
  );
}
