// src/pages/following/FollowingPostsPage.jsx
import React, { useEffect, useMemo, useState } from "react"; // ⬅️ thêm useMemo
import PostSection from "../../components/post/PostSection";
import postService from "../../services/postService";
import { user_followServices } from "../../services/user_followServices";

export default function FollowingPostsPage() {
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ... giữ nguyên import
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
    banner: p.banner_url || null, // ⬅️ THÊM DÒNG NÀY
    file: p.file_url ? { url: p.file_url, type: p.file_type } : null,
    hashtags: Array.isArray(p.hashtags) ? p.hashtags : [],
  });


  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const resUsers = await user_followServices.userFollowing();
        if (resUsers?.status === "success") {
          setUsers(resUsers.data || []);
        } else {
          setUsers([]);
        }

        const rawPosts = await postService.listPostsByFollowing();
        const mapped = (rawPosts || []).map(mapPost);
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

  // 👇 Nhóm post theo author để render mỗi Section = 1 user
  const authorGroups = useMemo(() => {
    const m = new Map();
    for (const p of posts) {
      const key = p.author?.id || "unknown";
      if (!m.has(key)) m.set(key, { author: p.author, items: [] });
      m.get(key).items.push(p);
    }
    // sắp xếp post trong từng nhóm (mới nhất trước)
    for (const g of m.values()) {
      g.items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    // sắp xếp nhóm theo bài mới nhất của nhóm
    const arr = Array.from(m.values());
    arr.sort(
      (A, B) =>
        new Date(B.items[0]?.createdAt || 0) -
        new Date(A.items[0]?.createdAt || 0)
    );
    return arr;
  }, [posts]);

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
            {/* <img
              // src={u.avatar_url || "/images/default-avatar.png"}
              alt={u.username || u.full_name}
              className="w-8 h-8 rounded-full"
            /> */}
          </li>
        ))}
        {users.length === 0 && (
          <li className="text-gray-300">Bạn chưa theo dõi ai.</li>
        )}
      </ul>

      {/* ⬇️ Render 1 section cho mỗi user, title = tên user */}
      {authorGroups.length === 0 ? (
        <PostSection title="Chưa có bài viết" posts={[]} showAlbum={false} />
      ) : (
        authorGroups.map((g) => (
          <PostSection
            key={g.author?.id || g.items[0]?.id}
            title={g.author?.name || "Người dùng"}
            posts={g.items}
            showAlbum={false}
          />
        ))
      )}

    </div>
  );
}
