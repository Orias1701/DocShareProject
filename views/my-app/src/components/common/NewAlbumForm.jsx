// src/components/albums/NewAlbumForm.jsx
import React, { useState } from 'react';
import FileUpload from '../new-post/FileUpload'; // Dùng lại component FileUpload
import FormField from '../new-post/FormField';   // Dùng lại component FormField
import albumService from '../../services/albumService';
import Toast from '../../components/common/Toast';

const NewAlbumForm = ({ onClose, onCreated }) => {
  const [albumName, setAlbumName] = useState('');
  const [thumbnail, setThumbnail] = useState(null); // BE chưa hỗ trợ, chỉ hiển thị UI
  const [submitting, setSubmitting] = useState(false);
  const [fieldError, setFieldError] = useState(null);

  // Toast state
  const [toast, setToast] = useState({ open: false, message: '', type: 'success' });

  const handleSubmit = async () => {
    setFieldError(null);
    if (!albumName.trim()) {
      setFieldError('Album title là bắt buộc');
      return;
    }

    try {
      setSubmitting(true);
      // BE hiện chỉ nhận JSON: { album_name, description? }
      const res = await albumService.create({ album_name: albumName.trim() });
      onCreated?.(res);

      // Hiển thị toast 3s, sau đó tự đóng modal (trong handler onClose của Toast)
      setToast({ open: true, message: 'Tạo album thành công!', type: 'success' });
    } catch (e) {
      setToast({ open: true, message: e?.message || 'Tạo album thất bại. Vui lòng thử lại!', type: 'error' });
      console.error('[create_album] error:', e);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-xl font-bold text-white">Album title</h2>

      <FormField
        label="Album title"
        placeholder="Album title..."
        value={albumName}
        onChange={(e) => setAlbumName(e.target.value)}
        error={fieldError}
      />

      {/* Thumbnail hiện chỉ phục vụ UI; BE chưa nhận */}
      <FileUpload
        title="Upload thumbnail"
        subtitle="Or if you prefer"
        buttonText="Browse my file"
        note="Support .jpeg, .jpg, .png, ..."
        onFileSelect={setThumbnail}
      />
      {thumbnail && (
        <p className="text-xs text-gray-400 -mt-4">
          Đã chọn: {thumbnail.name} (hiện chưa gửi lên server)
        </p>
      )}

      <div className="flex justify-end mt-2">
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="bg-gray-200 hover:bg-white disabled:opacity-60 text-black font-bold py-2 px-8 rounded-lg transition-colors"
        >
          {submitting ? 'Submitting...' : 'Submit'}
        </button>
      </div>

      {/* Toast báo kết quả */}
      <Toast
        open={toast.open}
        message={toast.message}
        type={toast.type}
        onClose={() => {
          // Đóng toast
          setToast((t) => ({ ...t, open: false }));
          // Nếu là success thì đóng luôn modal
          if (toast.type === 'success') onClose?.();
        }}
      />
    </div>
  );
};

export default NewAlbumForm;
