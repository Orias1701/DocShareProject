import React, { useState, useRef, useEffect } from "react";
import postService from "../../services/postService";
import post_reportService from "../../services/post_reportServices";

export default function PostOptionsMenu({ postId }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState(null);
  const [isReported, setIsReported] = useState(false); // 👈 lưu trạng thái report
  const ref = useRef(null);

  useEffect(() => {
    const onDocClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

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
      if (res.status === "success") {
        if (res.data?.action === "created") {
          setIsReported(true); // ✅ đã report
          showMessage("success", "✅ Report thành công.");
        } else if (res.data?.action === "deleted") {
          setIsReported(false); // ✅ gỡ report
          showMessage("warning", "🗑️ Bạn đã gỡ report.");
        } else {
          showMessage("success", "✅ Report xử lý xong.");
        }
      } else {
        showMessage("error", `❌ Lỗi report: ${res.error || "Không rõ"}`);
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

  return (
    <div className="relative" ref={ref}>
      <button
        className="text-gray-400 hover:text-white"
        aria-label="more options"
        onClick={() => setOpen((v) => !v)}
      >
        <i className="fa-solid fa-ellipsis-vertical"></i>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-44 bg-[#1C2028] border border-gray-700 rounded-lg shadow-lg z-50">
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

          <button
            onClick={async () => {
              setOpen(false);
              await handleDownload();
            }}
            className="flex items-center gap-2 w-full px-3 py-2 text-left text-sm text-gray-300 hover:bg-gray-700/40 rounded-b-lg"
          >
            <i className="fa-solid fa-download text-blue-400"></i>
            Tải tài liệu
          </button>
        </div>
      )}

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
    </div>
  );
}
