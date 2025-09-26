// src/components/new-post/FilePreview.jsx
import React, { useState, useEffect } from "react";

/**
 * FilePreview
 * - Nếu có htmlContent: render HTML (giống vùng soạn thảo)
 * - Nếu có file: preview ảnh / PDF
 * - Nếu chưa có gì: hiển thị placeholder
 */
const FilePreview = ({ file, htmlContent }) => {
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => {
      URL.revokeObjectURL(url);
      setPreviewUrl(null);
    };
  }, [file]);

  const renderPreview = () => {
    // Ưu tiên HTML từ editor (Word mode)
    if (htmlContent) {
      return (
        <div
          className="prose prose-invert text-left max-w-none w-full h-auto"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
      );
    }

    // Chưa có file cũng chưa có HTML
    if (!file || !previewUrl) {
      return <p className="text-gray-500">File uploaded will be shown here</p>;
    }

    // Ảnh
    if (file.type.startsWith("image/")) {
      return (
        <img
          src={previewUrl}
          alt="File preview"
          className="max-w-full max-h-full object-contain rounded-lg"
        />
      );
    }

    // PDF
    if (file.type === "application/pdf") {
      return <embed src={previewUrl} type="application/pdf" className="w-full h-full rounded-lg" />;
    }

    // Khác
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
