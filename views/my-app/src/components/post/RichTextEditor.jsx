// src/components/rte/RichTextEditor.jsx
import React, { useEffect, useRef } from "react";

/**
 * props:
 *  - value: HTML string ban đầu
 *  - onChange(html): callback mỗi khi nội dung đổi
 */
export default function RichTextEditor({ value = "", onChange }) {
  const editorRef = useRef(null);     // div#editor
  const quillRef = useRef(null);      // instance Quill

  useEffect(() => {
    // Đảm bảo CDN đã tải (window.Quill tồn tại)
    if (!window.Quill || !editorRef.current) return;

    // Khởi tạo Quill
    quillRef.current = new window.Quill(editorRef.current, {
      theme: "snow",
      placeholder: "Nhập nội dung bài viết...",
      modules: {
        toolbar: [
          [{ header: [1, 2, 3, false] }],
          ["bold", "italic", "underline", "strike"],
          ["blockquote", "code-block"],
          [{ list: "ordered" }, { list: "bullet" }],
          [{ script: "sub" }, { script: "super" }],
          [{ align: [] }],
          ["link", "image"],
          ["clean"],
        ],
      },
    });

    // Set nội dung ban đầu (nếu có)
    if (value) {
      quillRef.current.root.innerHTML = value;
    }

    // Lắng nghe thay đổi để trả HTML ra ngoài
    const quill = quillRef.current;
    const handler = () => {
      const html = quill.root.innerHTML;
      onChange && onChange(html);
    };
    quill.on("text-change", handler);

    return () => {
      quill.off("text-change", handler);
      quillRef.current = null;
    };
  }, []);

  // Đồng bộ ngược khi prop `value` thay đổi từ cha
  useEffect(() => {
    if (!quillRef.current) return;
    const current = quillRef.current.root.innerHTML || "";
    const incoming = value || "";
    if (incoming !== current) {
      quillRef.current.root.innerHTML = incoming;
    }
  }, [value]);

  return (
    <div
      ref={editorRef}
      style={{
        minHeight: 320,
        background: "#fff",
        borderRadius: 8,
      }}
    />
  );
}
