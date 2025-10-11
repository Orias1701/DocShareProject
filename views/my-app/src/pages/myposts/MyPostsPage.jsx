import React, { useEffect, useState } from "react";
import PostSection from "../../components/post/PostSection";
import postService from "../../services/postService";
import bookmarkService from "../../services/bookmarkService";

export default function MyPostsPage() {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Map 1 item từ BE -> shape card mà PostCard dùng
  const mapToCard = (p = {}) => ({
    id: p.post_id,
    post_id: p.post_id,
    title: p.title || "Untitled",
    authorName: p.author_name || "Tôi",
    authorAvatar: p.avatar_url || p.author_avatar || "https://cdn2.fptshop.com.vn/small/avatar_trang_1_cd729c335b.jpg",
    author: {
      id: p.user_id,
      name: p.author_name || "Tôi",
      avatar: p.avatar_url || p.author_avatar || "https://cdn2.fptshop.com.vn/small/avatar_trang_1_cd729c335b.jpg",
    },
    uploadTime: p.created_at,
    banner: p.banner_url || null,
    file: p.file_url ? { url: p.file_url, type: p.file_type || "" } : null,
    hashtags: p.hashtags,
    stats: {
      likes: p.reaction_count || 0,
      comments: p.comment_count || 0,
      views: p.view_count || 0,
    },
    album_id: p.album_id,
    album_name: p.album_name,
    category_id: p.category_id,
    category_name: p.category_name,
    is_bookmarked: !!p.is_bookmarked,
    user_id: p.user_id,
    created_at: p.created_at,
  });

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const [rows, myBms] = await Promise.all([
          postService.listMyPosts(),
          bookmarkService.list(),
        ]);

        const bookmarkedSet = new Set(
          (myBms || []).map((x) => x.post_id ?? x.id).filter(Boolean)
        );

        // Group theo album
        const groups = new Map();
        for (const p of rows || []) {
          const key = p.album_id || "__no_album__";
          const title = p.album_name || "Chưa có album";
          if (!groups.has(key)) groups.set(key, { title, posts: [] });
          groups.get(key).posts.push({
            ...mapToCard(p),
            is_bookmarked:
              typeof p.is_bookmarked === "boolean"
                ? p.is_bookmarked
                : bookmarkedSet.has(p.post_id),
          });
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

  // ✅ Update cục bộ khi bấm bookmark/unbookmark
  const handleBookmarkChange = (next, postId) => {
    setSections((prevSecs) =>
      prevSecs.map((sec) => ({
        ...sec,
        posts: sec.posts.map((p) =>
          (p.post_id || p.id) === postId ? { ...p, is_bookmarked: next } : p
        ),
      }))
    );
  };

  // ✅ Khi xoá ở card: gỡ khỏi group tương ứng; nếu group rỗng thì bỏ group
  const handleDeleted = (deletedId) => {
    setSections((prevSecs) => {
      const next = prevSecs
        .map((sec) => ({
          ...sec,
          posts: sec.posts.filter((p) => String(p.post_id ?? p.id) !== String(deletedId)),
        }))
        .filter((sec) => sec.posts.length > 0);
      return next;
    });
  };

  // ✅ Khi EDIT: merge + move giữa các album nếu đổi album
  const handleEdited = (u) => {
    setSections((prev) => {
      const pid = String(u.post_id);
      const next = prev.map((sec) => ({ ...sec, posts: [...sec.posts] }));
      let oldSecIdx = -1, oldPostIdx = -1, oldPost = null, oldAlbumKey = null;

      next.forEach((sec, si) => {
        const idx = sec.posts.findIndex((pp) => String(pp.post_id ?? pp.id) === pid);
        if (idx !== -1) {
          oldSecIdx = si;
          oldPostIdx = idx;
          oldPost = sec.posts[idx];
          oldAlbumKey = oldPost.album_id || "__no_album__";
        }
      });
      if (!oldPost) return prev;

      const merged = {
        ...oldPost,
        ...u,
        id: u.post_id,
        post_id: u.post_id,
        album_id: u.album_id ?? oldPost.album_id,
        album_name: u.album_name ?? oldPost.album_name,
      };

      const newAlbumKey = merged.album_id || "__no_album__";
      if (String(newAlbumKey) === String(oldAlbumKey)) {
        next[oldSecIdx].posts[oldPostIdx] = merged;
        return next;
      }

      // remove from old group
      next[oldSecIdx].posts.splice(oldPostIdx, 1);
      if (next[oldSecIdx].posts.length === 0) next.splice(oldSecIdx, 1);

      // add to new group (create if not exists)
      const newTitle = merged.album_name || "Chưa có album";
      let target = next.find((s) => s.title === newTitle);
      if (!target) {
        target = { title: newTitle, posts: [] };
        next.push(target);
      }
      target.posts.push(merged);
      target.posts.sort(
        (a, b) =>
          new Date(b.uploadTime || b.created_at || 0) - new Date(a.uploadTime || a.created_at || 0)
      );
      return next;
    });
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
      {/* Hiển thị theo Album */}
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
              title={sec.title}
              posts={sec.posts}
              showAlbum={false}
              headerRight={
                <span className="text-xs text-gray-400 border border-gray-700 rounded-full px-2 py-0.5">
                  {sec.posts.length} bài
                </span>
              }
              onBookmarkChange={handleBookmarkChange}
              onDeleted={handleDeleted}
              onEdited={handleEdited}   // ⬅️ rất quan trọng
            />
          ))
        )}
      </div>
    </div>
  );
}
