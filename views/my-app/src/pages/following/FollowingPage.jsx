// src/pages/following/FollowingPostsPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import PostSection from "../../components/post/PostSection";
import postService from "../../services/postService";
import { user_followServices } from "../../services/user_followServices";
import bookmarkService from "../../services/bookmarkService";

export default function FollowingPostsPage() {
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Map 1 post từ BE -> shape PostCard
  const mapPost = (p, bookmarkedSet) => ({
    id: p.post_id,
    post_id: p.post_id,
    title: p.title,
    excerpt: p.excerpt ?? "",
    createdAt: p.created_at,
    album: p.album_id ? { id: p.album_id, name: p.album_name } : null,
    author: {
      id: p.user_id,
      name: p.full_name,
      avatar: p.avatar_url || "https://cdn2.fptshop.com.vn/small/avatar_trang_1_cd729c335b.jpg",
    },
    banner: p.banner_url || null,
    file: p.file_url ? { url: p.file_url, type: p.file_type } : null,
    hashtags: Array.isArray(p.hashtags) ? p.hashtags : [],
    // ✅ Gắn cờ is_bookmarked: ưu tiên trường từ BE, nếu không có thì dùng set
    is_bookmarked: typeof p.is_bookmarked === "boolean"
      ? p.is_bookmarked
      : bookmarkedSet.has(p.post_id),
  });

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        // chạy song song
        const [resUsers, rawPosts, myBms] = await Promise.all([
          user_followServices.userFollowing(),
          postService.listPostsByFollowing(),
          bookmarkService.list(), // [{post_id,...}]
        ]);

        const bookmarkedSet = new Set(
          (myBms || []).map((x) => x.post_id ?? x.id).filter(Boolean)
        );

        if (resUsers?.status === "success") {
          setUsers(resUsers.data || []);
        } else {
          setUsers([]);
        }

        const mapped = (rawPosts || []).map((p) => mapPost(p, bookmarkedSet));
        mapped.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setPosts(mapped);
      } catch (err) {
        console.error(err);
        setError(err?.message || "Đã xảy ra lỗi không xác định.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Nhóm theo author
  const authorGroups = useMemo(() => {
    const m = new Map();
    for (const p of posts) {
      const key = p.author?.id || "unknown";
      if (!m.has(key)) m.set(key, { author: p.author, items: [] });
      m.get(key).items.push(p);
    }
    for (const g of m.values()) {
      g.items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    const arr = Array.from(m.values());
    arr.sort(
      (A, B) =>
        new Date(B.items[0]?.createdAt || 0) - new Date(A.items[0]?.createdAt || 0)
    );
    return arr;
  }, [posts]);

  // ✅ Khi bấm bookmark/unbookmark, cập nhật ngay vào state posts để không bị “mất”
  const handleBookmarkChange = (next, postId) => {
    setPosts((prev) =>
      prev.map((p) =>
        (p.post_id || p.id) === postId ? { ...p, is_bookmarked: next } : p
      )
    );
  };

  if (loading) return <div className="text-white p-4">Đang tải dữ liệu...</div>;
  if (error) {
    return (
      <div className="text-white p-4 bg-red-900/40 border border-red-700 rounded-lg">
        <strong>Lỗi:</strong> {error}
      </div>
    );
  }

  return (
    <div className="w-full">
      <h2 className="text-white mb-4">Danh sách người bạn đang theo dõi</h2>
      <ul className="mb-6">
        {users.map((u) => (
          <li key={u.user_id} className="text-white mb-2 flex items-center gap-2">
            {/* tên user… */}
          </li>
        ))}
        {users.length === 0 && (
          <li className="text-gray-300">Bạn chưa theo dõi ai.</li>
        )}
      </ul>

      {authorGroups.length === 0 ? (
        <PostSection title="Chưa có bài viết" posts={[]} showAlbum={false} />
      ) : (
        authorGroups.map((g) => (
          <PostSection
            key={g.author?.id || g.items[0]?.id}
            title={g.author?.name || "Người dùng"}
            posts={g.items}
            showAlbum={false}
            // ✅ truyền xuống để PostCard -> BookmarkButton gọi ngược lên
            onBookmarkChange={handleBookmarkChange}
          />
        ))
      )}
    </div>
  );
}
