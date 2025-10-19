import React, { useEffect, useMemo, useRef, useState } from "react";

export default function ModalEditAlbum({
  open,
  onClose,
  album,
  onSave,
}) {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [thumbFile, setThumbFile] = useState(null);
  const [thumbPreview, setThumbPreview] = useState("");
  const [saving, setSaving] = useState(false);
  const [banner, setBanner] = useState(null);
  const inputRef = useRef(null);

  const showBanner = (type, text, ms = 2200) => {
    setBanner({ type, text });
    window.clearTimeout(showBanner._t);
    showBanner._t = window.setTimeout(() => setBanner(null), ms);
  };

  const meta = useMemo(() => {
    if (!album) return {};
    return {
      album_id: album.id ?? album.album_id,
      user_id: album.userId ?? album.user_id,
      created_at: album.createdAt ?? album.created_at,
    };
  }, [album]);

  useEffect(() => {
    if (!open) {
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
  const hasChanges = useMemo(() => {
    const originalName = album?.name || album?.album_name || "";
    const originalDesc = album?.description || "";
    const nameChanged = (name || "") !== originalName;
    const descChanged = (desc || "") !== originalDesc;
    const thumbChanged = !!thumbFile;
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
      <div
        className="absolute inset-0 z-0"
        style={{ background: "var(--color-overlay-bg)" }}
        onClick={onClose}
        aria-label="Close backdrop"
      />

      {/* Modal */}
      <div
        className="relative z-10 w-full max-w-[520px] rounded-2xl border shadow-2xl"
        style={{
          background: "var(--color-modal-bg)",
          borderColor: "var(--color-modal-border)",
          color: "var(--color-text)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-3 border-b"
          style={{ borderColor: "var(--color-border-soft)" }}
        >
          <h3 className="text-[16px] font-semibold">Edit album</h3>
          <button
            onClick={onClose}
            className="h-8 w-8 flex items-center justify-center rounded-md border hover:opacity-80"
            style={{
              borderColor: "var(--color-border-soft)",
              color: "var(--color-text-secondary)",
            }}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="px-4 py-3">
          {banner && (
            <div
              className="mb-3 px-3 py-2 rounded-md text-xs border"
              style={{
                background:
                  banner.type === "success"
                    ? "rgba(16,185,129,0.18)"
                    : banner.type === "error"
                    ? "rgba(239,68,68,0.18)"
                    : "rgba(255,255,255,0.05)",
                color:
                  banner.type === "success"
                    ? "#D1FAE5"
                    : banner.type === "error"
                    ? "#FECACA"
                    : "var(--color-text-secondary)",
                borderColor:
                  banner.type === "success"
                    ? "rgba(16,185,129,0.4)"
                    : banner.type === "error"
                    ? "rgba(239,68,68,0.4)"
                    : "var(--color-border-soft)",
              }}
            >
              {banner.text}
            </div>
          )}

          {/* Meta info */}
          <div className="grid grid-cols-2 gap-2 mb-3 text-[11px] text-white/60">
            {meta.album_id && (
              <div>
                <span style={{ color: "var(--color-text-muted)" }}>Album ID:</span>{" "}
                <span style={{ color: "var(--color-text)" }}>{meta.album_id}</span>
              </div>
            )}
            {meta.user_id && (
              <div>
                <span style={{ color: "var(--color-text-muted)" }}>Owner:</span>{" "}
                <span style={{ color: "var(--color-text)" }}>{meta.user_id}</span>
              </div>
            )}
            {meta.created_at && (
              <div className="col-span-2">
                <span style={{ color: "var(--color-text-muted)" }}>Created:</span>{" "}
                <span style={{ color: "var(--color-text)" }}>{meta.created_at}</span>
              </div>
            )}
          </div>

          {/* Inputs */}
          <label className="block text-xs mb-1" style={{ color: "var(--color-text-secondary)" }}>
            Album name
          </label>
          <input
            className="h-[42px] w-full mb-3 px-3 rounded-md border outline-none text-sm"
            style={{
              background: "var(--color-input-bg)",
              borderColor: "var(--color-border-soft)",
              color: "var(--color-text)",
            }}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Tên album"
            maxLength={120}
          />

          <label className="block text-xs mb-1" style={{ color: "var(--color-text-secondary)" }}>
            Description
          </label>
          <textarea
            rows={3}
            className="w-full mb-3 px-3 py-2.5 rounded-md border outline-none text-sm"
            style={{
              background: "var(--color-input-bg)",
              borderColor: "var(--color-border-soft)",
              color: "var(--color-text)",
            }}
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="Mô tả ngắn gọn…"
            maxLength={600}
          />

          {/* Thumbnail */}
          <div className="flex items-start gap-3">
            <div className="shrink-0">
              <div
                className="w-28 h-28 rounded-lg overflow-hidden border flex items-center justify-center"
                style={{
                  background: "var(--color-muted-bg)",
                  borderColor: "var(--color-border-soft)",
                }}
              >
                {thumbPreview ? (
                  <img src={thumbPreview} alt="thumbnail" className="w-full h-full object-cover" />
                ) : (
                  <div
                    className="text-xs"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    No thumbnail
                  </div>
                )}
              </div>
            </div>

            <div className="grow text-xs" style={{ color: "var(--color-text-secondary)" }}>
              <div className="mb-2">
                <div className="text-white/90 mb-1">Thumbnail</div>
                <div className="flex gap-2">
                  <button
                    className="px-3 py-1.5 rounded-md text-xs"
                    style={{
                      background: "var(--color-btn-bg)",
                      color: "var(--color-btn-text)",
                    }}
                    onClick={pickFile}
                  >
                    Choose image
                  </button>
                  {thumbFile && (
                    <button
                      className="px-3 py-1.5 rounded-md border text-xs"
                      style={{
                        borderColor: "var(--color-border-soft)",
                        color: "var(--color-text)",
                      }}
                      onClick={clearThumb}
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
              <div style={{ color: "var(--color-text-muted)" }}>
                Hỗ trợ PNG/JPG/WebP/GIF, &lt;4MB.
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
        <div
          className="flex items-center justify-end gap-2 px-4 py-3 border-t"
          style={{ borderColor: "var(--color-border-soft)" }}
        >
          <button
            className="h-[38px] px-4 rounded-md hover:opacity-80"
            style={{
              background: "var(--color-surface-alt)",
              color: "var(--color-text)",
            }}
            onClick={onClose}
            disabled={saving}
          >
            Cancel
          </button>
          <button
            className="h-[38px] px-4 rounded-md disabled:opacity-50"
            style={{
              background: "var(--color-accent)",
              color: "#fff",
            }}
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
