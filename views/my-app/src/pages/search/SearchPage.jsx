// src/pages/search/SearchPage.jsx
import React, { useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import PostSection from "../../components/post/PostSection";
import AlbumSection from "../../components/album/AlbumSection";
import CategoryInfoCard from "../../components/category/CategoryInfoCard";
import HashtagLink from "../../components/hashtag/HashtagLink";

/** MOCK dữ liệu demo */
const MOCK = {
  posts: [
    { id: 1, title: "React Hooks", excerpt: "useState, useEffect", hashtags: ["react", "hooks"] },
    { id: 2, title: "Next.js Routing", excerpt: "App Router", hashtags: ["nextjs"] },
    { id: 3, title: "Tailwind Layouts", excerpt: "Grid/Flex patterns", hashtags: ["tailwind", "css"] },
  ],
  albums: [
    { id: "a1", name: "Frontend 2025", thumbnail: "https://picsum.photos/seed/a1/800/450" },
    { id: "a2", name: "Backend Notes",  thumbnail: "https://picsum.photos/seed/a2/800/450" },
  ],
  categories: [
    { id: "c1", name: "Frontend" },
    { id: "c2", name: "Backend"  },
    { id: "c3", name: "Data"     },
  ],
  hashtags: [
    { id: "h1", tag: "#react"  },
    { id: "h2", tag: "#backend"},
    { id: "h3", tag: "#nextjs" },
  ],
};

const TABS = ["post", "album", "category", "hashtag"];

/** map post mock -> PostCard shape */
const mapMockPostToCard = (p = {}) => ({
  id: p.id,
  post_id: p.id,
  title: p.title || "Untitled",
  authorName: "Demo User",
  authorAvatar: "https://i.pinimg.com/736x/18/bd/a5/18bda5a4616cd195fe49a9a32dbab836.jpg",
  author: { id: "u1", name: "Demo User", avatar: "/https://i.pinimg.com/736x/18/bd/a5/18bda5a4616cd195fe49a9a32dbab836.jpg" },
  uploadTime: "2025-09-01 12:00:00",
  banner: null,
  file: null,
  hashtags: p.hashtags || [],
  stats: { likes: 0, comments: 0, views: 0 },
  album_name: null,
  is_bookmarked: false,
});

/** map album mock -> AlbumCard shape */
const mapMockAlbumToCard = (a = {}) => ({
  id: a.id,
  album_id: a.id,
  title: a.name || "Album",
  authorName: "Demo User",
  authorAvatar: "https://i.pinimg.com/736x/18/bd/a5/18bda5a4616cd195fe49a9a32dbab836.jpg",
  uploadTime: "2025-09-01",
  banner: a.thumbnail || null,
  link: `/albums/${a.id}`,
});

export default function SearchPage() {
  const navigate = useNavigate();
  const { search } = useLocation();

  // 👉 Mỗi lần URL thay đổi, những giá trị này thay đổi theo
  const params = useMemo(() => new URLSearchParams(search), [search]);
  const q     = params.get("q")?.toLowerCase() || "";
  const type  = (params.get("type") || "post").toLowerCase();

  // Đổi tab = ghi lại URL (không dùng state)
  const setType = (nextType) => {
    const p = new URLSearchParams(params);
    p.set("type", nextType);
    navigate(`/search?${p.toString()}`);
  };

  // Lọc client-side theo q (MOCK)
  const filtered = useMemo(() => {
    if (!q.trim()) return { posts: [], albums: [], categories: [], hashtags: [] };
    return {
      posts: MOCK.posts.filter(p =>
        [p.title, p.excerpt, (p.hashtags || []).join(" ")].join(" ").toLowerCase().includes(q)
      ),
      albums: MOCK.albums.filter(a => (a.name || "").toLowerCase().includes(q)),
      categories: MOCK.categories.filter(c => (c.name || "").toLowerCase().includes(q)),
      hashtags: MOCK.hashtags.filter(h => (h.tag || "").toLowerCase().includes(q)),
    };
  }, [q]);

  const counts = {
    post: filtered.posts.length,
    album: filtered.albums.length,
    category: filtered.categories.length,
    hashtag: filtered.hashtags.length,
  };

  const list =
    type === "post" ? filtered.posts :
    type === "album" ? filtered.albums :
    type === "category" ? filtered.categories :
    filtered.hashtags;

  return (
    <div className="with-fixed-header max-w-6xl mx-auto px-4 text-white">
      {/* Header nhỏ */}
      <div className="mb-4">
        <h1 className="text-xl font-semibold">Search</h1>
        <div className="text-sm text-gray-400 mt-1">
          Result for:&nbsp;
          <span className="text-gray-200 font-medium">{q ? `“${q}”` : "—"}</span>
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
      {!q.trim() ? (
        <div className="text-gray-400 text-sm">
          Không có từ khoá. Hãy nhập từ khoá ở thanh Search trên Header.
        </div>
      ) : list.length === 0 ? (
        <div className="text-gray-400 text-sm">Không có kết quả cho “{q}”.</div>
      ) : type === "post" ? (
        <PostSection
          title={`Posts (${counts.post})`}
          posts={list.map(mapMockPostToCard)}
          showAlbum={false}
          hideReactions={true}
          emptyText="Không có bài viết nào."
        />
      ) : type === "album" ? (
        <AlbumSection
          title={`Albums (${counts.album})`}
          albums={list.map(mapMockAlbumToCard)}
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
              <Link key={cat.id} to={`/categories/${cat.id}`}>
                <CategoryInfoCard
                  icon="fa-solid fa-folder"
                  title={cat.name}
                  subtitle={`ID: ${cat.id}`}
                  description="Short category description..."
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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {list.map((h) => (
              <HashtagLink key={h.id} tag={h.tag} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
