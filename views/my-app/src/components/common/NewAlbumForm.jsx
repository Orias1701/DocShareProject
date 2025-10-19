import React, { useState } from "react";
import FileUpload from "../new-post/FileUpload";
import FormField from "../new-post/FormField";
import albumService from "../../services/albumService";
import Toast from "../common/Toast";

// Chuẩn hoá dữ liệu album BE trả về (nhiều kiểu shape khác nhau)
const normalizeCreatedAlbum = (res, fallbackName) => {
  const d = res?.data ?? res ?? {};
  const payload = d.album || d.data || d;

  const album_id = payload?.album_id ?? payload?.id;
  const album_name =
    payload?.album_name ?? payload?.name ?? fallbackName ?? "Album";
  const created_at = payload?.created_at ?? new Date().toISOString();
  const url_thumbnail = payload?.url_thumbnail ?? null;

  return {
    album_id,
    id: album_id,
    album_name,
    name: album_name,
    created_at,
    url_thumbnail,
    _raw: res,
  };
};

const NewAlbumForm = ({ onClose, onCreated }) => {
  const [albumName, setAlbumName] = useState("");
  const [thumbnail, setThumbnail] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [fieldError, setFieldError] = useState(null);

  const [toast, setToast] = useState({
    open: false,
    message: "",
    type: "success",
  });

  const handleSubmit = async () => {
    setFieldError(null);
    if (!albumName.trim()) {
      setFieldError("Album title là bắt buộc");
      return;
    }

    try {
      setSubmitting(true);

      const res = await albumService.create({
        album_name: albumName.trim(),
        description: "",
        thumbnail,
      });

      const createdAlbum = normalizeCreatedAlbum(res, albumName);

      onCreated?.(createdAlbum);
      onClose?.();

      setToast({
        open: true,
        message: "Tạo album thành công!",
        type: "success",
      });
    } catch (e) {
      setToast({
        open: true,
        message: e?.message || "Tạo album thất bại. Vui lòng thử lại!",
        type: "error",
      });
      console.error("[create_album] error:", e);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-xl font-bold text-[var(--color-text)]">Album title</h2>

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
        <p className="text-xs text-[var(--color-text-muted)] -mt-4">
          Đã chọn: {thumbnail.name}
        </p>
      )}

      <div className="flex justify-end mt-2">
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="bg-[var(--color-text)] hover:bg-white disabled:opacity-60 text-black font-bold py-2 px-8 rounded-lg transition-colors"
        >
          {submitting ? "Submitting..." : "Submit"}
        </button>
      </div>

      <Toast
        open={toast.open}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast((t) => ({ ...t, open: false }))}
      />
    </div>
  );
};

export default NewAlbumForm;
