// src/pages/bookmarks/BookmarksPage.jsx
import React, { useEffect, useState } from "react";
import PostSection from "../../components/post/PostSection";
import bookmarkService from "../../services/bookmarkService";

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Map dữ liệu từ API về shape PostCard
  const mapToCard = (p = {}) => ({
    id: p.post_id,
    post_id: p.post_id,                 // ✅ đảm bảo có post_id
    title: p.title || "Untitled",
    authorName: p.author_name || "Ẩn danh",
    authorAvatar:
      p.avatar_url || p.author_avatar || "https://via.placeholder.com/80?text=User",
    uploadTime: p.created_at,
    banner: p.banner_url || null,
    file: p.file_url ? { url: p.file_url, type: p.file_type || "" } : null,
    hashtags: p.hashtags,
    stats: {
      likes: p.reaction_count || 0,
      comments: p.comment_count || 0,
      views: p.view_count || 0,
    },
    album_name: p.album_name,
    is_bookmarked: true,                // ✅ QUAN TRỌNG: vì đây là trang bookmarks
  });

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const rows = await bookmarkService.list(); // gọi API
        setBookmarks((rows || []).map(mapToCard));
      } catch (err) {
        console.error(err);
        setError(err?.message || "Không thể tải bookmarks.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div className="text-white p-4">Đang tải bookmarks...</div>;
  if (error) {
    return (
      <div className="text-white p-4 bg-red-900/40 border border-red-700 rounded-lg">
        <strong>Lỗi:</strong> {error}
      </div>
    );
  }

  return (
    <div className="w-full">
      <h2 className="text-xl font-bold text-white mb-6">Your bookmarks</h2>

      {bookmarks.length === 0 ? (
        <div className="text-gray-400">Bạn chưa lưu bài viết nào.</div>
      ) : (
        <PostSection
          title="Bookmarks"
          posts={bookmarks}
          showAlbum={false}
          onBookmarkChange={(next, postId) => {
            if (!next) {
              // xoá ngay trong state
              setBookmarks((prev) => prev.filter((x) => (x.post_id || x.id) !== postId));
            }
          }}
        />
      )}
    </div>
  );
}
