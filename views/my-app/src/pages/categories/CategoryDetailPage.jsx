import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import PostSection from "../../components/post/PostSection";
import postService from "../../services/postService";

/**
 * Trang chi tiết Category (hiển thị các bài viết trong 1 Category)
 */
export default function CategoryDetailPage() {
  const { categoryId } = useParams();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!categoryId) return;

    async function fetchPosts() {
      setLoading(true);
      setError(null);
      try {
        const res = await postService.getByCategory(categoryId);
        const rows = Array.isArray(res?.data) ? res.data : res;
        setPosts(rows || []);
      } catch (e) {
        console.error(e);
        setError(e?.message || "Không thể tải bài viết của Category này.");
      } finally {
        setLoading(false);
      }
    }

    fetchPosts();
  }, [categoryId]);

  // Giao diện trạng thái
  if (loading)
    return (
      <div className="p-4 text-[var(--color-text-secondary)]">
        Đang tải bài viết...
      </div>
    );

  if (error)
    return (
      <div
        className="
          p-4 rounded-lg border
          bg-[rgba(255,0,0,0.1)]
          border-[var(--color-border-strong)]
          text-[var(--color-text)]
        "
      >
        <strong className="text-red-400">Lỗi:</strong> {error}
      </div>
    );

  // Hiển thị danh sách bài viết
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
