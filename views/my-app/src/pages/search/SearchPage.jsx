// src/pages/search/SearchPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import PostSection from "../../components/post/PostSection";
import AlbumSection from "../../components/album/AlbumSection";
import CategoryInfoCard from "../../components/category/CategoryInfoCard";
import HashtagButton from "../../components/hashtag/HashtagButton"; // 👈 dùng HashtagButton
import { searchCombined } from "../../services/searchService";

const TABS = ["post", "album", "category", "hashtag"];

/** map post BE -> PostCard shape */
const mapPostToCard = (p = {}) => ({
  id: p.id || p.post_id,
  post_id: p.post_id,
  title: p.title || "Untitled",
  authorName: p.username || p.authorName || "Unknown",
  authorAvatar:
    p.authorAvatar || "https://i.pravatar.cc/100?u=" + (p.user_id || "guest"),
  author: {
    id: p.user_id,
    name: p.username || "Unknown",
    avatar:
      p.authorAvatar || "https://i.pravatar.cc/100?u=" + (p.user_id || "guest"),
  },
  uploadTime: p.created_at || "",
  banner: p.banner_url || null,
  file: null,
  hashtags: p.hashtags || [],
  stats: {
    likes: p.likes || 0,
    comments: p.comments || 0,
    views: p.views || 0,
  },
  album_name: p.album_name || null,
  is_bookmarked: !!p.is_bookmarked,
});

/** map album BE -> AlbumCard shape */
const mapAlbumToCard = (a = {}) => ({
  id: a.id || a.album_id,
  album_id: a.album_id,
  title: a.name || a.album_name || "Album",
  authorName: a.username || "Unknown",
  authorAvatar:
    a.authorAvatar || "https://i.pravatar.cc/100?u=" + (a.user_id || "guest"),
  uploadTime: a.created_at || "",
  banner: a.thumbnail || a.banner_url || null,
  link: `/albums/${a.album_id}`,
});

export default function SearchPage() {
  const navigate = useNavigate();
  const { search } = useLocation();

  const params = useMemo(() => new URLSearchParams(search), [search]);
  const q = params.get("q")?.trim() || "";
  const type = (params.get("type") || "post").toLowerCase();

  const [results, setResults] = useState({
    posts: [],
    albums: [],
    categories: [],
    hashtags: [],
  });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  // Đổi tab = update URL
  const setType = (nextType) => {
    const p = new URLSearchParams(params);
    p.set("type", nextType);
    navigate(`/search?${p.toString()}`);
  };

  // Fetch API mỗi khi q thay đổi
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!q) {
        setResults({ posts: [], albums: [], categories: [], hashtags: [] });
        return;
      }
      setLoading(true);
      setErr(null);
      try {
        const data = await searchCombined(q);
        if (mounted) setResults(data);
      } catch (e) {
        if (mounted) setErr(e?.message || "Lỗi khi tìm kiếm.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => (mounted = false);
  }, [q]);

  const counts = {
    post: results.posts.length,
    album: results.albums.length,
    category: results.categories.length,
    hashtag: results.hashtags.length,
  };

  const list =
    type === "post"
      ? results.posts
      : type === "album"
      ? results.albums
      : type === "category"
      ? results.categories
      : results.hashtags;

  return (
    <div className="with-fixed-header max-w-6xl mx-auto px-4 text-white">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-xl font-semibold">Search</h1>
        <div className="text-sm text-gray-400 mt-1">
          Result for:&nbsp;
          <span className="text-gray-200 font-medium">
            {q ? `“${q}”` : "—"}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setType(t)}
            className={`px-4 py-1.5 rounded-lg border text-sm ${
              type === t
                ? "bg-white/10 border-white/20"
                : "bg-[#2b333d] border-transparent hover:bg-[#3a4654]"
            }`}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)} ({counts[t]})
          </button>
        ))}
      </div>

      {/* Results */}
      {loading ? (
        <div className="text-gray-400 text-sm">Đang tìm kiếm…</div>
      ) : err ? (
        <div className="text-red-400 text-sm">{err}</div>
      ) : !q ? (
        <div className="text-gray-400 text-sm">
          Không có từ khoá. Hãy nhập từ khoá ở thanh Search trên Header.
        </div>
      ) : list.length === 0 ? (
        <div className="text-gray-400 text-sm">Không có kết quả cho “{q}”.</div>
      ) : type === "post" ? (
        <PostSection
          title={`Posts (${counts.post})`}
          posts={list.map(mapPostToCard)}
          showAlbum={false}
          hideReactions={true}
          emptyText="Không có bài viết nào."
        />
      ) : type === "album" ? (
        <AlbumSection
          title={`Albums (${counts.album})`}
          albums={list.map(mapAlbumToCard)}
          emptyText="Không có album nào."
        />
      ) : type === "category" ? (
        <section className="w-full mb-12">
          <div className="mb-6 flex items-center justify-between gap-4">
            <h2 className="text-2xl font-bold text-white text-start">
              Categories ({counts.category})
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {list.map((cat) => (
              <Link
                key={cat.id || cat.category_id}
                to={`/categories/${cat.id || cat.category_id}`}
              >
                <CategoryInfoCard
                  icon="fa-solid fa-folder"
                  title={cat.name || cat.category_name}
                  subtitle={`ID: ${cat.id || cat.category_id}`}
                  description={cat.description || "No description."}
                />
              </Link>
            ))}
          </div>
        </section>
      ) : (
        <section className="w-full mb-12">
          <div className="mb-6 flex items-center justify-between gap-4">
            <h2 className="text-2xl font-bold text-white text-start">
              Hashtags ({counts.hashtag})
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {list.map((h) => {
              const tag = (h.tag || h.hashtag_name || "").replace(/^#/, "");
              return (
                <HashtagButton
                  key={h.id || h.hashtag_id || tag}
                  tag={tag}
                  onClick={() => navigate(`/hashtags/${encodeURIComponent(tag)}`)}
                />
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
