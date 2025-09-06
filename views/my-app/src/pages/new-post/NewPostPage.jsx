import React, { useState } from 'react';
import FormField from '../../components/common/FormField';
import FileUpload from '../../components/common/FileUpload';
import FilePreview from '../../components/common/FilePreview';

const NewPostPage = () => {
  const [mainFile, setMainFile] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);

  const handleSubmit = () => {
    console.log("File chính:", mainFile);
    console.log("File thumbnail:", thumbnailFile);
    // Logic gửi form
  };

  return (
    <div className="bg-[#1621] p-8 rounded-lg border border-[#2d2d33]">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-10 gap-y-8">
        
        {/* === CỘT TRÁI === */}
        <div className="flex flex-col gap-8">
          
          {/* THAY ĐỔI: Loại bỏ grid 2 cột, để 2 trường này xếp chồng lên nhau */}
          <FormField label="Post title" placeholder="Post title..." />
          <FormField label="Category" type="select">
            <option>Choose category to save post</option>
          </FormField>

          {/* Khu vực upload file (vẫn giữ 2 cột) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <FileUpload 
              title="Upload file" 
              subtitle="Or if you prefer"
              buttonText="Browse my file"
              note="Only support .pdf file"
              onFileSelect={setMainFile}
            />
            <FileUpload 
              title="Upload thumbnail" 
              subtitle="Or if you prefer"
              buttonText="Browse my file"
              note="Support .jpeg, .jpg, .png, ..."
              onFileSelect={setThumbnailFile}
            />
          </div>

          {/* Các trường textarea */}
          <FormField label="Your summary" type="textarea" placeholder="Your summary will be shown here" rows={5} />
          <FormField label="Description" type="textarea" placeholder="Description..." rows={3} />
        </div>

        {/* === CỘT PHẢI === */}
        <div className="flex flex-col gap-8">
          
          {/* Album và Hashtag */}
          <FormField label="Album" type="select">
            <option>Choose album to save post</option>
          </FormField>
          <FormField label="Hashtag" placeholder="Hashtag..." />

          {/* Khu vực xem trước file */}
          <div className="flex-grow flex flex-col h-full">
            <label className="block text-sm font-medium text-gray-300 mb-2">File Preview</label>
            <FilePreview file={mainFile} />
          </div>
        </div>
      </div>

      {/* Nút Submit */}
      <div className="flex justify-end mt-8">
        <button onClick={handleSubmit} className="bg-gray-200 hover:bg-white text-black font-bold py-2 px-8 rounded-lg transition-colors">
          Submit
        </button>
      </div>
    </div>
  );
};

export default NewPostPage;