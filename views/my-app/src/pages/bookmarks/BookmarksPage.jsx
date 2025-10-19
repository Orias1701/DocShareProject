import React, { useEffect, useState } from "react";
import PostSection from "../../components/post/PostSection";
import bookmarkService from "../../services/bookmarkService";

/**
 * Trang Bookmarks (Bài viết đã lưu)
 * - Gọi API để lấy danh sách bài viết người dùng đã lưu
 * - Hiển thị qua component PostSection
 * - Dùng biến màu từ file CSS chính (main-page)
 */
export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState([]); // danh sách bài lưu
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Hàm chuyển dữ liệu từ API sang cấu trúc PostCard
  function mapToCard(p = {}) {
    return {
      id: p.post_id,
      post_id: p.post_id,
      title: p.title || "Untitled",

      // thông tin tác giả
      authorName: p.full_name || p.username || p.author_name || "Ẩn danh",
      authorAvatar:
        p.avatar_url ||
        p.author_avatar ||
        "https://via.placeholder.com/80?text=User",

      uploadTime: p.created_at,

      // ảnh bìa hoặc file đính kèm
      banner: p.banner_url || null,
      file: p.file_url ? { url: p.file_url, type: p.file_type || "" } : null,

      hashtags: p.hashtags || [],

      stats: {
        likes: p.reaction_count || 0,
        comments: p.comment_count || 0,
        views: p.view_count || 0,
      },

      album_name: p.album_name || "",
      is_bookmarked: true, // vì đây là trang bookmarks
    };
  }

  // Gọi API khi load trang
  useEffect(() => {
    async function fetchBookmarks() {
      setLoading(true);
      setError(null);
      try {
        const rows = await bookmarkService.list();
        setBookmarks((rows || []).map(mapToCard));
      } catch (err) {
        console.error(err);
        setError(err?.message || "Không thể tải danh sách bookmarks.");
      } finally {
        setLoading(false);
      }
    }

    fetchBookmarks();
  }, []);

  // Trạng thái đang tải
  if (loading) {
    return (
      <div className="p-4 text-[var(--color-text-secondary)]">
        Đang tải bookmarks...
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

  // Giao diện chính
  return (
    <div className="w-full">
      {/* Tiêu đề */}
      <h2 className="text-xl font-bold text-[var(--color-text)] mb-6">
        Your bookmarks
      </h2>

      {/* Nếu chưa có bài lưu */}
      {bookmarks.length === 0 ? (
        <div className="text-[var(--color-text-muted)]">
          Bạn chưa lưu bài viết nào.
        </div>
      ) : (
        <PostSection
          title="Bookmarks"
          posts={bookmarks}
          showAlbum={false}
          onBookmarkChange={(next, postId) => {
            if (!next) {
              // Khi bỏ lưu → xóa bài đó khỏi giao diện ngay
              setBookmarks((prev) =>
                prev.filter((x) => (x.post_id || x.id) !== postId)
              );
            }
          }}
        />
      )}
    </div>
  );
}
