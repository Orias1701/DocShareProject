// src/components/new-post/FilePreview.jsx
import React, { useState, useEffect } from "react";

/**
 * FilePreview
 * - Nếu có htmlContent (từ editor hoặc docx conversion): render HTML (giống vùng soạn thảo)
 * - Nếu có file:
 *    - image -> hiển thị ảnh
 *    - pdf -> embed
 *    - docx -> chuyển thành HTML bằng mammoth (browser) rồi hiển thị
 * - Nếu chưa có gì: hiển thị placeholder
 *
 * Props:
 *  - file: File | null
 *  - htmlContent: optional HTML string (priority cao hơn file)
 *  - html: alias cho htmlContent (để backward-compat)
 *  - onDocxHtml: function(html) => callback khi docx đã convert xong (để cha có thể lưu HTML)
 */
const FilePreview = ({ file, htmlContent, html, onDocxHtml }) => {
  const [previewUrl, setPreviewUrl] = useState(null);
  const [docxHtml, setDocxHtml] = useState(null);
  const [loadingDocx, setLoadingDocx] = useState(false);
  const [docxError, setDocxError] = useState(null);

  const effectiveHtml = htmlContent ?? html ?? null;

  // tạo/revoke object URL cho file (ảnh/pdf)
  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    if (file && (file.type.startsWith("image/") || file.type === "application/pdf")) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      return () => {
        URL.revokeObjectURL(url);
        setPreviewUrl(null);
      };
    }
    setPreviewUrl(null);
  }, [file]);

  // convert DOCX -> HTML using mammoth (browser)
  useEffect(() => {
    let cancelled = false;
    setDocxHtml(null);
    setDocxError(null);
    if (!file) return;

    const isDocx =
      file.type ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
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

  const renderPreview = () => {
    // priority 1: explicit htmlContent/html (from editor)
    if (effectiveHtml) {
      return (
        <div
          className="prose prose-invert text-left max-w-none w-full h-auto"
          dangerouslySetInnerHTML={{ __html: effectiveHtml }}
        />
      );
    }

    // priority 2: docxHtml (converted)
    if (docxHtml) {
      return (
        <div
          className="prose prose-invert text-left max-w-none w-full h-auto"
          dangerouslySetInnerHTML={{ __html: docxHtml }}
        />
      );
    }

    if (loadingDocx) {
      return <p className="text-gray-400">Đang convert file Word sang HTML...</p>;
    }
    if (docxError) {
      return <p className="text-red-400">{docxError}</p>;
    }

    if (!file || !previewUrl) {
      return <p className="text-gray-500">File uploaded will be shown here</p>;
    }

    if (file.type.startsWith("image/")) {
      return (
        <img
          src={previewUrl}
          alt="File preview"
          className="max-w-full max-h-full object-contain rounded-lg"
        />
      );
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
      <div className="text-left text-gray-400">
        <i className="fa-solid fa-file text-5xl mb-4"></i>
        <p className="font-semibold break-all">{file.name}</p>
      </div>
    );
  };

  return (
    <div className="bg-[#1C2028] border-2 border-dashed border-gray-700 rounded-lg flex-grow min-h-[250px] h-full p-4 overflow-auto text-left">
      {renderPreview()}
    </div>
  );
};

export default FilePreview;
