// src/components/user_manager/modals/ModalEditPost.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";

const TABS = ["Thông tin post", "Phần post"];

export default function ModalEditPost({
  open,
  onClose,
  post = {},
  albums = [],
  categories = [],
  onSubmit,
}) {
  const [activeTab, setActiveTab] = useState(TABS[0]);

  // form state
  const [title, setTitle] = useState("");
  const [albumId, setAlbumId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [hashtags, setHashtags] = useState("");
  const [summary, setSummary] = useState("");
  const [description, setDescription] = useState("");

  const [mode, setMode] = useState("PDF"); // chỉ hiện ở tab "Phần post"
  const [contentHtml, setContentHtml] = useState("");
  const [pdfFile, setPdfFile] = useState(null);

  const [bannerFile, setBannerFile] = useState(null);
  const [bannerPreview, setBannerPreview] = useState("");
  const objectUrlRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    setActiveTab(TABS[0]);
    setTitle(post?.title || "");
    setAlbumId(post?.album_id || "");
    setCategoryId(post?.category_id || "");
    setHashtags("");
    setSummary(post?.summary || "");
    setDescription(post?.description || "");
    setContentHtml(post?.content || "");
    setPdfFile(null);
    setBannerFile(null);
    setMode(post?.file_url ? "PDF" : "WORD/HTML");
  }, [open, post]);

  useEffect(() => {
    if (bannerFile) {
      const url = URL.createObjectURL(bannerFile);
      objectUrlRef.current = url;
      setBannerPreview(url);
      return () => {
        URL.revokeObjectURL(url);
        objectUrlRef.current = null;
      };
    } else {
      setBannerPreview(post?.banner_url || "");
    }
  }, [bannerFile, post?.banner_url]);

  const canSaveInfo = useMemo(
    () => (title || "").trim().length >= 2,
    [title]
  );
  const canSavePost = useMemo(() => {
    if (activeTab !== "Phần post") return false;
    return mode === "PDF" ? true : (contentHtml || "").trim().length >= 1;
  }, [activeTab, mode, contentHtml]);

  const handleSubmit = async () => {
    if (activeTab === "Thông tin post" && !canSaveInfo) return;
    if (activeTab === "Phần post" && !canSavePost) return;

    const payload = {
      post_id: post?.post_id,
      title: title.trim(),
      album_id: albumId || null,
      category_id: categoryId || null,
      hashtags: hashtags.trim(),
      summary: summary.trim(),
      description: description.trim(),
      mode,
      content_html: mode === "WORD/HTML" ? contentHtml : "",
      pdfFile: mode === "PDF" ? pdfFile : null,
      bannerFile,
    };
    await onSubmit?.(payload);
  };

  if (!open) return null;

  // common classes (gọn hơn)
  const inputCls =
    "h-[36px] w-full px-3 rounded-md bg-[#0f1420] border border-white/10 outline-none text-white text-[13px]";
  const labelCls = "block text-[11px] text-white/60 mb-1";

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-3">
      <button
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
        aria-label="Close"
      />
      <div className="relative z-10 w-full max-w-[640px] bg-[#111827] text-white rounded-2xl border border-white/10 shadow-2xl">
        {/* header */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-white/10">
          <div className="flex items-center gap-2">
            <h3 className="text-[16px] font-semibold">Sửa bài viết</h3>
            {post?.post_id && (
              <span className="text-[11px] text-white/50">
                {post.post_id}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="h-7 w-7 flex items-center justify-center rounded-md border border-white/10 text-white/80 hover:text-white"
            aria-label="Close"
            title="Close"
          >
            ×
          </button>
        </div>

        {/* body (scrollable & compact) */}
        <div className="px-3 py-2 max-h-[78vh] overflow-y-auto">
          {/* tabs */}
          <div className="flex items-center gap-2 mb-2">
            {TABS.map((t) => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className={
                  "px-3 py-1.5 rounded-full text-[12px] border " +
                  (activeTab === t
                    ? "bg-white text-black border-white"
                    : "bg-transparent text-white/80 border-white/20 hover:text-white")
                }
              >
                {t}
              </button>
            ))}
          </div>

          {/* TAB: Thông tin post (đÃ THU NHỎ) */}
          {activeTab === "Thông tin post" && (
            <div className="space-y-3">
              <div>
                <label className={labelCls}>Post title</label>
                <input
                  className={inputCls}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Tiêu đề…"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Album</label>
                  <select
                    value={albumId}
                    onChange={(e) => setAlbumId(e.target.value)}
                    className={inputCls}
                  >
                    <option value="">— Chọn album —</option>
                    {albums.map((a) => (
                      <option key={a.album_id} value={a.album_id}>
                        {a.album_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={labelCls}>Category</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className={inputCls}
                  >
                    <option value="">— Chọn category —</option>
                    {categories.map((c) => (
                      <option key={c.category_id} value={c.category_id}>
                        {c.category_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className={labelCls}>Hashtags</label>
                <input
                  className={inputCls}
                  value={hashtags}
                  onChange={(e) => setHashtags(e.target.value)}
                  placeholder="#ai, #ml hoặc ai ml"
                />
              </div>

              <div>
                <label className={labelCls}>Your summary</label>
                <textarea
                  rows={3}
                  className="w-full px-3 py-2 rounded-md bg-[#0f1420] border border-white/10 outline-none text-white text-[13px]"
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="Tóm tắt ngắn…"
                />
              </div>

              <div>
                <label className={labelCls}>Description</label>
                <textarea
                  rows={3}
                  className="w-full px-3 py-2 rounded-md bg-[#0f1420] border border-white/10 outline-none text-white text-[13px]"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Mô tả bổ sung…"
                />
              </div>

              {/* Banner preview nhỏ */}
              <div className="grid grid-cols-[120px_1fr] gap-8 items-start">
                <div>
                  <div className="text-[11px] text-white/60 mb-1">
                    Thumbnail
                  </div>
                  <div className="w-[120px] h-[72px] rounded-md overflow-hidden border border-white/10 bg-[#0f1420]">
                    {bannerPreview ? (
                      <img
                        src={bannerPreview}
                        alt="banner"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/40 text-xs">
                        No image
                      </div>
                    )}
                  </div>
                </div>
                <div className="pt-5">
                  <label className="inline-flex items-center px-3 py-1.5 rounded-md bg-white text-black text-xs cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => setBannerFile(e.target.files?.[0] || null)}
                    />
                    Chọn ảnh…
                  </label>
                  {bannerFile && (
                    <button
                      className="ml-3 text-xs text-white/60 underline"
                      onClick={() => setBannerFile(null)}
                    >
                      Huỷ ảnh mới
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB: Phần post */}
          {activeTab === "Phần post" && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-white/60">Chế độ:</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setMode("PDF")}
                    className={
                      "px-2.5 py-1 rounded-md text-[12px] border " +
                      (mode === "PDF"
                        ? "bg-white text-black border-white"
                        : "bg-transparent text-white/80 border-white/20")
                    }
                  >
                    PDF
                  </button>
                  <button
                    onClick={() => setMode("WORD/HTML")}
                    className={
                      "px-2.5 py-1 rounded-md text-[12px] border " +
                      (mode === "WORD/HTML"
                        ? "bg-white text-black border-white"
                        : "bg-transparent text-white/80 border-white/20")
                    }
                  >
                    WORD/HTML
                  </button>
                </div>
              </div>

              {mode === "PDF" ? (
                <div>
                  <label className={labelCls}>Upload file (PDF)</label>
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
                    className="block w-full text-[13px] text-white/80 file:mr-3 file:px-3 file:py-1.5 file:rounded-md file:border-0 file:bg-white file:text-black"
                  />
                  <p className="text-[11px] text-white/40 mt-1">
                    Chỉ .pdf, tối đa 10MB. Để trống nếu muốn giữ file cũ.
                  </p>
                </div>
              ) : (
                <div>
                  <label className={labelCls}>Write content (HTML)</label>
                  <textarea
                    rows={8}
                    className="w-full px-3 py-2 rounded-md bg-[#0f1420] border border-white/10 outline-none text-white text-[13px]"
                    value={contentHtml}
                    onChange={(e) => setContentHtml(e.target.value)}
                    placeholder="Nhập nội dung HTML…"
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* footer */}
        <div className="flex items-center justify-end gap-2 px-3 py-2 border-t border-white/10">
          <button
            className="h-[34px] px-3 rounded-md bg-[#2b3442] text-white/90 hover:bg-[#25303e] text-[13px]"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="h-[34px] px-3 rounded-md bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-[13px] disabled:opacity-50"
            onClick={handleSubmit}
            disabled={
              activeTab === "Thông tin post" ? !canSaveInfo : !canSavePost
            }
          >
            Save changes
          </button>
        </div>
      </div>
    </div>
  );
}
