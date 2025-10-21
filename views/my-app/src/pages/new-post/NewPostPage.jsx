import React, { useEffect, useMemo, useState } from "react";
import FormField from "../../components/new-post/FormField";
import FileUpload from "../../components/new-post/FileUpload";
import FilePreview from "../../components/new-post/FilePreview";
import postService from "../../services/postService";
import albumService from "../../services/albumService";
import hashtagService from "../../services/hashtagService";
import Toast from "../../components/common/Toast";
import RichTextEditor from "../../components/new-post/RichTextEditor";
import categoryServices from "../../services/categoryServices";
import aiService from "../../services/aiService";

const NewPostPage = () => {
  const [mode, setMode] = useState("pdf");
  const [mainFile, setMainFile] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [editorHtml, setEditorHtml] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);

  // ⛔ trạng thái bị từ chối từ backend
  const [isRejected, setIsRejected] = useState(false);
  const [rejectedMsg, setRejectedMsg] = useState("");

  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState({ open: false, message: "", type: "success" });
  const showToast = (message, type = "success") => setToast({ open: true, message, type });

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

  /* ---------------- Hashtags: mỗi khoảng trắng hoặc dấu phẩy => tạo 1 hashtag ---------------- */
  const [hashtagInput, setHashtagInput] = useState(""); // token đang gõ
  const [tags, setTags] = useState([]); // danh sách hashtag đã “đóng”

  // Chuẩn hoá hashtag: bỏ dấu #, bỏ dấu tiếng Việt, thường hoá, thay khoảng trắng -> "-", bỏ ký tự lạ
  const normalizeTag = (raw = "") => {
    const s = String(raw || "")
      .trim()
      .replace(/^#+/, "");
    // bỏ dấu tiếng Việt (nếu cần)
    const noAccent = s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const cleaned = noAccent
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\p{L}\p{N}_-]/gu, "");
    return cleaned;
  };

  const addTag = (raw) => {
    const t = normalizeTag(raw);
    if (!t) return;
    if (!tags.includes(t)) setTags((prev) => [...prev, t]);
  };

  const removeTag = (t) => setTags((prev) => prev.filter((x) => x !== t));

  // Khi người dùng gõ: nếu ký tự cuối là " " hoặc "," => tạo hashtag mới
  const onHashtagChange = (e) => {
    const v = e.target.value;
    if (/[,\s]$/.test(v)) {
      addTag(v.slice(0, -1));
      setHashtagInput("");
    } else {
      setHashtagInput(v);
    }
  };

  // Enter hoặc Tab cũng sẽ “đóng” hashtag
  const onHashtagKeyDown = (e) => {
    if (e.key === "Enter" || e.key === "Tab" || e.key === ",") {
      e.preventDefault();
      if (hashtagInput.trim()) {
        addTag(hashtagInput);
        setHashtagInput("");
      }
    } else if (e.key === "Backspace" && !hashtagInput && tags.length > 0) {
      // backspace khi input trống -> pop tag cuối
      e.preventDefault();
      setTags((prev) => prev.slice(0, -1));
    }
  };

  // Blur cũng “đóng” hashtag nếu còn token
  const onHashtagBlur = () => {
    if (hashtagInput.trim()) {
      addTag(hashtagInput);
      setHashtagInput("");
    }
  };
  /* ------------------------------------------------------------------------------------------- */

  // load options
  useEffect(() => {
    const loadAll = async () => {
      try {
        const [cats, albs, tags] = await Promise.all([
          categoryServices
            .list()
            .catch((e) => (setOptErrors((p) => ({ ...p, categories: e.message })), [])),
          albumService
            .listMyAlbums()
            .catch((e) => (setOptErrors((p) => ({ ...p, albums: e.message })), [])),
          hashtagService
            .list()
            .catch((e) => (setOptErrors((p) => ({ ...p, hashtags: e.message })), [])),
        ]);

        const normCats = (Array.isArray(cats) ? cats : [])
          .map((c) => ({ id: c.id ?? c.category_id, name: c.name ?? c.category_name }))
          .filter((x) => x.id && x.name);
        setCategories(normCats);

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

  useEffect(() => {
    setErrors({});
    if (mode !== "pdf") setMainFile(null);
  }, [mode]);

  const validate = () => {
    const e = {};
    if (!newPost.title.trim()) e.title = "Title là bắt buộc";
    if (!newPost.category) e.category = "Hãy chọn Category";

    // ⛔ nếu backend đã reject thì chặn submit
    if (isRejected) e.summary = rejectedMsg || "Bài viết không được duyệt – không thể submit";

    if (mode === "pdf") {
      if (!mainFile) e.mainFile = "Cần upload file chính (.pdf)";
      if (mainFile && mainFile.type !== "application/pdf") e.mainFile = "File chính phải là PDF";
    } else {
      const html = (editorHtml || "").replace(/<[^>]*>/g, "").trim();
      if (!html) e.editor = "Nội dung bài viết không được để trống";
    }
    if (thumbnailFile && !/^image\//.test(thumbnailFile.type)) e.thumbnailFile = "Thumbnail phải là ảnh";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // chuẩn hoá tên để map category từ AI
  const normalizeName = (s = "") =>
    s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/\s+/g, " ").trim();

  const getAiCategoryName = (data = {}) => data.category ?? data.category_name ?? "";
  const findCategoryIdByName = (name) => {
    const norm = normalizeName(name);
    if (!norm) return "";
    const found = categories.find((c) => normalizeName(c.name) === norm);
    return found?.id || "";
  };

  const [aiCategoryName, setAiCategoryName] = useState("");

  const handleSummarize = async (file) => {
    if (!file) return;
    if (file.type !== "application/pdf") {
      showToast("File chính phải là PDF", "error");
      return;
    }
    setIsSummarizing(true);
    setIsRejected(false);
    setRejectedMsg("");
    setNewPost((p) => ({ ...p, summary: "⏳ Đang tóm tắt..." }));
    try {
      const ctrl = new AbortController();
      const data = await aiService.summarizePDF(file, ctrl.signal);

      // ⛔ Nếu backend báo từ chối, không hiển thị summary
      if (data?.checkstatus === 0 || data?.status === "rejected") {
        setIsRejected(true);
        setRejectedMsg(data?.message || "Bài viết không được duyệt.");
        setNewPost((p) => ({ ...p, summary: "" }));
        showToast(data?.message || "❌ Bài viết không được duyệt", "error");
        return; // dừng ở đây, không map category/summary
      }

      const aiCatName = getAiCategoryName(data);
      let next = { ...newPost, summary: data.summary || "" };

      const mappedId = findCategoryIdByName(aiCatName);
      if (mappedId) next.category = mappedId;
      else setAiCategoryName(aiCatName || "");

      setNewPost(next);
      showToast("✅ Đã tóm tắt tự động!", "success");
    } catch (err) {
      console.error("AI summarize error:", err);
      showToast("❌ Lỗi tóm tắt tự động", "error");
      setNewPost((p) => ({ ...p, summary: "(Không thể kết nối AI)" }));
    } finally {
      setIsSummarizing(false);
    }
  };

  useEffect(() => {
    if (!loadingOpts.categories && aiCategoryName && !newPost.category) {
      const id = findCategoryIdByName(aiCategoryName);
      if (id) setNewPost((p) => ({ ...p, category: id }));
    }
  }, [loadingOpts.categories, aiCategoryName, categories, newPost.category]);

  const handleSubmit = async () => {
    // chốt token còn lại trước khi submit
    if (hashtagInput.trim()) {
      addTag(hashtagInput);
      setHashtagInput("");
    }
    if (!validate()) return;

    try {
      setSubmitting(true);

      const hashtagsForSubmit = tags.join(","); // gửi dạng "ai,ml,react"

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

      const payload =
        mode === "pdf"
          ? { ...basePayload, content_file: mainFile || undefined }
          : { ...basePayload, content: editorHtml || "", content_file: undefined };

      const res = await postService.create(payload);
      const postId = res?.post_id ?? res?.data?.post_id;
      if (!postId) throw new Error(res?.message || "Không tạo được post, postId rỗng");

      showToast("Tạo bài viết thành công!", "success");
      // reset
      setNewPost({ title: "", category: "", album: "", hashtagIds: [], summary: "", description: "" });
      setTags([]);
      setHashtagInput("");
      setMainFile(null);
      setThumbnailFile(null);
      setEditorHtml("");
      setErrors({});
      setIsRejected(false);
      setRejectedMsg("");
    } catch (err) {
      console.error("Create post failed:", err);
      showToast(err?.message || "Tạo bài viết thất bại!", "error");
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
    if (loadingOpts.categories) return [<option key="loading">Loading...</option>];
    if (optErrors.categories) return [<option key="err">Lỗi tải categories</option>];
    return [<option key="" value="">Chọn category</option>, ...renderOptions(categories)];
  }, [loadingOpts.categories, optErrors.categories, categories]);

  const albOptions = useMemo(() => {
    if (loadingOpts.albums) return [<option key="loading">Loading...</option>];
    if (optErrors.albums) return [<option key="err">Lỗi tải albums</option>];
    return [<option key="" value="">Chọn album</option>, ...renderOptions(albums)];
  }, [loadingOpts.albums, optErrors.albums, albums]);

  return (
    <div className="bg-[var(--color-bg)] p-8 rounded-lg border border-[var(--color-header-border)] text-[var(--color-text)]">
      <div className="mb-4 flex gap-3">
        <button
          className={`px-4 py-1 rounded-lg border ${mode === "pdf" ? "bg-[var(--color-text)] text-black" : "text-[var(--color-text)] border-white/10"}`}
          onClick={() => setMode("pdf")}
          type="button"
        >
          PDF
        </button>
        <button
          className={`px-4 py-1 rounded-lg border ${mode === "word" ? "bg-[var(--color-text)] text-black" : "text-[var(--color-text)] border-white/10"}`}
          onClick={() => setMode("word")}
          type="button"
        >
          WORD
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-10 gap-y-8">
        {/* LEFT */}
        <div className="flex flex-col gap-8">
          <FormField
            label="Post title"
            placeholder="Post title..."
            value={newPost.title}
            onChange={(e) => handleChange("title", e.target.value)}
            error={errors.title}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <FormField
              label="Category"
              type="select"
              value={newPost.category}
              onChange={(e) => handleChange("category", e.target.value)}
              error={errors.category}
            >
              {catOptions}
            </FormField>

            <FormField
              label="Album"
              type="select"
              value={newPost.album}
              onChange={(e) => handleChange("album", e.target.value)}
            >
              {albOptions}
            </FormField>
          </div>

          {mode === "pdf" ? (
            <>
              {/* cảnh báo nếu bị từ chối */}
              {isRejected && (
                <div className="rounded-md border border-red-500/40 bg-red-500/10 text-red-300 px-3 py-2 text-sm">
                  {rejectedMsg || "Bài viết không được duyệt."}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <FileUpload
                    title="Upload file"
                    subtitle="Chọn file PDF"
                    buttonText="Browse my file"
                    note="Only support .pdf file"
                    onFileSelect={(file) => {
                      setMainFile(file);
                      // reset trạng thái reject khi chọn file mới
                      setIsRejected(false);
                      setRejectedMsg("");
                      if (file && file.type === "application/pdf") handleSummarize(file);
                    }}
                  />
                  {errors.mainFile && <p className="text-sm text-red-400 mt-2">{errors.mainFile}</p>}
                  {mainFile && <p className="text-xs text-[var(--color-text-muted)] mt-1">Đã chọn: {mainFile.name}</p>}
                </div>

                <div>
                  <FileUpload
                    title="Upload thumbnail"
                    subtitle="Chọn ảnh thumbnail"
                    buttonText="Browse my file"
                    note="Hỗ trợ .jpeg, .jpg, .png"
                    onFileSelect={(file) => setThumbnailFile(file)}
                  />
                  {errors.thumbnailFile && <p className="text-sm text-red-400 mt-2">{errors.thumbnailFile}</p>}
                  {thumbnailFile && <p className="text-xs text-[var(--color-text-muted)] mt-1">Đã chọn: {thumbnailFile.name}</p>}
                </div>
              </div>

              <FormField
                label="Your summary"
                type="textarea"
                placeholder="AI sẽ tự điền tóm tắt tại đây..."
                rows={5}
                value={newPost.summary}
                onChange={(e) => handleChange("summary", e.target.value)}
                error={errors.summary}
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
                <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                  Write content
                </label>
                <RichTextEditor value={editorHtml} onChange={setEditorHtml} />
                {errors.editor && <p className="text-sm text-red-400 mt-2">{errors.editor}</p>}
              </div>
              <div>
                <FileUpload
                  title="Upload thumbnail"
                  subtitle="Chọn ảnh thumbnail"
                  buttonText="Browse"
                  note="Hỗ trợ .jpeg, .jpg, .png"
                  onFileSelect={(file) => setThumbnailFile(file)}
                />
              </div>
            </>
          )}
        </div>

        {/* RIGHT */}
        <div className="flex flex-col gap-8">
          {/* Hashtags as chips + input */}
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
              Hashtags
            </label>

            <div className="w-full bg-[var(--color-input-bg)] border border-[var(--color-header-border)] rounded-lg p-2 flex flex-wrap gap-2">
              {tags.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-2 px-2 py-1 rounded-md bg-[var(--color-surface)] text-sm"
                >
                  #{t}
                  <button
                    type="button"
                    className="text-[var(--color-text-muted)] hover:text-[var(--color-accent)]"
                    onClick={() => removeTag(t)}
                    aria-label={`Remove ${t}`}
                  >
                    ×
                  </button>
                </span>
              ))}

              <input
                value={hashtagInput}
                onChange={onHashtagChange}
                onKeyDown={onHashtagKeyDown}
                onBlur={onHashtagBlur}
                placeholder={tags.length ? "Thêm hashtag..." : "#ai (gõ dấu cách hoặc phẩy để tạo)"}
                className="flex-1 min-w-[140px] bg-transparent outline-none text-[var(--color-text)] placeholder-[var(--color-text-muted)] p-1"
              />
            </div>

            <p className="text-xs text-[var(--color-info)] mt-1">
              Mẹo: gõ <kbd>Space</kbd>, <kbd>,</kbd>, <kbd>Enter</kbd> hoặc <kbd>Tab</kbd> để tạo 1 hashtag.
            </p>
          </div>

          {mode === "pdf" ? (
            <div className="flex-grow">
              <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">File Preview</label>
              <FilePreview file={mainFile} />
            </div>
          ) : (
            <div className="text-[var(--color-text-muted)] text-sm">WORD mode – preview disabled</div>
          )}
        </div>
      </div>

      <div className="flex justify-end mt-8">
        <button
          onClick={handleSubmit}
          disabled={submitting || isSummarizing || loadingOpts.categories || loadingOpts.albums || isRejected}
          className="bg-[var(--color-text)] hover:bg-white disabled:opacity-60 text-black font-bold py-2 px-8 rounded-lg transition-colors"
        >
          {submitting ? "Submitting..." : isSummarizing ? "Summarizing..." : "Submit"}
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

export default NewPostPage;
