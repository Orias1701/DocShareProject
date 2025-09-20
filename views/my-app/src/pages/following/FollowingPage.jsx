// src/pages/following/FollowingPostsPage.jsx
import React, { useEffect, useState } from "react";
import FollowingSection from "../../components/following/FollowingSection";
import postService from "../../services/postService";
import { user_followServices } from "../../services/user_followServices";

export default function FollowingPostsPage() {
  const [users, setUsers] = useState([]);     // danh sách user đang follow
  const [posts, setPosts] = useState([]);     // bài viết từ người đang follow
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Chuẩn hoá bài viết theo JSON mẫu bạn cung cấp
  const mapPost = (p) => ({
    id: p.post_id,
    title: p.title,
    excerpt: p.excerpt ?? "",
    createdAt: p.created_at,
    album: p.album_id ? { id: p.album_id, name: p.album_name } : null,
    author: {
      id: p.user_id,
      name: p.full_name,
      avatar: p.avatar_url || "/images/default-avatar.png",
    },
    file: p.file_url ? { url: p.file_url, type: p.file_type } : null,
    hashtags: Array.isArray(p.hashtags) ? p.hashtags : [],
  });

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        // 1) Lấy danh sách user đang follow để hiển thị
        const resUsers = await user_followServices.userFollowing();
        if (resUsers?.status === "success") {
          setUsers(resUsers.data || []);
        } else {
          setUsers([]);
        }

        // 2) Lấy tất cả bài viết từ những người đang follow (BE đã gộp sẵn)
        const rawPosts = await postService.listPostsByFollowing();
        const mapped = (rawPosts || []).map(mapPost);

        // Sắp xếp mới nhất lên trước
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
            <img
              src={u.avatar_url || "/images/default-avatar.png"}
              alt={u.username || u.full_name}
              className="w-8 h-8 rounded-full"
            />
            <span>
              {u.full_name} {u.username ? `(${u.username})` : ""}
            </span>
          </li>
        ))}
        {users.length === 0 && (
          <li className="text-gray-300">Bạn chưa theo dõi ai.</li>
        )}
      </ul>

      <FollowingSection
        title="Bài viết từ những người bạn đang theo dõi"
        posts={posts}
      />
    </div>
  );
}
