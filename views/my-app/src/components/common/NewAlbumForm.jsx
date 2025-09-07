import React, { useState } from 'react';
import FileUpload from '../new-post/FileUpload'; // Dùng lại component FileUpload
import FormField from '../new-post/FormField';   // Dùng lại component FormField

/**
 * Component `NewAlbumForm`
 * @description Form để tạo một album mới.
 * @param {{
 * onClose: () => void // Hàm để đóng modal từ bên trong form
 * }} props
 */
const NewAlbumForm = ({ onClose }) => {
  const [thumbnail, setThumbnail] = useState(null);

  const handleSubmit = () => {
    console.log("Submitting new album with thumbnail:", thumbnail);
    // Logic để submit album
    onClose(); // Đóng modal sau khi submit
  };

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-xl font-bold text-white">Album title</h2>
      
      <FormField 
        label="Album title" // Label này có thể bị ẩn nếu bạn muốn
        placeholder="Album title..." 
      />

      <FileUpload
        title="Upload thumbnail"
        subtitle="Or if you prefer"
        buttonText="Browse my file"
        note="Support .jpeg, .jpg, .png, ..."
        onFileSelect={setThumbnail}
      />
      
      <div className="flex justify-end mt-2">
        <button 
          onClick={handleSubmit}
          className="bg-gray-200 hover:bg-white text-black font-bold py-2 px-8 rounded-lg transition-colors"
        >
          Submit
        </button>
      </div>
    </div>
  );
};

export default NewAlbumForm;