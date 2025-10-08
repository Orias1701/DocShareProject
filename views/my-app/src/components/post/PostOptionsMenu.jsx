import React, { useState, useRef, useEffect } from "react";
import postService from "../../services/postService";
import post_reportService from "../../services/post_reportServices";
import authApi from "../../services/usersServices";
import ConfirmModal from "../common/ConfirmModal"; // ✅ import modal xác nhận

export default function PostOptionsMenu({ postId, ownerId, onDeleted }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState(null);
  const [isReported, setIsReported] = useState(false);
  const [canDelete, setCanDelete] = useState(false);
  const [checking, setChecking] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const ref = useRef(null);

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

  // Bỏ dấu để so khớp “xóa/xoá” và các biến thể
  const noAccent = (s) =>
    String(s || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();

  // ✅ Gom tất cả trường hợp thành công có thể có từ BE
  const isDeleteSuccess = (res) => {
    if (!res || typeof res !== "object") return false;

    // 1) Các cờ rõ ràng
    if (res.success === true) return true;
    if (res.deleted === true || res.deleted === 1) return true;
    if (res.ok === true) return true;
    if (res.affected_rows > 0 || res.affected === 1) return true;

    // 2) Status phổ biến
    const status = String(res.status || res.data?.status || "").toLowerCase();
    if (["ok", "success", "deleted"].includes(status)) return true;

    // 3) Action phổ biến
    const action = String(res.action || res.data?.action || "").toLowerCase();
    if (["deleted", "remove", "removed"].includes(action)) return true;

    // 4) Message chứa cụm thành công (không phân biệt dấu)
    const msgRaw = res.message || res.data?.message || "";
    const msg = noAccent(msgRaw);
    if (
      /da xoa|xoa thanh cong|deleted|remove success/.test(msg)
    ) {
      return true;
    }

    // 5) Một số BE trả { code: 200 }
    if (Number(res.code) === 200) return true;

    return false;
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

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleDownload = async () => {
    if (!postId) {
      showMessage("error", "❌ Không có postId để tải!");
      return;
    }
    try {
      await postService.download(postId);
      showMessage("success", "✅ Tải tài liệu thành công.");
    } catch (err) {
      console.error("❌ Tải thất bại:", err);
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
      console.error("❌ Report thất bại:", err);
      const msg = err?.message || "Có lỗi xảy ra.";
      if (msg.includes("401")) {
        showMessage("warning", "⚠️ Bạn cần đăng nhập để report.");
      } else {
        showMessage("error", `❌ Report thất bại: ${msg}`);
      }
    }
  };

  // ===== Modal toggle =====
  const confirmDelete = () => {
    setOpen(false);
    setShowConfirm(true);
  };

  // ===== Do delete after confirm =====
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

      // Log để bạn kiểm tra thực tế (có thể giữ lại lúc debug)
      console.debug("[Delete response]", res);

      if (isDeleteSuccess(res)) {
        setShowConfirm(false);
        showMessage("success", "🗑️ Xoá bài viết thành công.");
        if (typeof onDeleted === "function") onDeleted(postId); // cập nhật UI ngay
        return;
      }

      // Không match → show thông điệp chi tiết nhất có thể
      const errMsg =
        res?.message ||
        res?.error ||
        res?.data?.message ||
        res?.data?.error ||
        "Không rõ lỗi";
      showMessage("error", `❌ Xoá thất bại: ${errMsg}`);
    } catch (err) {
      console.error("❌ Lỗi xoá:", err);
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
        <div className="absolute right-0 mt-2 w-44 bg-[#1C2028] border border-gray-700 rounded-lg shadow-lg z-50">
          {/* Report */}
          <button
            onClick={() => {
              setOpen(false);
              handleReport();
            }}
            className={`flex items-center gap-2 w-full px-3 py-2 text-left text-sm hover:bg-gray-700/40 
              ${isReported ? "text-yellow-300" : "text-gray-300"} 
              rounded-t-lg`}
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

      {/* Modal xác nhận xoá */}
      <ConfirmModal
        open={showConfirm}
        message="Bạn có chắc muốn xoá bài viết này? Hành động này không thể hoàn tác."
        onClose={() => setShowConfirm(false)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
