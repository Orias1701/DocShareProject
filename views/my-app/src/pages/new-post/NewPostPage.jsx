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
import aiService from "../../services/aiService"; // ✅ tích hợp AI

const NewPostPage = () => {
  const [mode, setMode] = useState("pdf");
  const [mainFile, setMainFile] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [editorHtml, setEditorHtml] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);

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

  // Hashtag input
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

  // === Load dropdown options
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

  // === Khi đổi mode
  useEffect(() => {
    setErrors({});
    if (mode === "pdf") setEditorHtml((h) => h);
    else setMainFile(null);
  }, [mode]);

  // === Validate
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
  // Chuẩn hoá chuỗi: bỏ dấu, lowercase, gộp khoảng trắng
const normalizeName = (s = "") =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();

// Lấy tên category từ response AI (hỗ trợ cả 'category' lẫn 'category_name')
const getAiCategoryName = (data = {}) => data.category ?? data.category_name ?? "";

  // ====== AI summarize + chọn category ======
  const findCategoryIdByName = (name) => {
    const norm = normalizeName(name);
    if (!norm) return "";
    const found = categories.find((c) => normalizeName(c.name) === norm);
    return found?.id || "";
  };
  

  // Lưu lại tên category AI trả về, để map sang ID khi categories đã tải xong
  const [aiCategoryName, setAiCategoryName] = useState("");

  const handleSummarize = async (file) => {
    if (!file) return;
    if (file.type !== "application/pdf") {
      showToast("File chính phải là PDF", "error");
      return;
    }
    setIsSummarizing(true);
    setNewPost((p) => ({ ...p, summary: "⏳ Đang tóm tắt..." }));
    try {
      const ctrl = new AbortController();
      const data = await aiService.summarizePDF(file, ctrl.signal);
  
      console.log("📄 AI trả về:", data);
  
      // Lấy tên category từ AI: ưu tiên category, fallback category_name
      const aiCatName = getAiCategoryName(data);
      console.log("🏷️ AI category name:", aiCatName);
  
      let next = {
        ...newPost,
        summary: data.summary || "",
      };
  
      const mappedId = findCategoryIdByName(aiCatName);
      if (mappedId) {
        console.log("✅ Tìm thấy category ID:", mappedId, "←", aiCatName);
        next.category = mappedId;
      } else {
        console.warn("⚠️ Không khớp category AI:", aiCatName);
        setAiCategoryName(aiCatName || "");
      }
  
      setNewPost(next);
      showToast("✅ Đã tóm tắt tự động!", "success");
    } catch (err) {
      console.error("❌ AI summarize error:", err);
      showToast("❌ Lỗi tóm tắt tự động", "error");
      setNewPost((p) => ({ ...p, summary: "(Không thể kết nối AI)" }));
    } finally {
      setIsSummarizing(false);
    }
  };
  

  // Khi categories đã tải xong, nếu AI có tên category mà chưa set ID thì map ngay
  useEffect(() => {
    if (!loadingOpts.categories && aiCategoryName && !newPost.category) {
      const id = findCategoryIdByName(aiCategoryName);
      if (id) {
        console.log("🔁 Map lại category từ AI:", aiCategoryName, "→", id);
        setNewPost((p) => ({ ...p, category: id }));
      } else {
        console.warn("⚠️ Không tìm thấy category tương ứng:", aiCategoryName);
      }
    }
  }, [loadingOpts.categories, aiCategoryName, categories]); // eslint-disable-line
  

  // === Submit post
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
      if (mode === "pdf") payload.content_file = mainFile || undefined;
      else {
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
    <div className="bg-[#0D1117] p-8 rounded-lg border border-[#2d2d33] text-white">
      <div className="mb-4 flex gap-3">
        <button
          className={`px-4 py-1 rounded-lg border ${mode === "pdf" ? "bg-white text-black" : "text-white border-white/10"}`}
          onClick={() => setMode("pdf")}
          type="button"
        >
          PDF
        </button>
        <button
          className={`px-4 py-1 rounded-lg border ${mode === "word" ? "bg-white text-black" : "text-white border-white/10"}`}
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <FileUpload
                    title="Upload file"
                    subtitle="Chọn file PDF"
                    buttonText="Browse my file"
                    note="Only support .pdf file"
                    // Nếu component FileUpload hỗ trợ accept, nên thêm:
                    // accept=".pdf,application/pdf"
                    onFileSelect={(file) => {
                      setMainFile(file);
                      if (file && file.type === "application/pdf") handleSummarize(file);
                    }}
                  />
                  {errors.mainFile && <p className="text-sm text-red-400 mt-2">{errors.mainFile}</p>}
                  {mainFile && <p className="text-xs text-gray-400 mt-1">Đã chọn: {mainFile.name}</p>}
                </div>

                <div>
                  <FileUpload
                    title="Upload thumbnail"
                    subtitle="Chọn ảnh thumbnail"
                    buttonText="Browse my file"
                    note="Hỗ trợ .jpeg, .jpg, .png"
                    // accept="image/*"
                    onFileSelect={(file) => setThumbnailFile(file)}
                  />
                  {errors.thumbnailFile && <p className="text-sm text-red-400 mt-2">{errors.thumbnailFile}</p>}
                  {thumbnailFile && <p className="text-xs text-gray-400 mt-1">Đã chọn: {thumbnailFile.name}</p>}
                </div>
              </div>

              <FormField
                label="Your summary"
                type="textarea"
                placeholder="AI sẽ tự điền tóm tắt tại đây..."
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
                  // accept="image/*"
                  onFileSelect={(file) => setThumbnailFile(file)}
                />
              </div>
            </>
          )}
        </div>

        {/* RIGHT */}
        <div className="flex flex-col gap-8">
          <FormField
            label="Hashtags"
            placeholder="#ai, #ml"
            value={hashtagInput}
            onChange={(e) => setHashtagInput(formatHashtagInput(e.target.value))}
          />
          {mode === "pdf" ? (
            <div className="flex-grow">
              <label className="block text-sm font-medium text-gray-300 mb-2">File Preview</label>
              <FilePreview file={mainFile} />
            </div>
          ) : (
            <div className="text-white/70 text-sm">WORD mode – preview disabled</div>
          )}
        </div>
      </div>

      <div className="flex justify-end mt-8">
        <button
          onClick={handleSubmit}
          disabled={submitting || isSummarizing || loadingOpts.categories || loadingOpts.albums}
          className="bg-gray-200 hover:bg-white disabled:opacity-60 text-black font-bold py-2 px-8 rounded-lg transition-colors"
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
