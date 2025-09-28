// src/pages/explore/ExplorePage.jsx
import React, { useEffect, useMemo, useState } from "react";
import PostSection from "../../components/post/PostSection";
import postService from "../../services/postService";
import user_followServices from "../../services/user_followServices";

export default function ExplorePage() {
  const [popular, setPopular] = useState([]);
  const [latest, setLatest] = useState([]);
  const [following, setFollowing] = useState([]);
  const [whoToFollow, setWhoToFollow] = useState([]);
  const [trendingTags, setTrendingTags] = useState([]);
  const [loading, setLoading] = useState(true);

  // đọc dấu vết sở thích local (tuỳ app của bạn có lưu không)
  const interestedTags = useMemo(() => {
    try {
      const raw = localStorage.getItem("recent_hashtags") || "[]";
      return JSON.parse(raw).slice(0, 5);
    } catch {
      return [];
    }
  }, []);

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
        ] = await Promise.all([
          postService.getPopular().catch(() => []),
          postService.getLatest().catch(() => []),
          postService.listPostsByFollowing().catch(() => []),
          user_followServices.top(6).catch(() => ({ status: "success", data: [] })),
          postService.listHashtags().catch(() => []),
        ]);

        if (!mounted) return;

        setPopular(Array.isArray(popularRes?.data) ? popularRes.data : popularRes);
        setLatest(Array.isArray(latestRes?.data) ? latestRes.data : latestRes);
        setFollowing(followingRes || []);

        // gợi ý người nên theo dõi
        setWhoToFollow(topUsersRes?.data || []);

        // “trending hashtags” tạm thời: lấy 6 tag đầu (khi chưa có API thống kê)
        const tags = (Array.isArray(allTagsRes) ? allTagsRes : []).slice(0, 6);
        setTrendingTags(tags);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => (mounted = false);
  }, []);

  if (loading) return <p className="text-gray-400">Đang tải explore…</p>;

  return (
    <div className="w-full space-y-12">
      {/* 1) Xu hướng */}
      {popular?.length > 0 && (
        <PostSection title="🔥 Bài viết nổi bật" posts={popular} hideReactions={false} />
      )}

      {/* 2) Hashtag đang nổi */}
      {trendingTags?.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold text-white mb-4">🏷️ Hashtag đang nổi</h2>
          <div className="flex flex-wrap gap-2">
            {trendingTags.map((t) => (
              <a
                key={t.id}
                href={`/hashtag/${encodeURIComponent(t.name.replace(/^#/, ""))}`}
                className="px-3 py-1 rounded-lg bg-white/10 text-white hover:bg-white/20"
                title="Xem bài theo hashtag"
              >
                {t.name}
              </a>
            ))}
          </div>
        </section>
      )}

      {/* 3) Mới nhất */}
      {latest?.length > 0 && (
        <PostSection title="🕒 Mới nhất" posts={latest} hideReactions />
      )}

      {/* 4) Từ người bạn theo dõi – đặt sau */}
      {following?.length > 0 && (
        <PostSection title="👥 Từ người bạn theo dõi" posts={following} />
      )}

      {/* 5) Gợi ý người nên theo dõi */}
      {whoToFollow?.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold text-white mb-4">➕ Gợi ý nên theo dõi</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {whoToFollow.map((u) => (
              <div key={u.user_id} className="p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-3">
                  <img
                    src={u.avatar_url || "https://i.pravatar.cc/40?img=1"}
                    alt={u.full_name || u.username}
                    className="w-10 h-10 rounded-full"
                  />
                  <div className="flex-1">
                    <div className="font-semibold text-white">
                      {u.full_name || u.username}
                    </div>
                    <div className="text-xs text-gray-400">@{u.username}</div>
                  </div>
                  <a
                    className="px-3 py-1 rounded-lg bg-white text-black font-semibold"
                    href={`/profile/${u.user_id}`}
                  >
                    Xem
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 6) Vì bạn hay xem (dựa vào localStorage) */}
      {interestedTags.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold text-white mb-3">✨ Vì bạn hay xem</h2>
          <div className="flex flex-wrap gap-2">
            {interestedTags.map((tag) => (
              <a
                key={tag}
                href={`/hashtag/${encodeURIComponent(tag.replace(/^#/, ""))}`}
                className="px-3 py-1 rounded-lg bg-blue-500/20 text-blue-200 hover:bg-blue-500/30"
              >
                {tag}
              </a>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
