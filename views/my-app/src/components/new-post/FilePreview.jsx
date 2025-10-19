import React, { useState, useEffect, useMemo } from "react";

const FilePreview = ({ file, htmlContent, html, onDocxHtml }) => {
  const [previewUrl, setPreviewUrl] = useState(null);
  const [docxHtml, setDocxHtml] = useState(null);
  const [loadingDocx, setLoadingDocx] = useState(false);
  const [docxError, setDocxError] = useState(null);

  const effectiveHtml = htmlContent ?? html ?? docxHtml ?? null;

  const renderKey = useMemo(() => {
    if (!effectiveHtml) return "nohtml";
    const len = effectiveHtml.length;
    const head = effectiveHtml.charCodeAt(0) || 0;
    const tail = effectiveHtml.charCodeAt(len - 1) || 0;
    return `html-${len}-${head}-${tail}`;
  }, [effectiveHtml]);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    if (file.type?.startsWith?.("image/") || file.type === "application/pdf") {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      return () => {
        URL.revokeObjectURL(url);
        setPreviewUrl(null);
      };
    }
    setPreviewUrl(null);
  }, [file]);

  useEffect(() => {
    let cancelled = false;
    setDocxHtml(null);
    setDocxError(null);
    if (!file) return;

    const isDocx =
      file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      (file.name && file.name.toLowerCase().endsWith(".docx"));

    if (!isDocx) return;

    setLoadingDocx(true);
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const arrayBuffer = e.target.result;
        const mammoth =
          (await import("mammoth/mammoth.browser.min")).default ??
          (await import("mammoth")).default;
        const result = await mammoth.convertToHtml({ arrayBuffer });
        if (cancelled) return;
        const htmlStr = result?.value ?? "";
        setDocxHtml(htmlStr);
        onDocxHtml?.(htmlStr);
      } catch (err) {
        console.error("[FilePreview] mammoth convert error:", err);
        setDocxError("Không thể convert .docx (hãy kiểm tra mammoth đã được cài?).");
      } finally {
        setLoadingDocx(false);
      }
    };
    reader.onerror = (err) => {
      console.error("[FilePreview] file read error", err);
      setDocxError("Lỗi đọc file .docx");
      setLoadingDocx(false);
    };
    reader.readAsArrayBuffer(file);

    return () => {
      cancelled = true;
    };
  }, [file, onDocxHtml]);

  useEffect(() => {
    if (htmlContent ?? html) {
      if (docxHtml) setDocxHtml(null);
      if (docxError) setDocxError(null);
    }
  }, [htmlContent, html]); // đơn giản hoá: không cần eslint-disable

  const renderPreview = () => {
    if (effectiveHtml) {
      return (
        <>
          <style>{`
            .preview-html { line-height: 1.7; font-size: 0.95rem; }
            .preview-html h1, .preview-html h2, .preview-html h3 { margin: 0.6em 0 0.4em; font-weight: 700; }
            .preview-html h1 { font-size: 1.6rem; }
            .preview-html h2 { font-size: 1.35rem; }
            .preview-html h3 { font-size: 1.15rem; }
            .preview-html p { margin: 0.5em 0; }
            .preview-html a { text-decoration: underline; }
            .preview-html img { max-width: 100%; height: auto; border-radius: 0.25rem; }

            .preview-html ul, .preview-html ol { margin: 0.5em 0 0.5em 1.25em; }
            .preview-html li { margin: 0.25em 0; }

            .preview-html blockquote {
              border-left: 4px solid rgba(255,255,255,0.15);
              padding-left: 0.75rem;
              margin: 0.75rem 0;
              color: rgba(255,255,255,0.8);
              font-style: italic;
            }

            .preview-html code {
              font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Courier New", monospace;
              background: rgba(255,255,255,0.06);
              padding: 0.15rem 0.35rem;
              border-radius: 0.25rem;
            }
            .preview-html pre {
              background: rgba(255,255,255,0.06);
              padding: 0.75rem 0.9rem;
              border-radius: 0.5rem;
              overflow-x: auto;
              margin: 0.75rem 0;
            }
            .preview-html pre code { background: transparent; padding: 0; }

            .preview-html .ql-align-center { text-align: center; }
            .preview-html .ql-align-right { text-align: right; }
            .preview-html .ql-align-justify { text-align: justify; }
          `}</style>

          <div
            key={renderKey}
            className="preview-html prose prose-invert max-w-none w-full"
            dangerouslySetInnerHTML={{ __html: effectiveHtml }}
          />
        </>
      );
    }

    if (loadingDocx) return <p className="text-[var(--color-info)]">Đang convert file Word sang HTML...</p>;
    if (docxError) return <p className="text-red-400">{docxError}</p>;

    if (!file || !previewUrl) return <p className="text-[var(--color-text-muted)]">File uploaded will be shown here</p>;

    if (file.type.startsWith("image/")) {
      return <img src={previewUrl} alt="File preview" className="max-w-full max-h-full object-contain rounded-lg" />;
    }

    if (file.type === "application/pdf") {
      return (
        <embed
          src={previewUrl}
          type="application/pdf"
          className="w-full h-full rounded-lg"
          style={{ minHeight: 360 }}
        />
      );
    }

    return (
      <div className="text-left text-[var(--color-text-secondary)]">
        <i className="fa-solid fa-file text-5xl mb-4"></i>
        <p className="font-semibold break-all">{file.name}</p>
      </div>
    );
  };

  return (
    <div className="bg-[var(--color-surface-alt)] border-2 border-dashed border-[var(--color-border-strong)] rounded-lg flex-grow min-h-[250px] h-full p-4 overflow-auto text-left">
      {renderPreview()}
    </div>
  );
};

export default FilePreview;
