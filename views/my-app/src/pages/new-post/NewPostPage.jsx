// src/pages/posts/NewPostPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import FormField from "../../components/new-post/FormField";
import FileUpload from "../../components/new-post/FileUpload";
import FilePreview from "../../components/new-post/FilePreview";
import postService from "../../services/postService";
import albumService from "../../services/albumService";
import hashtagService from "../../services/hashtagService";
import Toast from "../../components/common/Toast";
import RichTextEditor from "../../components/post/RichTextEditor";

const NewPostPage = () => {
  // ===== Mode: pdf | word
  const [mode, setMode] = useState("pdf");

  const [mainFile, setMainFile] = useState(null); // PDF
  const [thumbnailFile, setThumbnailFile] = useState(null); // Image
  const [editorHtml, setEditorHtml] = useState(""); // WORD mode content

  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState({ open: false, message: "", type: "success" });
  const showToast = (message, type = "success") => setToast({ open: true, message, type });

  // ▼ options
  const [categories, setCategories] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [hashtags, setHashtags] = useState([]);
  const [loadingOpts, setLoadingOpts] = useState({ categories: true, albums: true, hashtags: true });
  const [optErrors, setOptErrors] = useState({});

  const [newPost, setNewPost] = useState({
    title: "",
    category: "",
    album: "",
    hashtagIds: [],
    summary: "",
    description: "",
  });

  const handleChange = (name, value) => setNewPost((prev) => ({ ...prev, [name]: value }));

  // === Hashtag input
  const [hashtagInput, setHashtagInput] = useState("");
  const formatHashtagInput = (raw) => {
    const s = String(raw ?? "");
    const endsWithDelim = /[,\s]$/.test(s);
    const parts = s
      .split(/[,\s]+/)
      .map((x) => x.trim())
      .filter(Boolean)
      .map((x) => x.replace(/^#+/, ""))
      .map((x) => x.toLowerCase())
      .map((x) => (x ? `#${x}` : ""));
    let out = parts.filter(Boolean).join(" ");
    if (endsWithDelim) out += " ";
    return out;
  };
  const parseHashtagForSubmit = (raw) =>
    Array.from(
      new Set(
        String(raw || "")
          .split(/[,\s]+/)
          .map((s) => s.trim())
          .filter(Boolean)
          .map((s) => s.toLowerCase())
          .map((s) => s.replace(/^#+/, ""))
          .map((s) => s.replace(/\s+/g, "-"))
          .map((s) => s.replace(/[^\p{L}\p{N}_-]/gu, ""))
          .filter(Boolean)
          .map((s) => `#${s}`)
      )
    );

  // === load options
  useEffect(() => {
    const loadAll = async () => {
      try {
        const [cats, albs, tags] = await Promise.all([
          postService
            .listCategories()
            .catch((e) => (setOptErrors((p) => ({ ...p, categories: e.message })), [])),
          albumService
            .listMyAlbums()
            .catch((e) => (setOptErrors((p) => ({ ...p, albums: e.message })), [])),
          hashtagService
            .list()
            .catch((e) => (setOptErrors((p) => ({ ...p, hashtags: e.message })), [])),
        ]);

        setCategories(Array.isArray(cats) ? cats : []);

        const normAlbums = (Array.isArray(albs) ? albs : [])
          .map((a) => ({ id: a.id ?? a.album_id, name: a.name ?? a.album_name }))
          .filter((x) => x.id && x.name);
        setAlbums(normAlbums);

        const normTags = (Array.isArray(tags) ? tags : [])
          .map((t) => ({ id: t.id ?? t.hashtag_id, name: t.name ?? t.hashtag_name }))
          .filter((x) => x.id && x.name);
        setHashtags(normTags);
      } finally {
        setLoadingOpts({ categories: false, albums: false, hashtags: false });
      }
    };
    loadAll();
  }, []);

  // === validate theo mode
  const validate = () => {
    const e = {};
    if (!newPost.title.trim()) e.title = "Title là bắt buộc";
    if (!newPost.category) e.category = "Hãy chọn Category";

    if (mode === "pdf") {
      if (!mainFile) e.mainFile = "Cần upload file chính (.pdf)";
      if (mainFile && mainFile.type !== "application/pdf") e.mainFile = "File chính phải là PDF";
    } else {
      const html = (editorHtml || "").replace(/<[^>]*>/g, "").trim();
      if (!html) e.editor = "Nội dung bài viết không được để trống";
    }

    if (thumbnailFile && !/^image\//.test(thumbnailFile.type))
      e.thumbnailFile = "Thumbnail phải là ảnh";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    try {
      setSubmitting(true);

      const hashtagsForSubmit = parseHashtagForSubmit(hashtagInput)
        .map((tag) => tag.substring(1))
        .join(",");

      const basePayload = {
        title: newPost.title,
        description: newPost.summary || "",
        summary: newPost.summary || "",
        content: newPost.description || "",
        category_id: newPost.category || "",
        album_id: newPost.album || "",
        hashtags: hashtagsForSubmit,
        banner: thumbnailFile || undefined,
      };

      let payload = { ...basePayload };

      if (mode === "pdf") {
        payload.content_file = mainFile || undefined;
      } else {
        payload.content = editorHtml || "";
        payload.content_file = undefined;
      }

      const res = await postService.create(payload);
      const postId = res?.post_id ?? res?.data?.post_id;
      if (!postId) throw new Error(res?.message || "Không tạo được post, postId rỗng");

      showToast("Tạo bài viết thành công!", "success");

      // reset
      setNewPost({ title: "", category: "", album: "", hashtagIds: [], summary: "", description: "" });
      setHashtagInput("");
      setMainFile(null);
      setThumbnailFile(null);
      setEditorHtml("");
      setErrors({});
    } catch (err) {
      console.error("Create post failed:", err);
      showToast(err?.message || "Tạo bài viết thất bại. Vui lòng thử lại!", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const renderOptions = (items) =>
    items.map((it) => (
      <option key={it.id} value={it.id}>
        {it.name}
      </option>
    ));

  const catOptions = useMemo(() => {
    if (loadingOpts.categories) return [<option key="loading">Loading categories...</option>];
    if (optErrors.categories) return [<option key="err">Không tải được categories</option>];
    return [<option key="" value="">Choose category to save post</option>, ...renderOptions(categories)];
  }, [loadingOpts.categories, optErrors.categories, categories]);

  const albOptions = useMemo(() => {
    if (loadingOpts.albums) return [<option key="loading">Loading albums...</option>];
    if (optErrors.albums) return [<option key="err">Không tải được albums</option>];
    return [<option key="" value="">Choose album to save post</option>, ...renderOptions(albums)];
  }, [loadingOpts.albums, optErrors.albums, albums]);

  return (
    <div className="bg-[#1621] p-8 rounded-lg border border-[#2d2d33]">
      {/* Toggle PDF / WORD */}
      <div className="mb-4 flex gap-3">
        <button
          className={`px-4 py-1 rounded-lg border border-white/10 ${mode === "pdf" ? "bg-white text-black" : "text-white hover:bg-white/10"}`}
          onClick={() => setMode("pdf")}
          type="button"
        >
          PDF
        </button>
        <button
          className={`px-4 py-1 rounded-lg border border-white/10 ${mode === "word" ? "bg-white text-black" : "text-white hover:bg-white/10"}`}
          onClick={() => setMode("word")}
          type="button"
        >
          WORD
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-10 gap-y-8">
        {/* === LEFT === */}
        <div className="flex flex-col gap-8">
          <FormField
            label="Post title"
            placeholder="Post title..."
            value={newPost.title}
            onChange={(e) => handleChange("title", e.target.value)}
            error={errors.title}
          />

          <FormField
            label="Category"
            type="select"
            value={newPost.category}
            onChange={(e) => handleChange("category", e.target.value)}
            error={errors.category}
          >
            {catOptions}
          </FormField>

          {mode === "pdf" ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <FileUpload
                    title="Upload file"
                    subtitle="Or if you prefer"
                    buttonText="Browse my file"
                    note="Only support .pdf file"
                    onFileSelect={(file) => setMainFile(file)}
                  />
                  {errors.mainFile && <p className="text-sm text-red-400 mt-2">{errors.mainFile}</p>}
                  {mainFile && <p className="text-xs text-gray-400 mt-1">Đã chọn: {mainFile.name}</p>}
                </div>

                <div>
                  <FileUpload
                    title="Upload thumbnail"
                    subtitle="Or if you prefer"
                    buttonText="Browse my file"
                    note="Support .jpeg, .jpg, .png, ..."
                    onFileSelect={(file) => setThumbnailFile(file)}
                  />
                  {errors.thumbnailFile && (
                    <p className="text-sm text-red-400 mt-2">{errors.thumbnailFile}</p>
                  )}
                  {thumbnailFile && (
                    <p className="text-xs text-gray-400 mt-1">Đã chọn: {thumbnailFile.name}</p>
                  )}
                </div>
              </div>

              <FormField
                label="Your summary"
                type="textarea"
                placeholder="Your summary will be shown here"
                rows={5}
                value={newPost.summary}
                onChange={(e) => handleChange("summary", e.target.value)}
              />
              <FormField
                label="Description"
                type="textarea"
                placeholder="Description..."
                rows={3}
                value={newPost.description}
                onChange={(e) => handleChange("description", e.target.value)}
              />
            </>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Write content (additional)
                </label>
                <RichTextEditor value={editorHtml} onChange={setEditorHtml} />
                {errors.editor && <p className="text-sm text-red-400 mt-2">{errors.editor}</p>}
              </div>

              <div>
                <FileUpload
                  title="Upload thumbnail"
                  subtitle="Or if you prefer"
                  buttonText="Browse my file"
                  note="Support .jpeg, .jpg, .png, ..."
                  onFileSelect={(file) => setThumbnailFile(file)}
                />
                {errors.thumbnailFile && (
                  <p className="text-sm text-red-400 mt-2">{errors.thumbnailFile}</p>
                )}
                {thumbnailFile && (
                  <p className="text-xs text-gray-400 mt-1">Đã chọn: {thumbnailFile.name}</p>
                )}
              </div>
            </>
          )}
        </div>

        {/* === RIGHT === */}
        <div className="flex flex-col gap-8">
          <FormField
            label="Album"
            type="select"
            value={newPost.album}
            onChange={(e) => handleChange("album", e.target.value)}
          >
            {albOptions}
          </FormField>

          {/* Hashtags */}
          <FormField
            label="Hashtags"
            placeholder="#ai, #ml   hoặc   ai ml"
            value={hashtagInput}
            onChange={(e) => setHashtagInput(formatHashtagInput(e.target.value))}
          >
            {loadingOpts.hashtags && <option>Loading hashtags...</option>}
            {!loadingOpts.hashtags && optErrors.hashtags && <option>Không tải được hashtags</option>}
            {!loadingOpts.hashtags &&
              !optErrors.hashtags &&
              hashtags.map((h) => (
                <option key={h.id} value={h.name}>
                  {h.name}
                </option>
              ))}
          </FormField>

          <div className="flex-grow flex flex-col h-full">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              File Preview
            </label>
            {mode === "pdf" ? (
              <FilePreview file={mainFile} />
            ) : (
              <>
                <FilePreview file={null} htmlContent={editorHtml} />
                <div className="flex-1 rounded-xl border border-white/10 bg-[#0D1117] p-4 text-sm text-white/70 mt-2">
                  Nội dung WORD sẽ được lưu dưới dạng HTML và hiển thị tại trang chi tiết bài viết.
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Submit */}
      <div className="flex justify-end mt-8">
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="bg-gray-200 hover:bg-white disabled:opacity-60 text-black font-bold py-2 px-8 rounded-lg transition-colors"
        >
          {submitting ? "Submitting..." : "Submit"}
        </button>
      </div>

      {/* Toast */}
      <Toast
        open={toast.open}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast((t) => ({ ...t, open: false }))}
      />
    </div>
  );
};

export default NewPostPage;
