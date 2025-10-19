import React, { useEffect, useMemo, useRef, useState } from "react";

export default function ModalEditPost({
  open,
  onClose,
  post,
  albums = [],
  categories = [],
  isAdmin = false,
  onSave,
}) {
  const [title, setTitle] = useState("");
  const [bannerUrl, setBannerUrl] = useState("");
  const [bannerFile, setBannerFile] = useState(null);
  const [bannerPreview, setBannerPreview] = useState("");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const [albumIdNew, setAlbumIdNew] = useState("");
  const [categoryIdNew, setCategoryIdNew] = useState("");
  const [albumNameNew, setAlbumNameNew] = useState("");
  const [categoryNameNew, setCategoryNameNew] = useState("");
  const fileRef = useRef(null);

  const showToast = (type, text, ms = 2200) => {
    setToast({ type, text });
    window.clearTimeout(showToast._t);
    showToast._t = window.setTimeout(() => setToast(null), ms);
  };

  const meta = useMemo(() => {
    if (!post) return {};
    return {
      post_id: post.post_id,
      album_id: post.album_id,
      album_name: post.album_name,
      category_id: post.category_id,
      category_name: post.category_name,
      author_id: post.author_id,
      created_at: post.created_at,
    };
  }, [post]);

  useEffect(() => {
    if (!open) {
      setTitle("");
      setBannerUrl("");
      setBannerFile(null);
      setBannerPreview("");
      setAlbumIdNew("");
      setCategoryIdNew("");
      setAlbumNameNew("");
      setCategoryNameNew("");
      setSaving(false);
      setToast(null);
      if (fileRef.current) fileRef.current.value = "";
      return;
    }
    setTitle(post?.title || "");
    setBannerUrl(post?.banner_url || "");
    setBannerPreview(post?.banner_url || "");
  }, [open, post]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const handlePick = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const allow = ["image/png", "image/jpeg", "image/webp", "image/gif"];
    if (!allow.includes(f.type)) {
      showToast("error", "Chỉ nhận ảnh PNG/JPG/WebP/GIF");
      return;
    }
    if (f.size > 4 * 1024 * 1024) {
      showToast("error", "Ảnh quá lớn (>4MB).");
      return;
    }
    setBannerFile(f);
    setBannerPreview(URL.createObjectURL(f));
  };

  const clearBannerFile = () => {
    setBannerFile(null);
    setBannerPreview(bannerUrl || post?.banner_url || "");
    if (fileRef.current) fileRef.current.value = "";
  };

  const hasChanges = useMemo(() => {
    const tChanged = (title || "") !== (post?.title || "");
    const uChanged = (bannerUrl || "") !== (post?.banner_url || "");
    const fChanged = !!bannerFile;
    const albChanged = !!albumIdNew;
    const catChanged = !!categoryIdNew;
    const albRename = !!albumNameNew.trim();
    const catRename = !!categoryNameNew.trim();
    return (
      tChanged ||
      uChanged ||
      fChanged ||
      albChanged ||
      catChanged ||
      albRename ||
      catRename
    );
  }, [post, title, bannerUrl, bannerFile, albumIdNew, categoryIdNew, albumNameNew, categoryNameNew]);

  const canSave = useMemo(() => {
    const t = (title || "").trim();
    if (t.length < 2) return false;
    if (albumIdNew && albumNameNew.trim()) return false;
    if (categoryIdNew && categoryNameNew.trim()) return false;
    return hasChanges && !saving;
  }, [title, hasChanges, saving, albumIdNew, albumNameNew, categoryIdNew, categoryNameNew]);

  const handleSave = async () => {
    if (!canSave) return;
    if (!meta.post_id) return showToast("error", "Thiếu post_id.");
    if (!onSave) return onClose?.();

    const payload = {
      post_id: meta.post_id,
      title: title.trim(),
      banner_url: bannerUrl.trim(),
      bannerFile: bannerFile || undefined,
      album_id_new: albumIdNew || undefined,
      category_id_new: categoryIdNew || undefined,
      ...(isAdmin
        ? {
            album_name_new: albumNameNew.trim() || undefined,
            category_name_new: categoryNameNew.trim() || undefined,
          }
        : {}),
    };

    try {
      setSaving(true);
      const res = await onSave(payload);
      if (res?.status === "ok" || res?.status === "success") {
        showToast("success", res?.message || "Đã cập nhật bài viết.");
        setTimeout(() => onClose?.(), 500);
      } else {
        showToast("error", res?.message || "Cập nhật thất bại.");
      }
    } catch (e) {
      showToast("error", e?.message || "Lỗi khi cập nhật.");
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3">
      <div
        className="absolute inset-0 z-0"
        style={{ background: "var(--color-overlay-bg)" }}
        onClick={onClose}
      />
      <div
        className="relative z-10 w-full max-w-[560px] rounded-2xl border shadow-2xl"
        style={{
          background: "var(--color-modal-bg)",
          borderColor: "var(--color-modal-border)",
          color: "var(--color-text)",
        }}
      >
        <div
          className="flex items-center justify-between px-4 py-3 border-b"
          style={{ borderColor: "var(--color-border-soft)" }}
        >
          <h3 className="text-[16px] font-semibold">Edit Post</h3>
          <button
            className="h-8 w-8 flex items-center justify-center rounded-md border hover:opacity-80"
            style={{
              borderColor: "var(--color-border-soft)",
              color: "var(--color-text-secondary)",
            }}
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <div className="px-4 py-3">
          {toast && (
            <div
              className="mb-3 px-3 py-2 rounded-md text-xs border"
              style={{
                background:
                  toast.type === "success"
                    ? "rgba(16,185,129,0.18)"
                    : toast.type === "error"
                    ? "rgba(239,68,68,0.18)"
                    : "rgba(255,255,255,0.05)",
                color:
                  toast.type === "success"
                    ? "#D1FAE5"
                    : toast.type === "error"
                    ? "#FECACA"
                    : "var(--color-text-secondary)",
                borderColor:
                  toast.type === "success"
                    ? "rgba(16,185,129,0.4)"
                    : toast.type === "error"
                    ? "rgba(239,68,68,0.4)"
                    : "var(--color-border-soft)",
              }}
            >
              {toast.text}
            </div>
          )}

          <label className="block text-xs mb-1" style={{ color: "var(--color-text-secondary)" }}>
            Title
          </label>
          <input
            className="h-[42px] w-full mb-3 px-3 rounded-md border outline-none text-sm"
            style={{
              background: "var(--color-input-bg)",
              borderColor: "var(--color-border-soft)",
              color: "var(--color-text)",
            }}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          {/* Banner */}
          <label className="block text-xs mb-1" style={{ color: "var(--color-text-secondary)" }}>
            Banner URL
          </label>
          <input
            className="h-[42px] w-full mb-2 px-3 rounded-md border outline-none text-sm"
            style={{
              background: "var(--color-input-bg)",
              borderColor: "var(--color-border-soft)",
              color: "var(--color-text)",
            }}
            value={bannerUrl}
            onChange={(e) => setBannerUrl(e.target.value)}
            placeholder="https://..."
          />

          <div className="flex items-start gap-3 mb-3">
            <div className="w-28 h-28 rounded-lg overflow-hidden border flex items-center justify-center"
              style={{ borderColor: "var(--color-border-soft)", background: "var(--color-surface-alt)" }}>
              {bannerPreview ? (
                <img src={bannerPreview} alt="banner" className="w-full h-full object-cover" />
              ) : (
                <div className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                  No banner
                </div>
              )}
            </div>

            <div className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
              <div className="mb-1 font-medium">Or upload new image</div>
              <div className="flex gap-2 mb-1">
                <button
                  className="px-3 py-1.5 rounded-md text-xs"
                  style={{
                    background: "var(--color-btn-bg)",
                    color: "var(--color-btn-text)",
                  }}
                  onClick={() => fileRef.current?.click()}
                >
                  Choose image
                </button>
                {bannerFile && (
                  <button
                    className="px-3 py-1.5 rounded-md border text-xs"
                    style={{
                      borderColor: "var(--color-border-soft)",
                      color: "var(--color-text)",
                    }}
                    onClick={clearBannerFile}
                  >
                    Clear
                  </button>
                )}
              </div>
              <div style={{ color: "var(--color-text-muted)" }}>
                Hỗ trợ PNG/JPG/WebP/GIF, &lt; 4MB
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                className="hidden"
                onChange={handlePick}
              />
            </div>
          </div>
        </div>

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
