// src/pages/posts/NewPostPage.jsx
import React, { useEffect, useMemo, useState } from 'react';
import FormField from '../../components/new-post/FormField';
import FileUpload from '../../components/new-post/FileUpload';
import FilePreview from '../../components/new-post/FilePreview';
import { postApi } from '../../services/postService';

const NewPostPage = () => {
  const [mainFile, setMainFile] = useState(null);          // PDF
  const [thumbnailFile, setThumbnailFile] = useState(null);// Image
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // ▼ state dữ liệu động
  const [categories, setCategories] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [hashtags, setHashtags] = useState([]);

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
    hashtagIds: [],       // array id cho đa chọn
    summary: '',
    description: '',
  });

  const handleChange = (name, value) => {
    setNewPost(prev => ({ ...prev, [name]: value }));
  };

  // ▼ fetch dữ liệu động từ DB
  useEffect(() => {
    const loadAll = async () => {
      try {
        console.log("Loading categories, albums, hashtags...");
        const [cats, albs, tags] = await Promise.all([
          postApi.listCategories().catch(e => { 
            console.error("Lỗi load categories:", e);
            setOptErrors(p => ({...p, categories: e.message})); 
            return []; 
          }),
          postApi.listAlbums().catch(e => { 
            console.error("Lỗi load albums:", e);
            setOptErrors(p => ({...p, albums: e.message})); 
            return []; 
          }),
          postApi.listHashtags().catch(e => { 
            console.error("Lỗi load hashtags:", e);
            setOptErrors(p => ({...p, hashtags: e.message})); 
            return []; 
          }),
        ]);
        console.log("Categories:", cats);
        console.log("Albums:", albs);
        console.log("Hashtags:", tags);

        setCategories(Array.isArray(cats) ? cats : []);
        setAlbums(Array.isArray(albs) ? albs : []);
        setHashtags(Array.isArray(tags) ? tags : []);
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

    console.log("Validate result:", e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    console.log("Submit pressed, newPost:", newPost);
    if (!validate()) {
      console.warn("Validation failed:", errors);
      return;
    }

    const fd = new FormData();
    fd.append('title', newPost.title);
    if (newPost.summary) fd.append('summary', newPost.summary);
    if (newPost.description) fd.append('content', newPost.description);
    if (newPost.category) fd.append('category_id', newPost.category);
    if (newPost.album) fd.append('album_id', newPost.album);

    if (newPost.hashtagIds?.length) {
      fd.append('hashtag_ids', newPost.hashtagIds.join(','));
    }

    if (mainFile) fd.append('content_file', mainFile);
    if (thumbnailFile) fd.append('banner', thumbnailFile);

    try {
      setSubmitting(true);
      console.log("Sending FormData...");
      const res = await postApi.create(fd);
      console.log('Create post result:', res);
      alert('Tạo bài viết thành công!');

      // reset
      setNewPost({
        title: '',
        category: '',
        album: '',
        hashtagIds: [],
        summary: '',
        description: '',
      });
      setMainFile(null);
      setThumbnailFile(null);
      setErrors({});
    } catch (err) {
      console.error("Create post failed:", err);
      alert('Tạo bài viết thất bại. Vui lòng thử lại!');
    } finally {
      setSubmitting(false);
    }
  };

  // helper render options
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
            value={newPost.album_id}
            onChange={e => handleChange('album', e.target.value)}
          >
            {albOptions}
          </FormField>

          {/* Hashtag: multi-select từ DB → lưu mảng id */}
          <FormField
            label="Hashtags"
            type="select"
            multiple
            value={newPost.hashtagIds}
            onChange={e =>
              handleChange(
                'hashtagIds',
                Array.from(e.target.selectedOptions).map(o => o.value)
              )
            }
          >
            {loadingOpts.hashtags && <option>Loading hashtags...</option>}
            {!loadingOpts.hashtags && optErrors.hashtags && <option>Không tải được hashtags</option>}
            {!loadingOpts.hashtags && !optErrors.hashtags &&
              hashtags.map(h => (
                <option key={h.id} value={h.id}>{h.name}</option>
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
    </div>
  );
};

export default NewPostPage;
