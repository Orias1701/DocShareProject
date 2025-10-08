// src/components/user_manager/modals/ModalEditAlbum.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";

export default function ModalEditAlbum({
  open,
  onClose,
  album,          // { id, name, description, thumbnail, userId, createdAt, raw? }
  onSave,         // optional: async ({ album_id, album_name, description, thumbnailFile }) => {status:'ok'|'error', message?}
}) {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [thumbFile, setThumbFile] = useState(null);
  const [thumbPreview, setThumbPreview] = useState("");
  const [saving, setSaving] = useState(false);
  const [banner, setBanner] = useState(null);
  const inputRef = useRef(null);

  // gọn banner
  const showBanner = (type, text, ms = 2200) => {
    setBanner({ type, text });
    window.clearTimeout(showBanner._t);
    showBanner._t = window.setTimeout(() => setBanner(null), ms);
  };

  // hàng info: co giãn/ẩn nếu không có
  const meta = useMemo(() => {
    if (!album) return {};
    return {
      album_id: album.id ?? album.album_id,
      user_id: album.userId ?? album.user_id,
      created_at: album.createdAt ?? album.created_at,
    };
  }, [album]);

  // khi mở modal, nạp dữ liệu hiện tại
  useEffect(() => {
    if (!open) {
      // reset
      setName("");
      setDesc("");
      setThumbFile(null);
      setThumbPreview("");
      setSaving(false);
      setBanner(null);
      return;
    }
    setName(album?.name || album?.album_name || "");
    setDesc(album?.description || "");
    setThumbFile(null);
    setThumbPreview(album?.thumbnail || album?.url_thumbnail || "");
  }, [open, album]);

  // esc to close
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const pickFile = () => inputRef.current?.click();
  const handlePick = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    // Validate sơ bộ
    const allow = ["image/png", "image/jpeg", "image/webp", "image/gif"];
    if (!allow.includes(f.type)) {
      showBanner("error", "Chỉ nhận ảnh PNG/JPG/WebP/GIF");
      return;
    }
    if (f.size > 4 * 1024 * 1024) {
      showBanner("error", "Ảnh quá lớn (>4MB).");
      return;
    }
    setThumbFile(f);
    setThumbPreview(URL.createObjectURL(f));
  };

  const clearThumb = () => {
    setThumbFile(null);
    setThumbPreview(album?.thumbnail || album?.url_thumbnail || "");
    if (inputRef.current) inputRef.current.value = "";
  };

  const album_id = meta.album_id || "";

  // kiểm tra thay đổi
  const hasChanges = useMemo(() => {
    const originalName = album?.name || album?.album_name || "";
    const originalDesc = album?.description || "";
    const nameChanged = (name || "") !== originalName;
    const descChanged = (desc || "") !== originalDesc;
    const thumbChanged = !!thumbFile; // chỉ cần có file là coi như đổi
    return nameChanged || descChanged || thumbChanged;
  }, [album, name, desc, thumbFile]);

  const canSave = useMemo(() => {
    const n = (name || "").trim();
    return n.length >= 2 && hasChanges && !saving;
  }, [name, hasChanges, saving]);

  const handleSave = async () => {
    if (!canSave) return;
    if (!album_id) {
      showBanner("error", "Thiếu album_id.");
      return;
    }
    if (!onSave) {
      // UI-only mode
      onClose?.();
      return;
    }
    try {
      setSaving(true);
      const res = await onSave({
        album_id,
        album_name: name.trim(),
        description: desc,
        thumbnailFile: thumbFile || undefined,
      });
      if (res?.status === "ok" || res?.status === "success") {
        showBanner("success", res?.message || "Đã cập nhật album.");
        // đóng sau 500ms cho mượt
        setTimeout(() => onClose?.(), 500);
      } else {
        showBanner("error", res?.message || "Cập nhật thất bại.");
      }
    } catch (e) {
      showBanner("error", e?.message || "Lỗi khi cập nhật.");
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-2 sm:p-3">
      {/* Backdrop */}
      <button
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
        aria-label="Close backdrop"
      />
      {/* Modal: card nhỏ, không bị to */}
      <div className="relative z-10 w-full max-w-[520px] bg-[#1F2631] text-white border border-white/10 rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <h3 className="text-[16px] font-semibold">Edit album</h3>
          <button
            onClick={onClose}
            className="h-8 w-8 flex items-center justify-center rounded-md border border-white/10 text-white/80 hover:text-white"
            aria-label="Close"
            title="Close"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="px-4 py-3">
          {banner && (
            <div
              className={
                "mb-3 px-3 py-2 rounded-md text-xs border " +
                (banner.type === "success"
                  ? "bg-emerald-900/30 text-emerald-200 border-emerald-700/40"
                  : banner.type === "error"
                  ? "bg-red-900/30 text-red-200 border-red-700/40"
                  : "bg-white/5 text-white/80 border-white/10")
              }
            >
              {banner.text}
            </div>
          )}

          {/* Meta nho nhỏ */}
          <div className="grid grid-cols-2 gap-2 mb-3 text-[11px] text-white/60">
            {meta.album_id && (
              <div>
                <span className="text-white/50">Album ID:</span>{" "}
                <span className="text-white/80">{meta.album_id}</span>
              </div>
            )}
            {meta.user_id && (
              <div>
                <span className="text-white/50">Owner:</span>{" "}
                <span className="text-white/80">{meta.user_id}</span>
              </div>
            )}
            {meta.created_at && (
              <div className="col-span-2">
                <span className="text-white/50">Created:</span>{" "}
                <span className="text-white/80">{meta.created_at}</span>
              </div>
            )}
          </div>

          {/* Tên album */}
          <label className="block text-xs text-white/70 mb-1">Album name</label>
          <input
            className="h-[42px] w-full mb-3 px-3 rounded-md bg-[#0f1420] border border-white/10 outline-none text-white text-sm"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Tên album"
            maxLength={120}
          />

          {/* Mô tả */}
          <label className="block text-xs text-white/70 mb-1">Description</label>
          <textarea
            rows={3}
            className="w-full mb-3 px-3 py-2.5 rounded-md bg-[#0f1420] border border-white/10 outline-none text-white text-sm"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="Mô tả ngắn gọn…"
            maxLength={600}
          />

          {/* Thumbnail nhỏ gọn */}
          <div className="flex items-start gap-3">
            <div className="shrink-0">
              <div className="w-28 h-28 rounded-lg overflow-hidden bg-black/30 border border-white/10">
                {thumbPreview ? (
                  <img
                    src={thumbPreview}
                    alt="thumbnail"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/40 text-xs">
                    No thumbnail
                  </div>
                )}
              </div>
            </div>

            <div className="grow text-xs text-white/70">
              <div className="mb-2">
                <div className="text-white/90 mb-1">Thumbnail</div>
                <div className="flex gap-2">
                  <button
                    className="px-3 py-1.5 rounded-md bg-white text-black text-xs"
                    onClick={pickFile}
                  >
                    Choose image
                  </button>
                  {thumbFile && (
                    <button
                      className="px-3 py-1.5 rounded-md border border-white/20 text-white/90"
                      onClick={clearThumb}
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
              <div className="text-white/50">
                Hỗ trợ PNG/JPG/WebP/GIF, &lt; 4MB. Ảnh hiển thị nhỏ để modal không bị phình.
              </div>
              <input
                ref={inputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                className="hidden"
                onChange={handlePick}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-white/10">
          <button
            className="h-[38px] px-4 rounded-md bg-[#2b3442] text-white/90 hover:bg-[#25303e]"
            onClick={onClose}
            disabled={saving}
          >
            Cancel
          </button>
          <button
            className="h-[38px] px-4 rounded-md bg-[#2563eb] hover:bg-[#1d4ed8] text-white disabled:opacity-50"
            onClick={handleSave}
            disabled={!canSave}
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
