import React, { useState, useEffect } from 'react';

/**
 * Component `FilePreview`
 * @description Hiển thị một bản xem trước của file được chọn.
 * Hỗ trợ các định dạng ảnh và file PDF.
 * @param {{ file: File | null }} props - File object được chọn từ input.
 */
const FilePreview = ({ file }) => {
  // State để lưu trữ URL xem trước của file
  const [previewUrl, setPreviewUrl] = useState(null);

  // Sử dụng useEffect để tạo và hủy URL xem trước, tránh memory leak
  useEffect(() => {
    // Nếu không có file, không làm gì cả
    if (!file) {
      setPreviewUrl(null);
      return;
    }

    // Tạo một Object URL tạm thời cho file
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    // Cleanup function: sẽ được gọi khi component unmount hoặc khi `file` thay đổi
    // để hủy bỏ URL đã tạo, giải phóng bộ nhớ.
    return () => {
      URL.revokeObjectURL(url);
      setPreviewUrl(null);
    };
  }, [file]); // Effect này sẽ chạy lại mỗi khi prop `file` thay đổi

  // --- Logic để render nội dung xem trước ---
  const renderPreview = () => {
    // Nếu không có file, hiển thị thông báo mặc định
    if (!file || !previewUrl) {
      return <p className="text-gray-500">File uploaded will be shown here</p>;
    }

    // Nếu là file ảnh, hiển thị bằng thẻ <img>
    if (file.type.startsWith('image/')) {
      return <img src={previewUrl} alt="File preview" className="max-w-full max-h-full object-contain rounded-lg" />;
    }

    // Nếu là file PDF, hiển thị bằng thẻ <embed>
    if (file.type === 'application/pdf') {
      return <embed src={previewUrl} type="application/pdf" className="w-full h-full rounded-lg" />;
    }
    
    // Nếu là định dạng khác, hiển thị icon và tên file
    return (
        <div className="text-center text-gray-400">
            <i className="fa-solid fa-file text-5xl mb-4"></i>
            <p className="font-semibold break-all">{file.name}</p>
        </div>
    );
  };

  return (
    <div className="bg-[#1C2028] border-2 border-dashed border-gray-700 rounded-lg flex-grow flex items-center justify-center min-h-[250px] h-full p-4">
      {renderPreview()}
    </div>
  );
};

export default FilePreview;