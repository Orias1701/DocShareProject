// src/pages/myposts/MyPostsPage.jsx
import React, { useEffect, useState } from "react";
import PostSection from "../../components/post/PostSection";
import postService from "../../services/postService";

export default function MyPostsPage() {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Map 1 item từ BE -> shape card mà PostCard dùng
  const mapToCard = (p = {}) => ({
    id: p.post_id,
    title: p.title || "Untitled",
    authorName: p.author_name || "Tôi",
    authorAvatar: p.avatar_url || p.author_avatar || "/images/default-avatar.png",
    author: { name: p.author_name || "Tôi", avatar: p.avatar_url || p.author_avatar || "/images/default-avatar.png" },
    uploadTime: p.created_at,
    banner: p.banner_url || null,
    file: p.file_url ? { url: p.file_url, type: p.file_type || "" } : null,
    // <- chấp nhận cả string (“#tag1 #tag2”) hoặc array, PostCard đã normalize
    hashtags: p.hashtags,
    stats: { likes: p.reaction_count || 0, comments: p.comment_count || 0, views: p.view_count || 0 },
    // để PostCard có thể đọc nếu bạn bật showAlbum
    album_name: p.album_name,
  });

  useEffect(() => {
    (async () => {
      setLoading(true); setError(null);
      try {
        const rows = await postService.listMyPosts(); // trả về res.data (mảng)

        // Group theo album
        const groups = new Map();
        for (const p of rows || []) {
          const key = p.album_id || "__no_album__";
          const title = p.album_name || "Chưa có album";
          if (!groups.has(key)) groups.set(key, { title, posts: [] });
          groups.get(key).posts.push(mapToCard(p));
        }

        // sort bài trong từng album
        for (const g of groups.values()) {
          g.posts.sort((a, b) => new Date(b.uploadTime) - new Date(a.uploadTime));
        }

        // -> mảng + sort album theo bài mới nhất
        const arr = Array.from(groups.values());
        arr.sort(
          (A, B) =>
            new Date(B.posts[0]?.uploadTime || 0) -
            new Date(A.posts[0]?.uploadTime || 0)
        );
        setSections(arr);
      } catch (e) {
        console.error(e);
        setError(e?.message || "Không thể tải bài viết của bạn.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

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
      {/* Tabs (tuỳ chọn) */}
      <div className="flex justify-end items-center mb-8 gap-6">
        <button className="text-white font-semibold border-b-2 border-white pb-1" type="button">
          Posts
        </button>
        <button className="text-gray-400 font-semibold pb-1 hover:text-white" type="button">
          Follower
        </button>
      </div>

      {/* Hiển thị theo Album: mỗi album là 1 Section */}
      <div className="space-y-12">
        {sections.length === 0 ? (
          <PostSection
            title="Bài viết của tôi"
            posts={[]}
            showAlbum={false}
            emptyText="Bạn chưa có bài viết nào."
          />
        ) : (
          sections.map((sec, idx) => (
            <PostSection
              key={sec.title + idx}
              title={sec.title}          // <-- tên Album trên header
              posts={sec.posts}
              showAlbum={false}          // <-- KHÔNG hiện chip album trong card
              // badge số bài trong album ở góc phải header (tuỳ chọn)
              headerRight={
                <span className="text-xs text-gray-400 border border-gray-700 rounded-full px-2 py-0.5">
                  {sec.posts.length} bài
                </span>
              }
            />
          ))
        )}
      </div>
    </div>
  );
}
