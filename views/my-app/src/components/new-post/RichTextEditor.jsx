// src/components/new-post/RichTextEditor.jsx
import React, { useEffect, useRef } from "react";

export default function RichTextEditor({ value = "", onChange }) {
  const wrapperRef = useRef(null);
  const editorRef  = useRef(null);
  const quillRef   = useRef(null);

  const setHtmlSafely = (quill, html) => {
    const safeHtml = String(html || "");
    const delta = quill.clipboard.convert(safeHtml);
    quill.setContents(delta, "silent");
  };

  useEffect(() => {
    if (typeof window === "undefined" || !window.Quill) {
      console.warn("[RTE] window.Quill chưa sẵn sàng");
      return;
    }
    if (!wrapperRef.current || !editorRef.current) return;

    // tránh init trùng trong StrictMode/HMR
    if (quillRef.current || wrapperRef.current.dataset.initialized === "true") {
      console.log("[RTE] Bỏ qua init do đã có instance");
      return;
    }

    editorRef.current.innerHTML = "";

    const quill = new window.Quill(editorRef.current, {
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

    quillRef.current = quill;
    wrapperRef.current.dataset.initialized = "true";

    if (value && value !== "<p><br></p>") {
      setHtmlSafely(quill, value);
    }

    // Emit ngay lần đầu
    const html0 = quill.root.innerHTML;
    console.log("[RTE] emit initial html:", html0);
    onChange?.(html0);

    const handleChange = () => {
      const html = quill.root.innerHTML;
      const text = quill.getText(); // text thuần (dùng debug)
      console.log("[RTE] text-change htmlLen=", html.length, " textLen=", text.trim().length);
      onChange?.(html);
    };

    quill.on("text-change", handleChange);

    return () => {
      quill.off("text-change", handleChange);
      quillRef.current = null;
      if (editorRef.current) editorRef.current.innerHTML = "";
      if (wrapperRef.current) delete wrapperRef.current.dataset.initialized;
    };
  }, []);

  // Đồng bộ từ prop value -> editor (khi cha set lại)
  useEffect(() => {
    const quill = quillRef.current;
    if (!quill) return;
    const current = quill.root.innerHTML || "";
    const incoming = String(value || "");
    if (incoming !== current) {
      console.log("[RTE] sync from prop value. incomingLen=", incoming.length);
      setHtmlSafely(quill, incoming);
    }
  }, [value]);

  return (
    <div
      ref={wrapperRef}
      className="rounded-xl overflow-hidden border border-white/10 bg-white"
    >
      <div
        ref={editorRef}
        className="ql-container ql-snow"
        style={{ minHeight: 320 }}
      />
    </div>
  );
}
