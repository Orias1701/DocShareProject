// src/pages/posts/NewPostPage.jsx
import React, { useEffect, useMemo, useState } from 'react';
import FormField from '../../components/new-post/FormField';
import FileUpload from '../../components/new-post/FileUpload';
import FilePreview from '../../components/new-post/FilePreview';
import postService from '../../services/postService';
import albumService from '../../services/albumService';
import hashtagService from '../../services/hashtagService';
import Toast from '../../components/common/Toast';

const NewPostPage = () => {
  const [mainFile, setMainFile] = useState(null);          // PDF
  const [thumbnailFile, setThumbnailFile] = useState(null);// Image
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState({ open: false, message: "", type: "success" });
  const showToast = (message, type = "success") => {
    setToast({ open: true, message, type });
  };

  // ▼ state dữ liệu động
  const [categories, setCategories] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [hashtags, setHashtags] = useState([]); // [{id,name}] sau normalize

  const [loadingOpts, setLoadingOpts] = useState({
    categories: true,
    albums: true,
    hashtags: true,
  });
  const [optErrors, setOptErrors] = useState({}); // lỗi khi load options

  const [newPost, setNewPost] = useState({
    title: '',
    category: '',         // id
    album: '',            // id
    hashtagIds: [],       // (giữ lại nếu nơi khác cần), nhưng sẽ parse từ hashtagInput khi submit
    summary: '',
    description: '',
  });

  const handleChange = (name, value) => {
    setNewPost(prev => ({ ...prev, [name]: value }));
  };

  // 👇👇👇 Hashtag input: dùng raw string để người dùng gõ, giữ dấu cách/phẩy 👇👇👇
  const [hashtagInput, setHashtagInput] = useState(''); // 👈 UPDATED

  // 1) Format để HIỂN THỊ: thêm # cho từng từ; giữ dấu cách/comma cuối để gõ tiếp
  const formatHashtagInput = (raw) => { // 👈 UPDATED
    const s = String(raw ?? '');
    const endsWithDelim = /[,\s]$/.test(s); // có đang gõ dấu phân tách không
    const parts = s
      .split(/[,\s]+/)
      .map(x => x.trim())
      .filter(Boolean)
      .map(x => x.replace(/^#+/, ''))   // bỏ # thừa ở đầu 1 token
      .map(x => x.toLowerCase())
      .map(x => (x ? `#${x}` : ''));
    let out = parts.filter(Boolean).join(' ');
    if (endsWithDelim) out += ' '; // giữ khoảng trắng khi người dùng vừa nhấn space/comma
    return out;
  };

  // 2) Parse để GỬI BE (lúc submit): cắt theo space/comma, thêm #, gọn ký tự
  const parseHashtagForSubmit = (raw) => { // 👈 UPDATED
    return Array.from(
      new Set(
        String(raw || '')
          .split(/[,\s]+/)
          .map(s => s.trim())
          .filter(Boolean)
          .map(s => s.toLowerCase())
          .map(s => s.replace(/^#+/, ''))         // bỏ mọi # đầu vào
          .map(s => s.replace(/\s+/g, '-'))       // thay space giữa từ thành '-'
          .map(s => s.replace(/[^\p{L}\p{N}_-]/gu, '')) // lọc ký tự lạ
          .filter(Boolean)
          .map(s => `#${s}`)
      )
    );
  };

  useEffect(() => {
    const loadAll = async () => {
      try {
        const [cats, albs, tags] = await Promise.all([
          postService.listCategories().catch(e => { 
            setOptErrors(p => ({...p, categories: e.message})); 
            return []; 
          }),
          albumService.listMyAlbums().catch(e => { 
            setOptErrors(p => ({...p, albums: e.message})); 
            return []; 
          }),
          hashtagService.list().catch(e => {
            setOptErrors(p => ({...p, hashtags: e.message}));
            return [];
          }),
        ]);

        setCategories(Array.isArray(cats) ? cats : []);

        const normAlbums = (Array.isArray(albs) ? albs : [])
          .map(a => ({ id: a.id ?? a.album_id, name: a.name ?? a.album_name }))
          .filter(x => x.id && x.name);
        setAlbums(normAlbums);

        const normTags = (Array.isArray(tags) ? tags : [])
          .map(t => ({ id: t.id ?? t.hashtag_id, name: t.name ?? t.hashtag_name }))
          .filter(x => x.id && x.name);
        setHashtags(normTags);
      } finally {
        setLoadingOpts({ categories: false, albums: false, hashtags: false });
      }
    };
    loadAll();
  }, []);

  const validate = () => {
    const e = {};
    if (!newPost.title.trim()) e.title = 'Title là bắt buộc';
    if (!newPost.category) e.category = 'Hãy chọn Category';
    if (!mainFile) e.mainFile = 'Cần upload file chính (.pdf)';
    if (mainFile && mainFile.type !== 'application/pdf') e.mainFile = 'File chính phải là PDF';
    if (thumbnailFile && !/^image\//.test(thumbnailFile.type)) e.thumbnailFile = 'Thumbnail phải là ảnh';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
  
    try {
      setSubmitting(true);
  
      // 1️⃣ Parse hashtag từ input
      const uniqueHashtags = parseHashtagForSubmit(hashtagInput); // ["#ai", "#ml", ...]
  
      // 2️⃣ Tạo post
      const res = await postService.create({
        title: newPost.title,
        content: newPost.description || "",
        description: newPost.summary || "",
        summary: newPost.summary || "",
        category_id: newPost.category || "",
        album_id: newPost.album || "",
        banner: thumbnailFile || undefined,
        content_file: mainFile || undefined,
      });
  
      const postId = res?.post_id ?? res?.data?.post_id;
      if (!postId) throw new Error("Không tạo được post, postId rỗng");
  
      // 3️⃣ Tạo/gán hashtag cho post
      for (const name of uniqueHashtags) {
        try {
          // Gọi post_hashtagService để tạo hashtag nếu cần
          const createdTag = await post_hashtagService.create(postId, [name]);
          // createdTag.data có thể là mảng các hashtag vừa tạo
        } catch (e) {
          console.warn("Tạo/gán hashtag lỗi:", name, e);
        }
      }
  
      showToast('Tạo bài viết và hashtag thành công!', 'success');
  
      // 4️⃣ Reset form
      setNewPost({
        title: '',
        category: '',
        album: '',
        hashtagIds: [],
        summary: '',
        description: '',
      });
      setHashtagInput('');
      setMainFile(null);
      setThumbnailFile(null);
      setErrors({});
    } catch (err) {
      console.error("Create post failed:", err);
      showToast(err?.message || 'Tạo bài viết thất bại. Vui lòng thử lại!', 'error');
    } finally {
      setSubmitting(false);
    }
  };
  

  // helper render options (đã normalized: [{id,name}])
  const renderOptions = (items) =>
    items.map(it => (
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-10 gap-y-8">
        {/* === CỘT TRÁI === */}
        <div className="flex flex-col gap-8">
          <FormField
            label="Post title"
            placeholder="Post title..."
            value={newPost.title}
            onChange={e => handleChange('title', e.target.value)}
            error={errors.title}
          />

          <FormField
            label="Category"
            type="select"
            value={newPost.category}
            onChange={e => handleChange('category', e.target.value)}
            error={errors.category}
          >
            {catOptions}
          </FormField>

          {/* Upload files */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <FileUpload
                title="Upload file"
                subtitle="Or if you prefer"
                buttonText="Browse my file"
                note="Only support .pdf file"
                onFileSelect={file => setMainFile(file)}
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
                onFileSelect={file => setThumbnailFile(file)}
              />
              {errors.thumbnailFile && <p className="text-sm text-red-400 mt-2">{errors.thumbnailFile}</p>}
              {thumbnailFile && <p className="text-xs text-gray-400 mt-1">Đã chọn: {thumbnailFile.name}</p>}
            </div>
          </div>

          <FormField
            label="Your summary"
            type="textarea"
            placeholder="Your summary will be shown here"
            rows={5}
            value={newPost.summary}
            onChange={e => handleChange('summary', e.target.value)}
          />
          <FormField
            label="Description"
            type="textarea"
            placeholder="Description..."
            rows={3}
            value={newPost.description}
            onChange={e => handleChange('description', e.target.value)}
          />
        </div>

        {/* === CỘT PHẢI === */}
        <div className="flex flex-col gap-8">
          <FormField
            label="Album"
            type="select"
            value={newPost.album}
            onChange={e => handleChange('album', e.target.value)}
          >
            {albOptions}
          </FormField>

          {/* Hashtag: tự thêm #; phân tách bằng space hoặc comma */}
          <FormField
            label="Hashtags"
            placeholder="#ai, #ml   hoặc   ai ml"
            value={hashtagInput} // 👈 UPDATED (hiển thị raw)
            onChange={e => setHashtagInput(formatHashtagInput(e.target.value))} // 👈 UPDATED
          >
            {loadingOpts.hashtags && <option>Loading hashtags...</option>}
            {!loadingOpts.hashtags && optErrors.hashtags && <option>Không tải được hashtags</option>}
            {!loadingOpts.hashtags && !optErrors.hashtags &&
              hashtags.map(h => (
                <option key={h.id} value={h.name}>{h.name}</option>
              ))
            }
          </FormField>

          <div className="flex-grow flex flex-col h-full">
            <label className="block text-sm font-medium text-gray-300 mb-2">File Preview</label>
            <FilePreview file={mainFile} />
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
          {submitting ? 'Submitting...' : 'Submit'}
        </button>
      </div>

      {/* Toast */}
      <Toast
        open={toast.open}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast(t => ({ ...t, open: false }))}
      />
    </div>
  );
};

export default NewPostPage;
