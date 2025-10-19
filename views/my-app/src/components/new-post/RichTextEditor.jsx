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

    if (value && value !== "<p><br></p>") setHtmlSafely(quill, value);
    htmlRef.current = quill.root.innerHTML;

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
      try { quill.off("text-change", handleChange); } catch {}
      quillRef.current = null;
      if (mountRef.current) mountRef.current.innerHTML = "";
    };
  }, []);

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
        .rte .ql-toolbar { background: var(--color-surface); border-bottom: 1px solid var(--color-header-border); }
        .rte .ql-snow .ql-stroke { stroke: var(--color-text-secondary); }
        .rte .ql-snow .ql-fill, .rte .ql-snow .ql-picker-label, .rte .ql-snow .ql-picker-item { color: var(--color-text-secondary); fill: var(--color-text-secondary); }
        .rte .ql-toolbar button:hover .ql-stroke, .rte .ql-toolbar button.ql-active .ql-stroke { stroke: var(--color-accent); }
        .rte .ql-toolbar button:hover .ql-fill, .rte .ql-toolbar button.ql-active .ql-fill { fill: var(--color-accent); }
        .rte .ql-snow .ql-picker-options { background: var(--color-muted-bg); border-color: var(--color-header-border); }
        .rte .ql-snow .ql-picker-item:hover, .rte .ql-snow .ql-picker-item.ql-selected { color: var(--color-link); }

        .rte .ql-container { background: var(--color-surface-alt); border-radius: 0 0 0.75rem 0.75rem; }
        .rte .ql-editor { min-height: 340px; color: var(--color-text); font-size: 0.95rem; line-height: 1.7; }
        .rte .ql-editor::placeholder { color: var(--color-text-muted); }
        .rte .ql-editor a { color: var(--color-link); text-decoration: underline; }
        .rte .ql-editor ::selection { background: var(--color-focus-ring); }

        .rte .ql-editor pre, .rte .ql-editor code {
          background: rgba(255,255,255,0.08);
          border-radius: 8px;
          color: var(--color-text);
        }

        .rte .ql-tooltip {
          background: var(--color-bg); border:1px solid var(--color-header-border); color: var(--color-text-secondary);
          box-shadow: var(--shadow-soft);
        }
        .rte .ql-tooltip input {
          background: var(--color-bg); color: var(--color-text); border-color: var(--color-border-soft);
        }
      `}</style>

      <div className="rte" ref={mountRef} />
    </div>
  );
}
