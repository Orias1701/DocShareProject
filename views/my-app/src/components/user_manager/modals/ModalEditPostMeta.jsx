import React, { useEffect, useMemo, useRef, useState } from "react";

/**
 * ModalEditPostMeta
 *
 * Props:
 * - open: boolean
 * - onClose: () => void
 * - post: {
 *     post_id, title, banner_url,
 *     album_id, album_name,
 *     category_id, category_name,
 *     author_id, created_at
 *   }
 * - albums: [{ album_id, album_name }]  // để chọn album khác
 * - categories: [{ category_id, category_name }] // để chọn category khác
 * - isAdmin: boolean                    // nếu true: cho phép rename album/category hiện tại
 * - onSave: async (payload) => { status: 'ok'|'success'|'error', message? }
 *          payload (owner):
 *             { post_id, title, banner_url, bannerFile?, album_id_new?, category_id_new? }
 *          payload (admin):
 *             { ...owner, album_name_new?, category_name_new? }
 */
export default function ModalEditPostMeta({
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

  // chọn album/category khác
  const [albumIdNew, setAlbumIdNew] = useState("");
  const [categoryIdNew, setCategoryIdNew] = useState("");

  // admin-only: đổi tên album/category hiện tại
  const [albumNameNew, setAlbumNameNew] = useState("");
  const [categoryNameNew, setCategoryNameNew] = useState("");

  const fileRef = useRef(null);

  // banner helper (tiny toast in modal)
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

  // reset / load when open
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
    setBannerFile(null);
    setBannerPreview(post?.banner_url || "");
    setAlbumIdNew("");      // mặc định không đổi
    setCategoryIdNew("");   // mặc định không đổi
    setAlbumNameNew("");    // admin tự nhập nếu muốn đổi tên
    setCategoryNameNew("");
  }, [open, post]);

  // esc to close
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

  // detect changes
  const hasChanges = useMemo(() => {
    const tChanged = (title || "") !== (post?.title || "");
    const uChanged = (bannerUrl || "") !== (post?.banner_url || "");
    const fChanged = !!bannerFile;
    const albChanged = !!albumIdNew;
    const catChanged = !!categoryIdNew;
    const albRename = !!albumNameNew.trim();
    const catRename = !!categoryNameNew.trim();
    return tChanged || uChanged || fChanged || albChanged || catChanged || albRename || catRename;
  }, [post, title, bannerUrl, bannerFile, albumIdNew, categoryIdNew, albumNameNew, categoryNameNew]);

  const canSave = useMemo(() => {
    const t = (title || "").trim();
    if (t.length < 2) return false;
    // Không cho đồng thời đổi id & rename trên cùng thực thể
    if (albumIdNew && albumNameNew.trim()) return false;
    if (categoryIdNew && categoryNameNew.trim()) return false;
    return hasChanges && !saving;
  }, [title, hasChanges, saving, albumIdNew, albumNameNew, categoryIdNew, categoryNameNew]);

  const handleSave = async () => {
    if (!canSave) return;
    if (!meta.post_id) {
      showToast("error", "Thiếu post_id.");
      return;
    }
    if (!onSave) {
      onClose?.();
      return;
    }

    const payload = {
      post_id: meta.post_id,
      title: (title || "").trim(),
      banner_url: (bannerUrl || "").trim(),
      bannerFile: bannerFile || undefined, // để caller tự upload nếu muốn
      // đổi liên kết
      album_id_new: albumIdNew || undefined,
      category_id_new: categoryIdNew || undefined,
      // admin-only rename
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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-2 sm:p-3">
      {/* Backdrop */}
      <button
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
        aria-label="Close backdrop"
      />

      {/* Modal card */}
      <div className="relative z-10 w-full max-w-[560px] bg-[#1F2631] text-white border border-white/10 rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <h3 className="text-[16px] font-semibold">Edit post meta</h3>
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
          {toast && (
            <div
              className={
                "mb-3 px-3 py-2 rounded-md text-xs border " +
                (toast.type === "success"
                  ? "bg-emerald-900/30 text-emerald-200 border-emerald-700/40"
                  : toast.type === "error"
                  ? "bg-red-900/30 text-red-200 border-red-700/40"
                  : "bg-white/5 text-white/80 border-white/10")
              }
            >
              {toast.text}
            </div>
          )}

          {/* Meta line */}
          <div className="grid grid-cols-2 gap-2 mb-3 text-[11px] text-white/60">
            {meta.post_id && (
              <div>
                <span className="text-white/50">Post ID:</span>{" "}
                <span className="text-white/80">{meta.post_id}</span>
              </div>
            )}
            {meta.author_id && (
              <div>
                <span className="text-white/50">Author:</span>{" "}
                <span className="text-white/80">{meta.author_id}</span>
              </div>
            )}
            {meta.created_at && (
              <div className="col-span-2">
                <span className="text-white/50">Created:</span>{" "}
                <span className="text-white/80">{meta.created_at}</span>
              </div>
            )}
          </div>

          {/* Title */}
          <label className="block text-xs text-white/70 mb-1">Title</label>
          <input
            className="h-[42px] w-full mb-3 px-3 rounded-md bg-[#0f1420] border border-white/10 outline-none text-white text-sm"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Tiêu đề bài viết"
            maxLength={255}
          />

          {/* Banner preview + picker */}
          <div className="mb-3">
            <label className="block text-xs text-white/70 mb-1">Banner URL</label>
            <input
              className="h-[42px] w-full mb-2 px-3 rounded-md bg-[#0f1420] border border-white/10 outline-none text-white text-sm"
              value={bannerUrl}
              onChange={(e) => setBannerUrl(e.target.value)}
              placeholder="https://..."
              maxLength={500}
            />

            <div className="flex items-start gap-3">
              <div className="shrink-0">
                <div className="w-28 h-28 rounded-lg overflow-hidden bg-black/30 border border-white/10">
                  {bannerPreview ? (
                    <img
                      src={bannerPreview}
                      alt="banner"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/40 text-xs">
                      No banner
                    </div>
                  )}
                </div>
              </div>

              <div className="grow text-xs text-white/70">
                <div className="text-white/90 mb-1">Or upload new image</div>
                <div className="flex gap-2 mb-1">
                  <button
                    className="px-3 py-1.5 rounded-md bg-white text-black text-xs"
                    onClick={() => fileRef.current?.click()}
                  >
                    Choose image
                  </button>
                  {bannerFile && (
                    <button
                      className="px-3 py-1.5 rounded-md border border-white/20 text-white/90"
                      onClick={clearBannerFile}
                    >
                      Clear
                    </button>
                  )}
                </div>
                <div className="text-white/50">
                  Hỗ trợ PNG/JPG/WebP/GIF, &lt; 4MB. Nếu chọn file, caller nên upload và trả về URL.
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

          {/* Album / Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Album */}
            <div>
              <label className="block text-xs text-white/70 mb-1">
                Album (current: <span className="text-white/90">{meta.album_name || meta.album_id || "—"}</span>)
              </label>
              <select
                className="h-[42px] w-full px-3 rounded-md bg-[#0f1420] border border-white/10 outline-none text-white text-sm"
                value={albumIdNew}
                onChange={(e) => setAlbumIdNew(e.target.value)}
                disabled={!!albumNameNew.trim()}
                title={albumNameNew.trim() ? "Đang nhập tên mới cho album hiện tại" : ""}
              >
                <option value="">— Giữ nguyên album —</option>
                {albums.map((a) => (
                  <option key={a.album_id} value={a.album_id}>
                    {a.album_name} ({a.album_id})
                  </option>
                ))}
              </select>

              {isAdmin && (
                <>
                  <div className="text-[11px] text-white/50 mt-1">
                    Admin có thể đổi tên <i>album hiện tại</i>.
                  </div>
                  <input
                    className="h-[38px] w-full mt-2 px-3 rounded-md bg-[#0f1420] border border-white/10 outline-none text-white text-sm disabled:opacity-50"
                    placeholder="Tên album mới (đổi tên album hiện tại)"
                    value={albumNameNew}
                    onChange={(e) => setAlbumNameNew(e.target.value)}
                    disabled={!!albumIdNew}
                  />
                </>
              )}
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs text-white/70 mb-1">
                Category (current: <span className="text-white/90">{meta.category_name || meta.category_id || "—"}</span>)
              </label>
              <select
                className="h-[42px] w-full px-3 rounded-md bg-[#0f1420] border border-white/10 outline-none text-white text-sm"
                value={categoryIdNew}
                onChange={(e) => setCategoryIdNew(e.target.value)}
                disabled={!!categoryNameNew.trim()}
                title={categoryNameNew.trim() ? "Đang nhập tên mới cho category hiện tại" : ""}
              >
                <option value="">— Giữ nguyên category —</option>
                {categories.map((c) => (
                  <option key={c.category_id} value={c.category_id}>
                    {c.category_name} ({c.category_id})
                  </option>
                ))}
              </select>

              {isAdmin && (
                <>
                  <div className="text-[11px] text-white/50 mt-1">
                    Admin có thể đổi tên <i>category hiện tại</i>.
                  </div>
                  <input
                    className="h-[38px] w-full mt-2 px-3 rounded-md bg-[#0f1420] border border-white/10 outline-none text-white text-sm disabled:opacity-50"
                    placeholder="Tên category mới (đổi tên category hiện tại)"
                    value={categoryNameNew}
                    onChange={(e) => setCategoryNameNew(e.target.value)}
                    disabled={!!categoryIdNew}
                  />
                </>
              )}
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
