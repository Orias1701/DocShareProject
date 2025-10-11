import React, { useState, useRef, useEffect } from "react";
import postService from "../../services/postService";
import post_reportService from "../../services/post_reportServices";
import authApi from "../../services/usersServices";
import ConfirmModal from "../common/ConfirmModal";
import ModalEditPost from "../user_manager/modals/ModalEditPost"; // ⬅️ modal edit
import { albumService } from "../../services/albumService";
import { categoryServices } from "../../services/categoryServices";

export default function PostOptionsMenu({
  postId,
  ownerId,
  postRaw,                 // ⬅️ truyền raw post từ PostCard
  onDeleted,
  onEdited,                // ⬅️ callback update UI sau khi edit
}) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState(null);
  const [isReported, setIsReported] = useState(false);
  const [canDelete, setCanDelete] = useState(false);
  const [checking, setChecking] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const ref = useRef(null);

  // ==== EDIT modal state ====
  const [openEdit, setOpenEdit] = useState(false);
  const [albums, setAlbums] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loadingMeta, setLoadingMeta] = useState(false);

  // ===== Helpers =====
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

  // ===== Close menu on outside click =====
  useEffect(() => {
    const onDocClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  // ===== Check delete permission =====
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
    return () => { mounted = false; };
  }, [postId, ownerId]);

  // ===== DOWNLOAD =====
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
      if (msg.includes("401")) {
        showMessage("warning", "⚠️ Bạn cần đăng nhập để tải tài liệu.");
      } else if (msg.includes("403")) {
        showMessage("error", "🚫 Bạn không có quyền tải tài liệu này.");
      } else if (msg.includes("404")) {
        showMessage("error", "❌ File không tồn tại hoặc đã bị xoá.");
      } else if (msg.toLowerCase().includes("failed to fetch")) {
        showMessage("error", "⚠️ Lỗi mạng hoặc CORS, không thể tải.");
      } else {
        showMessage("error", `❌ Tải thất bại: ${msg || "Có lỗi xảy ra."}`);
      }
    }
  };

  // ===== REPORT =====
  const handleReport = async () => {
    if (!postId) {
      showMessage("error", "❌ Không có postId để report!");
      return;
    }
    try {
      const res = await post_reportService.toggle(postId, "Nội dung không phù hợp");
      if (res?.status === "success") {
        if (res.data?.action === "created") {
          setIsReported(true);
          showMessage("success", "✅ Report thành công.");
        } else if (res.data?.action === "deleted") {
          setIsReported(false);
          showMessage("warning", "🗑️ Bạn đã gỡ report.");
        } else {
          showMessage("success", "✅ Report xử lý xong.");
        }
      } else {
        showMessage("error", `❌ Lỗi report: ${res?.error || "Không rõ"}`);
      }
    } catch (err) {
      const msg = err?.message || "Có lỗi xảy ra.";
      if (msg.includes("401")) {
        showMessage("warning", "⚠️ Bạn cần đăng nhập để report.");
      } else {
        showMessage("error", `❌ Report thất bại: ${msg}`);
      }
    }
  };

  // ===== DELETE =====
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
        if (typeof onDeleted === "function") onDeleted(postId);
        return;
      }
      const errMsg =
        res?.message || res?.error || res?.data?.message || res?.data?.error || "Không rõ lỗi";
      showMessage("error", `❌ Xoá thất bại: ${errMsg}`);
    } catch (err) {
      const msg = err?.message || "";
      if (msg.includes("401")) {
        showMessage("warning", "⚠️ Bạn cần đăng nhập để xoá bài viết.");
      } else if (msg.includes("403")) {
        showMessage("error", "🚫 Bạn không có quyền xoá bài viết này.");
      } else if (msg.includes("404")) {
        showMessage("error", "❌ Bài viết không tồn tại hoặc đã bị xoá.");
      } else if (/^405|method not allowed/i.test(msg)) {
        showMessage("error", "❌ BE yêu cầu phương thức đúng (thử POST).");
      } else {
        showMessage("error", `❌ Xoá thất bại: ${msg || "Có lỗi xảy ra."}`);
      }
    } finally {
      setDeleting(false);
    }
  };

  // ===== EDIT =====
  const openEditModal = async () => {
    setOpen(false);
    setLoadingMeta(true);
    try {
      // Tải albums của tôi + toàn bộ categories để chọn
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
      setOpenEdit(true);
    } finally {
      setLoadingMeta(false);
    }
  };

  const handleSaveEdit = async (payload) => {
    // ✅ ràng buộc: album đích phải thuộc user hiện tại
    if (payload.album_id_new) {
      const okAlbum = albums.some((a) => String(a.album_id) === String(payload.album_id_new));
      if (!okAlbum) {
        return { status: "error", message: "Album đích không thuộc bạn." };
      }
    }

    try {
      const res = await postService.update(payload);
      if (res?.status === "ok" || res?.status === "success") {
        // Tạo object updated để cập nhật UI ngay
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
        className="text-gray-400 hover:text-white"
        aria-label="more options"
        onClick={() => setOpen((v) => !v)}
        disabled={checking && !open}
      >
        <i className="fa-solid fa-ellipsis-vertical"></i>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-[#1C2028] border border-gray-700 rounded-lg shadow-lg z-50 overflow-hidden">
          {/* Edit */}
          <button
            onClick={openEditModal}
            className="flex items-center gap-2 w-full px-3 py-2 text-left text-sm text-gray-300 hover:bg-gray-700/40"
            disabled={loadingMeta}
          >
            <i className="fa-solid fa-pen-to-square text-blue-400"></i>
            {loadingMeta ? "Đang tải…" : "Sửa bài viết"}
          </button>

          {/* Report */}
          <button
            onClick={() => {
              setOpen(false);
              handleReport();
            }}
            className={`flex items-center gap-2 w-full px-3 py-2 text-left text-sm hover:bg-gray-700/40 
              ${isReported ? "text-yellow-300" : "text-gray-300"}`}
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
            className={`flex items-center gap-2 w-full px-3 py-2 text-left text-sm text-gray-300 hover:bg-gray-700/40 ${downloadTailClass}`}
          >
            <i className="fa-solid fa-download text-blue-400"></i>
            Tải tài liệu
          </button>

          {/* Delete (chỉ hiện nếu có quyền) */}
          {canDelete && (
            <button
              onClick={confirmDelete}
              className="flex items-center gap-2 w-full px-3 py-2 text-left text-sm text-red-400 hover:bg-gray-700/40 rounded-b-lg"
            >
              <i className="fa-solid fa-trash-can text-red-500"></i>
              Xóa bài viết
            </button>
          )}
        </div>
      )}

      {/* Toast */}
      {message && (
        <div
          className={`fixed bottom-6 right-6 px-4 py-2 rounded-lg shadow-lg text-sm transition
            ${message.type === "success" ? "bg-green-600 text-white" : ""}
            ${message.type === "error" ? "bg-red-600 text-white" : ""}
            ${message.type === "warning" ? "bg-yellow-500 text-black" : ""}
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

      {/* Modal Edit Post */}
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
        isAdmin={false}          // nếu có role admin, pass true ở đây
        onSave={handleSaveEdit}
      />
    </div>
  );
}
