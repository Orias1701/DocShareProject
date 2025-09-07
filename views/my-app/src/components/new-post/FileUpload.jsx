import React, { useState, useRef } from 'react';

/**
 * Component `FileUpload`
 * @description Component UI có thể tái sử dụng để upload file, hỗ trợ cả bấm nút và kéo-thả.
 * @param {object} props
 * @param {string} props.title - Tiêu đề của khu vực upload.
 * @param {string} props.subtitle - Phụ đề.
 * @param {string} props.buttonText - Chữ trên nút bấm.
 * @param {string} props.note - Ghi chú về định dạng file.
 * @param {function(File|null): void} props.onFileSelect - Callback function để gửi file đã chọn lên component cha.
 */
const FileUpload = ({ title, subtitle, buttonText, note, onFileSelect }) => {
  // THAY ĐỔI: Dùng useState để lưu trữ file người dùng đã chọn
  const [selectedFile, setSelectedFile] = useState(null);
  
  // THAY ĐỔI: Dùng useRef để tham chiếu đến thẻ input bị ẩn
  const inputRef = useRef(null);

  /**
   * Xử lý file được chọn (từ cả drag-drop và nút bấm)
   * @param {File} file - File người dùng đã chọn
   */
  const handleFile = (file) => {
    if (file) {
      setSelectedFile(file);
      // Gọi callback để thông báo cho component cha
      if (onFileSelect) {
        onFileSelect(file);
      }
    }
  };

  // --- Các hàm xử lý sự kiện ---

  const handleDragOver = (event) => {
    event.preventDefault(); // Ngăn hành vi mặc định của trình duyệt
  };

  const handleDrop = (event) => {
    event.preventDefault(); // Ngăn hành vi mặc định
    const file = event.dataTransfer.files[0];
    handleFile(file);
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    handleFile(file);
  };
  
  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (onFileSelect) {
        onFileSelect(null);
    }
    // Reset giá trị của input để có thể chọn lại cùng 1 file
    if(inputRef.current) {
        inputRef.current.value = "";
    }
  };


  return (
    // THAY ĐỔI: Thêm các sự kiện onDragOver và onDrop
    <div 
      className="bg-[#1C2028] border-2 border-dashed border-gray-600 rounded-lg p-6 text-center h-full flex flex-col justify-center transition-all"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* THAY ĐỔI: Input file bị ẩn đi, chỉ dùng để xử lý logic */}
      <input 
        type="file" 
        ref={inputRef} 
        onChange={handleFileChange} 
        className="hidden" 
      />

      {/* THAY ĐỔI: Hiển thị giao diện dựa vào việc đã có file hay chưa */}
      {selectedFile ? (
        // Giao diện khi đã chọn file
        <div className="flex flex-col items-center justify-center">
            <i className="fa-solid fa-file-check text-green-500 text-3xl mb-3"></i>
            <p className="font-semibold text-white break-all">{selectedFile.name}</p>
            <p className="text-sm text-gray-400 mt-1">{(selectedFile.size / 1024).toFixed(2)} KB</p>
            <button 
                onClick={handleRemoveFile}
                className="bg-red-600 hover:bg-red-700 text-white font-semibold py-1 px-3 rounded-lg mt-3 text-sm transition-colors">
                Remove
            </button>
        </div>
      ) : (
        // Giao diện gốc khi chưa chọn file
        <div className="flex flex-col items-center justify-center">
          <i className="fa-solid fa-arrow-up-from-bracket text-gray-500 text-2xl mb-2"></i>
          <p className="font-semibold text-white">{title}</p>
          <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
          {/* THAY ĐỔI: Nút bấm giờ đây sẽ kích hoạt input file bị ẩn */}
          <button 
            onClick={() => inputRef.current.click()} 
            className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg my-3 transition-colors"
          >
            {buttonText}
          </button>
          <p className="text-xs text-gray-600">{note}</p>
        </div>
      )}
    </div>
  );
};

export default FileUpload;