import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import PostSection from "../../components/post/PostSection";
import postService from "../../services/postService";
import user_followServices from "../../services/user_followServices";
import bookmarkService from "../../services/bookmarkService";

export default function ExplorePage() {
  const [popular, setPopular] = useState([]);
  const [latest, setLatest] = useState([]);
  const [following, setFollowing] = useState([]);
  const [whoToFollow, setWhoToFollow] = useState([]);
  const [trendingTags, setTrendingTags] = useState([]);
  const [loading, setLoading] = useState(true);

  // Gắn trạng thái bookmark vào danh sách
  const attachBookmarks = (posts, bookmarkedSet) =>
    (posts || []).map((p) => ({
      ...p,
      is_bookmarked:
        typeof p.is_bookmarked === "boolean"
          ? p.is_bookmarked
          : bookmarkedSet.has(p.post_id || p.id),
    }));

  // Tải dữ liệu chính
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);

        const [
          popularRes,
          latestRes,
          followingRes,
          topUsersRes,
          allTagsRes,
          myBms,
        ] = await Promise.all([
          postService.getPopular().catch(() => []),
          postService.getLatest().catch(() => []),
          postService.listPostsByFollowing().catch(() => []),
          user_followServices.top(6).catch(() => ({ status: "success", data: [] })),
          postService.listHashtags().catch(() => []),
          bookmarkService.list().catch(() => []),
        ]);

        if (!mounted) return;

        const bookmarkedSet = new Set(
          (myBms || []).map((x) => x.post_id ?? x.id).filter(Boolean)
        );

        setPopular(
          attachBookmarks(
            Array.isArray(popularRes?.data) ? popularRes.data : popularRes,
            bookmarkedSet
          )
        );
        setLatest(
          attachBookmarks(
            Array.isArray(latestRes?.data) ? latestRes.data : latestRes,
            bookmarkedSet
          )
        );
        setFollowing(attachBookmarks(followingRes || [], bookmarkedSet));

        setWhoToFollow(topUsersRes?.data || []);
        const tags = (Array.isArray(allTagsRes) ? allTagsRes : []).slice(0, 6);
        setTrendingTags(tags);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => (mounted = false);
  }, []);

  // Cập nhật bookmark trong ba danh sách
  const handleBookmarkChange = (next, postId) => {
    const updateList = (list) =>
      list.map((p) =>
        (p.post_id || p.id) === postId ? { ...p, is_bookmarked: next } : p
      );
    setPopular((prev) => updateList(prev));
    setLatest((prev) => updateList(prev));
    setFollowing((prev) => updateList(prev));
  };

  // Xoá post khỏi các danh sách
  const handleDeleted = (deletedId) => {
    const isSame = (p) => String(p.post_id ?? p.id) === String(deletedId);
    setPopular((prev) => prev.filter((p) => !isSame(p)));
    setLatest((prev) => prev.filter((p) => !isSame(p)));
    setFollowing((prev) => prev.filter((p) => !isSame(p)));
  };

  // Khi EDIT: merge lại trường mới
  const handleEdited = (u) => {
    const pid = String(u.post_id);
    const apply = (list) =>
      list.map((p) =>
        String(p.post_id ?? p.id) === pid
          ? { ...p, ...u, id: u.post_id, post_id: u.post_id }
          : p
      );
    setPopular((prev) => apply(prev));
    setLatest((prev) => apply(prev));
    setFollowing((prev) => apply(prev));
  };

  if (loading) return <p className="text-[var(--color-text-muted)]">Đang tải explore…</p>;

  return (
    <div className="w-full space-y-12">
      {popular?.length > 0 && (
        <PostSection
          title="🔥 Bài viết nổi bật"
          posts={popular}
          hideReactions={false}
          onBookmarkChange={handleBookmarkChange}
          onDeleted={handleDeleted}
          onEdited={handleEdited}
          maxTags={2}
        />
      )}

      {latest?.length > 0 && (
        <PostSection
          title="🕒 Mới nhất"
          posts={latest}
          hideReactions={false}
          onBookmarkChange={handleBookmarkChange}
          onDeleted={handleDeleted}
          onEdited={handleEdited}
          maxTags={2}
        />
      )}

      {/* {whoToFollow?.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold text-[var(--color-text)] mb-4">➕ Gợi ý nên theo dõi</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {whoToFollow.map((u) => (
              <div
                key={u.user_id}
                className="p-4 rounded-xl bg-[var(--color-card-bg)] border border-[var(--color-card-border)]"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={u.avatar_url || "https://cdn2.fptshop.com.vn/small/avatar_trang_1_cd729c335b.jpg"}
                    alt={u.full_name || u.username}
                    className="w-10 h-10 rounded-full"
                  />
                  <div className="flex-1">
                    <div className="font-semibold text-[var(--color-text)]">
                      {u.full_name || u.username}
                    </div>
                    <div className="text-xs text-[var(--color-text-muted)]">@{u.username}</div>
                  </div>
                  <Link
                    className="
                      px-3 py-1 rounded-lg
                      bg-[var(--color-btn-bg)] text-[var(--color-btn-text)]
                      hover:bg-[var(--color-btn-hover-bg)]
                      font-semibold transition-colors
                    "
                    to={`/profile/${u.user_id}`}
                  >
                    Xem
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )} */}
    </div>
  );
}
