// src/pages/following/FollowingPostsPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import PostSection from "../../components/post/PostSection";
import postService from "../../services/postService";
import { user_followServices } from "../../services/user_followServices";
import bookmarkService from "../../services/bookmarkService";

export default function FollowingPage() {
  // Các state
  const [users, setUsers] = useState([]); // Danh sách người bạn theo dõi
  const [posts, setPosts] = useState([]); // Tất cả bài viết của những người đó
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // -------------------------
  // 🧩 Chuẩn hóa bài viết từ BE → dạng PostCard
  // -------------------------
  const mapPost = (p, bookmarkedSet) => ({
    id: p.post_id,
    post_id: p.post_id,
    title: p.title || "Không có tiêu đề",
    excerpt: p.excerpt ?? "",
    createdAt: p.created_at,
    album: p.album_id ? { id: p.album_id, name: p.album_name } : null,
    author: {
      id: p.user_id,
      name: p.full_name || "Ẩn danh",
      avatar:
        p.avatar_url ||
        "https://cdn2.fptshop.com.vn/small/avatar_trang_1_cd729c335b.jpg",
    },
    banner: p.banner_url || null,
    file: p.file_url ? { url: p.file_url, type: p.file_type } : null,
    hashtags: Array.isArray(p.hashtags) ? p.hashtags : [],
    // Cờ đánh dấu bookmark
    is_bookmarked:
      typeof p.is_bookmarked === "boolean"
        ? p.is_bookmarked
        : bookmarkedSet.has(p.post_id),
  });

  // -------------------------
  // 🚀 Tải danh sách người theo dõi + bài viết
  // -------------------------
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);

      try {
        const [resUsers, rawPosts, myBookmarks] = await Promise.all([
          user_followServices.userFollowing(),
          postService.listPostsByFollowing(),
          bookmarkService.list(),
        ]);

        const bookmarkedSet = new Set(
          (myBookmarks || []).map((x) => x.post_id ?? x.id).filter(Boolean)
        );

        if (resUsers?.status === "success") {
          setUsers(resUsers.data || []);
        } else {
          setUsers([]);
        }

        const mappedPosts = (rawPosts || [])
          .map((p) => mapPost(p, bookmarkedSet))
          .sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
          );

        setPosts(mappedPosts);
      } catch (err) {
        console.error(err);
        setError(err?.message || "Không thể tải danh sách bài viết.");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // -------------------------
  // 🧠 Gom bài viết theo tác giả
  // -------------------------
  const authorGroups = useMemo(() => {
    const map = new Map();

    for (const post of posts) {
      const key = post.author?.id || "unknown";
      if (!map.has(key)) {
        map.set(key, { author: post.author, items: [] });
      }
      map.get(key).items.push(post);
    }

    // Sắp xếp bài trong từng nhóm
    for (const g of map.values()) {
      g.items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    // Sắp xếp nhóm theo bài mới nhất
    const arr = Array.from(map.values());
    arr.sort(
      (A, B) =>
        new Date(B.items[0]?.createdAt || 0) -
        new Date(A.items[0]?.createdAt || 0)
    );

    return arr;
  }, [posts]);

  // -------------------------
  // 🔖 Khi bấm bookmark → cập nhật ngay trong state
  // -------------------------
  const handleBookmarkChange = (next, postId) => {
    setPosts((prev) =>
      prev.map((p) =>
        (p.post_id || p.id) === postId ? { ...p, is_bookmarked: next } : p
      )
    );
  };

  // -------------------------
  // ⚙️ Render giao diện
  // -------------------------
  if (loading)
    return (
      <div className="p-4 text-[var(--color-text-secondary)]">
        Đang tải dữ liệu...
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

  // -------------------------
  // 🎨 UI chính
  // -------------------------
  return (
    <div className="w-full space-y-10">
      {/* Danh sách người theo dõi */}
      <section>
        <h2 className="text-xl font-bold text-[var(--color-text)] mb-4">
          👥 Danh sách người bạn đang theo dõi
        </h2>

        <ul className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          {users.map((u) => (
            <li
              key={u.user_id}
              className="
                flex items-center gap-3
                bg-[var(--color-surface-alt)]
                border border-[var(--color-border-soft)]
                rounded-lg px-3 py-3
                hover:bg-[var(--color-hover-bg)]
                transition
              "
            >
              {/* Khi click vào → sang trang profile */}
              <Link
                to={`/profile/${encodeURIComponent(u.user_id)}`}
                className="flex items-center gap-3 w-full"
              >
                <img
                  src={
                    u.avatar_url ||
                    "https://cdn2.fptshop.com.vn/small/avatar_trang_1_cd729c335b.jpg"
                  }
                  alt={u.full_name || u.username}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className="truncate">
                  <div className="font-semibold text-[var(--color-text)]">
                    {u.full_name || u.username}
                  </div>
                  <div className="text-sm text-[var(--color-text-muted)]">
                    Xem trang cá nhân
                  </div>
                </div>
              </Link>
            </li>
          ))}

          {users.length === 0 && (
            <li className="text-[var(--color-text-muted)]">
              Bạn chưa theo dõi ai.
            </li>
          )}
        </ul>
      </section>

      {/* Nhóm bài viết theo từng tác giả */}
      {authorGroups.length === 0 ? (
        <PostSection title="Chưa có bài viết" posts={[]} showAlbum={false} />
      ) : (
        authorGroups.map((group) => (
          <PostSection
            key={group.author?.id || group.items[0]?.id}
            title={
              group.author?.id ? (
                <Link
                  to={`/profile/${encodeURIComponent(group.author.id)}`}
                  className="hover:text-[var(--color-link-hover)] transition"
                >
                  {group.author.name}
                </Link>
              ) : (
                "Người dùng"
              )
            }
            posts={group.items}
            showAlbum={false}
            onBookmarkChange={handleBookmarkChange}
          />
        ))
      )}
    </div>
  );
}
