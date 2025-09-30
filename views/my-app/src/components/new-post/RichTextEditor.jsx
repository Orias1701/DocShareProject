// src/components/new-post/RichTextEditor.jsx
import React, { useEffect, useRef } from "react";

export default function RichTextEditor({ value = "", onChange }) {
  const mountRef = useRef(null);
  const quillRef = useRef(null);
  const htmlRef = useRef("");

  const setHtmlSafely = (quill, html) => {
    const safeHtml = String(html || "");
    const delta = quill.clipboard.convert(safeHtml);
    quill.setContents(delta, "silent");
  };

  useEffect(() => {
    if (typeof window === "undefined" || !window.Quill) return;
    if (!mountRef.current) return;

    // Làm sạch trước khi init
    mountRef.current.innerHTML = "";
    const editorEl = document.createElement("div");
    mountRef.current.appendChild(editorEl);

    const quill = new window.Quill(editorEl, {
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

    // Set initial content
    if (value && value !== "<p><br></p>") setHtmlSafely(quill, value);
    htmlRef.current = quill.root.innerHTML;

    // Đảm bảo luôn có selection khi click toolbar
    const toolbarEl = mountRef.current.querySelector(".ql-toolbar");
    if (toolbarEl) {
      toolbarEl.addEventListener(
        "mousedown",
        () => {
          quill.focus();
          if (!quill.getSelection()) {
            const len = quill.getLength();
            quill.setSelection(len, 0, "silent");
          }
        },
        true
      );
    }

    // Sync onChange
    const handleChange = () => {
      const html = quill.root.innerHTML;
      if (html !== htmlRef.current) {
        htmlRef.current = html;
        onChange?.(html);
      }
    };
    quill.on("text-change", handleChange);

    return () => {
      try {
        quill.off("text-change", handleChange);
      } catch {}
      quillRef.current = null;
      if (mountRef.current) mountRef.current.innerHTML = "";
    };
  }, []); // init once

  // Đồng bộ value từ ngoài vào
  useEffect(() => {
    const quill = quillRef.current;
    if (!quill) return;
    const incoming = String(value || "");
    const current = quill.root.innerHTML || "";
    if (incoming !== current) {
      setHtmlSafely(quill, incoming);
      htmlRef.current = incoming;
    }
  }, [value]);

  return (
    <div className="rounded-xl overflow-hidden">
      <style>{`
        .rte .ql-toolbar.ql-snow,
        .rte .ql-container.ql-snow { border: none !important; }
        .rte .ql-toolbar { background: #f8fafc; }
        .rte .ql-container { background: #ffffff; }
        .rte .ql-editor { min-height: 320px; color: #0f172a; }
        .rte .ql-editor:focus { outline: none; }
        .rte .ql-toolbar + .ql-container { border-top: none !important; }
      `}</style>
      <div className="rte" ref={mountRef} />
    </div>
  );
}
