import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import PostSection from "../../components/post/PostSection";
import postService from "../../services/postService";

/**
 * Trang chi tiết album: /albums/:albumId
 * - Gọi API lấy danh sách bài trong album
 * - Trả về PostSection để hiển thị grid card
 * - Dùng biến CSS cho màu sắc & border
 */
export default function AlbumDetailPage() {
  const { albumId } = useParams();

  const [posts, setPosts] = useState([]);      // danh sách bài
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Tải dữ liệu khi albumId thay đổi
  useEffect(() => {
    if (!albumId) return;

    async function fetchPosts() {
      setLoading(true);
      setError(null);
      try {
        const res = await postService.getByAlbum(albumId);
        const rows = Array.isArray(res?.data) ? res.data : res;
        setPosts(rows || []);
      } catch (e) {
        console.error(e);
        setError(e?.message || "Không thể tải bài viết của album này.");
      } finally {
        setLoading(false);
      }
    }

    fetchPosts();
  }, [albumId]);

  // Trạng thái tải
  if (loading) {
    return (
      <div className="p-4 text-[var(--color-text-secondary)]">
        Đang tải bài viết...
      </div>
    );
  }

  // Trạng thái lỗi
  if (error) {
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
  }

  // Nội dung chính
  return (
    <div className="w-full">
      <h1 className="text-lg font-semibold text-[var(--color-text)] mb-4">
        Bài viết trong album #{albumId}
      </h1>

      <PostSection
        title=""
        posts={posts}
        showAlbum={false}
        hideReactions={false}
        emptyText="Album này chưa có bài viết nào."
      />
    </div>
  );
}
