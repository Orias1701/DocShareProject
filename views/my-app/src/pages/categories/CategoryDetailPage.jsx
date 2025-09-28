// src/pages/categories/CategoryDetailPage.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import PostSection from "../../components/post/PostSection";
import postService from "../../services/postService";

function CategoryDetailPage() {
  const { categoryId } = useParams();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!categoryId) return;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await postService.getByCategory(categoryId);
        const rows = Array.isArray(res?.data) ? res.data : res;
        setPosts(rows || []);
      } catch (e) {
        setError(e?.message || "Không thể tải bài viết.");
      } finally {
        setLoading(false);
      }
    })();
  }, [categoryId]);

  if (loading) return <div className="text-white p-4">Đang tải bài viết...</div>;
  if (error) {
    return (
      <div className="text-white p-4 bg-red-900/40 border border-red-700 rounded-lg">
        <strong>Lỗi:</strong> {error}
      </div>
    );
  }

  return (
    <div className="w-full">
      <PostSection
        title={`Bài viết trong Category #${categoryId}`}
        posts={posts}
        showAlbum={true}
        hideReactions={false}
        emptyText="Category này chưa có bài viết nào."
      />
    </div>
  );
}

export default CategoryDetailPage;
