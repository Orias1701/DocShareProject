// components/new-post/FileUpload.jsx
import React, { useState, useRef } from 'react';

const FileUpload = ({ title, subtitle, buttonText, note, onFileSelect, accept }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const inputRef = useRef(null);

  const handleFile = (file) => {
    if (file) {
      setSelectedFile(file);
      onFileSelect?.(file);
    }
  };

  const handleDragOver = (e) => e.preventDefault();
  const handleDrop = (e) => {
    e.preventDefault();
    handleFile(e.dataTransfer.files?.[0]);
  };
  const handleFileChange = (e) => handleFile(e.target.files?.[0]);

  const handleRemoveFile = () => {
    setSelectedFile(null);
    onFileSelect?.(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div
      className="bg-[#1C2028] border-2 border-dashed border-gray-600 rounded-lg p-6 text-center h-full flex flex-col justify-center transition-all"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <input
        type="file"
        ref={inputRef}
        onChange={handleFileChange}
        className="hidden"
        accept={accept}         
      />

      {selectedFile ? (
        <div className="flex flex-col items-center justify-center">
          <i className="fa-solid fa-file-check text-green-500 text-3xl mb-3"></i>
          <p className="font-semibold text-white break-all">{selectedFile.name}</p>
          <p className="text-sm text-gray-400 mt-1">{(selectedFile.size / 1024).toFixed(2)} KB</p>
          <button
            onClick={handleRemoveFile}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold py-1 px-3 rounded-lg mt-3 text-sm transition-colors"
          >
            Remove
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center">
          <i className="fa-solid fa-arrow-up-from-bracket text-gray-500 text-2xl mb-2"></i>
          <p className="font-semibold text-white">{title}</p>
          <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
          <button
            onClick={() => inputRef.current?.click()}
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
