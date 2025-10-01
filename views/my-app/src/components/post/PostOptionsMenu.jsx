// src/components/post/PostOptionsMenu.jsx
import React, { useState, useRef, useEffect } from "react";
import postService from "../../services/postService";

export default function PostOptionsMenu({ postId, onReport }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const onDocClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const handleDownload = async () => {
    if (!postId) {
      alert("❌ Không có postId để tải!");
      console.warn("[Download] Không có postId -> bỏ qua.");
      return;
    }

    try {
      await postService.download(postId);
      console.log(`✅ Tải thành công postId=${postId}`);
    } catch (err) {
      console.error("❌ Tải thất bại:", err);

      // phân loại nguyên nhân
      const msg = err?.message || "";
      if (msg.includes("401")) {
        console.log("Nguyên nhân: chưa đăng nhập (401).");
      } else if (msg.includes("403")) {
        console.log("Nguyên nhân: không có quyền tải (403).");
      } else if (msg.includes("404")) {
        console.log("Nguyên nhân: file không tồn tại (404).");
      } else if (msg.toLowerCase().includes("failed to fetch")) {
        console.log("Nguyên nhân: lỗi mạng hoặc CORS.");
      } else {
        console.log("Nguyên nhân khác:", msg);
      }

      alert(`❌ Tải thất bại: ${msg || "Có lỗi xảy ra."}`);
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
        <div className="absolute right-0 mt-2 w-40 bg-[#1C2028] border border-gray-700 rounded-lg shadow-lg z-50">
          <button
            onClick={() => {
              setOpen(false);
              onReport?.();
            }}
            className="flex items-center gap-2 w-full px-3 py-2 text-left text-sm text-gray-300 hover:bg-gray-700/40 rounded-t-lg"
          >
            <i className="fa-regular fa-flag text-red-400"></i>
            Report
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
    </div>
  );
}
