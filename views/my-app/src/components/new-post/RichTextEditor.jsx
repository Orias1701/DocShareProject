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

    // reset mount
    mountRef.current.innerHTML = "";
    const editorEl = document.createElement("div");
    mountRef.current.appendChild(editorEl);

    const quill = new window.Quill(editorEl, {
      theme: "snow",
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
      placeholder: "Nhập nội dung bài viết...",
    });
    quillRef.current = quill;

    // initial content
    if (value && value !== "<p><br></p>") setHtmlSafely(quill, value);
    htmlRef.current = quill.root.innerHTML;

    // keep focus when clicking toolbar
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

    const handleChange = () => {
      requestAnimationFrame(() => {
        const html = quill.root.innerHTML;
        if (html !== htmlRef.current) {
          htmlRef.current = html;
          onChange?.(html);
        }
      });
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

  // sync external value
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
        /* --- DARK THEME RICH TEXT EDITOR --- */
        .rte .ql-toolbar.ql-snow,
        .rte .ql-container.ql-snow { border: none !important; }

        /* Toolbar */
        .rte .ql-toolbar {
          background: #161b22;
          border-bottom: 1px solid #2d2d33;
        }

        /* Icons & buttons */
        .rte .ql-snow .ql-stroke { stroke: #cbd5e1; }
        .rte .ql-snow .ql-fill, .rte .ql-snow .ql-picker-label,
        .rte .ql-snow .ql-picker-item { color: #cbd5e1; fill: #cbd5e1; }

        .rte .ql-toolbar button:hover .ql-stroke,
        .rte .ql-toolbar button.ql-active .ql-stroke { stroke: #60a5fa; }
        .rte .ql-toolbar button:hover .ql-fill,
        .rte .ql-toolbar button.ql-active .ql-fill { fill: #60a5fa; }

        /* Dropdowns */
        .rte .ql-snow .ql-picker-options { background:#0f172a; border-color:#2d2d33; }
        .rte .ql-snow .ql-picker-item:hover,
        .rte .ql-snow .ql-picker-item.ql-selected { color:#93c5fd; }

        /* Editor background (lighter than page bg) */
        .rte .ql-container {
          background:#1e2533; /* sáng hơn #0D1117 để text nổi hơn */
          border-radius: 0 0 0.75rem 0.75rem;
        }

        /* Text */
        .rte .ql-editor {
          min-height: 340px;
          color:#f3f4f6;
          font-size: 0.95rem;
          line-height: 1.7;
        }
        .rte .ql-editor::placeholder { color:#9ca3af; }

        /* Links / selection */
        .rte .ql-editor a { color:#60a5fa; text-decoration: underline; }
        .rte .ql-editor ::selection { background:#2563eb55; }

        /* Code blocks */
        .rte .ql-editor pre, .rte .ql-editor code {
          background: rgba(255,255,255,0.08);
          border-radius: 8px;
          color: #f3f4f6;
        }

        /* Tooltip */
        .rte .ql-tooltip {
          background:#111827; border:1px solid #2d2d33; color:#e5e7eb;
          box-shadow: 0 10px 20px rgba(0,0,0,.35);
        }
        .rte .ql-tooltip input {
          background:#0D1117; color:#e5e7eb; border-color:#374151;
        }
      `}</style>

      <div className="rte" ref={mountRef} />
    </div>
  );
}
