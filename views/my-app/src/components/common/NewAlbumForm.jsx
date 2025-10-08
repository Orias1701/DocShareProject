// src/components/albums/NewAlbumForm.jsx
import React, { useState } from 'react';
import FileUpload from '../new-post/FileUpload';
import FormField from '../new-post/FormField';
import albumService from '../../services/albumService';
import Toast from '../../components/common/Toast';

const normalizeCreatedAlbum = (res, fallbackName, fallbackFile) => {
  // BE có thể trả nhiều dạng khác nhau, ta gom lại an toàn
  const d = res?.data || res || {};
  const album_id = d.album_id ?? d.id ?? d.data?.album_id ?? d.data?.id;
  const album_name = d.album_name ?? d.name ?? fallbackName ?? 'Album';
  const created_at = d.created_at ?? new Date().toISOString();
  const url_thumbnail = d.url_thumbnail ?? null;

  return {
    album_id,
    id: album_id,
    album_name,
    name: album_name,
    created_at,
    url_thumbnail,
    // để MyAlbumPage map ra card dùng luôn
    _raw: res,
  };
};

const NewAlbumForm = ({ onClose, onCreated }) => {
  const [albumName, setAlbumName] = useState('');
  const [thumbnail, setThumbnail] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [fieldError, setFieldError] = useState(null);

  const [toast, setToast] = useState({ open: false, message: '', type: 'success' });

  const handleSubmit = async () => {
    setFieldError(null);
    if (!albumName.trim()) {
      setFieldError('Album title là bắt buộc');
      return;
    }

    try {
      setSubmitting(true);

      // ✅ Gọi service bằng object (như bạn đã làm)
      const res = await albumService.create({
        album_name: albumName.trim(),
        description: '',
        thumbnail, // nếu BE chưa nhận cũng không sao
      });

      // Chuẩn hoá dữ liệu album mới
      const createdAlbum = normalizeCreatedAlbum(res, albumName, thumbnail);

      // Báo cho cha biết để cập nhật UI ngay
      onCreated?.(createdAlbum);

      setToast({ open: true, message: 'Tạo album thành công!', type: 'success' });
    } catch (e) {
      setToast({
        open: true,
        message: e?.message || 'Tạo album thất bại. Vui lòng thử lại!',
        type: 'error',
      });
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

      <Toast
        open={toast.open}
        message={toast.message}
        type={toast.type}
        onClose={() => {
          setToast((t) => ({ ...t, open: false }));
          if (toast.type === 'success') onClose?.(); // đóng modal khi thành công
        }}
      />
    </div>
  );
};

export default NewAlbumForm;
