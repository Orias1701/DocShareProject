// src/pages/viewer/FileViewerPage.jsx
import React, { useMemo } from "react";
import { useLocation, Link } from "react-router-dom";
import CommentsPanel from "../../components/comments/CommentsPanel";

const WRAP = "min-h-screen bg-[#0D1117] text-white";
const CARD = "bg-[#0F172A] rounded-lg border border-white/10";
const SOFT = "rounded-lg border border-white/10";

const FALLBACK_AVATAR =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80">
      <rect width="100%" height="100%" fill="#334155"/>
      <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle"
            font-family="Arial, sans-serif" font-size="28" fill="#e2e8f0">U</text>
    </svg>`
  );

function useQuery() {
  const { search } = useLocation();
  const p = new URLSearchParams(search);

  const title = p.get("title") || "Post title";
  const album = p.get("album") || "Album name";
  const category = p.get("category") || "Album name";
  const hashtags = (p.get("hashtags") || "").split(/[\,\s]+/).filter(Boolean);
  const authorName = p.get("author") || "Full name";
  const username = p.get("username") || "Username";
  const followers = p.get("followers") || "Following number";
  const avatarParam = p.get("avatar") || "";
  const summary = p.get("summary") || "Summary will be shown here";
  const postId = p.get("post_id") || p.get("postId") || "";

  const avatar = avatarParam || FALLBACK_AVATAR;

  // vẫn chấp nhận có hoặc không có url, nhưng nội dung chính là placeholder
  const url = p.get("url") || ""; // dùng cho nút "Mở bản gốc" nếu muốn

  return { title, album, category, hashtags, authorName, username, followers, avatar, summary, postId, url };
}

function PageFooter() {
  return (
    <footer className="mt-8">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr,2fr] items-end gap-4">
        <div className={`${SOFT} p-4 text-sm text-gray-300`}>Logo</div>
        <div className="text-[10px] text-gray-400 text-right leading-relaxed">
          Copyright © 2025 StudioSensi B.V., Keizersgracht 424-5 1016 GC Amsterdam, KVK 19598739, BTW: NL859321358B01<br/>
          StudioS is not affiliated to nor endorsed by any school, college or university
        </div>
      </div>
    </footer>
  );
}

export default function FileViewerPage() {
  const {
    title, album, category, hashtags,
    authorName, username, followers, avatar,
    summary, postId, url
  } = useQuery();

  // nội dung chính: KHUNG TÀI LIỆU PLACEHOLDER
  const mainContent = (
    <div className={`${CARD} overflow-hidden`}>
      <div className="w-full min-h-[60vh] grid place-items-center text-gray-300">
        <p>Post content will be shown here</p>
      </div>
    </div>
  );

  return (
    <div className={WRAP}>
      <div className="px-4 lg:px-8 pt-4">
        <h1 className="text-[18px] md:text-[20px] font-bold">{title}</h1>
      </div>

      <div className="container mx-auto p-4 lg:p-8">
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cột trái */}
          <div className="lg:col-span-2">
            {mainContent}

            <div className="mt-3 flex items-center gap-2">
              {url ? (
                <a href={url} target="_blank" rel="noopener noreferrer"
                   className="px-3 py-1.5 text-sm rounded bg-white/10 hover:bg-white/20">
                  Mở bản gốc
                </a>
              ) : null}
              <Link to={-1} className="px-3 py-1.5 text-sm rounded bg-white/10 hover:bg-white/20">
                Quay lại
              </Link>
            </div>

            {/* Comments từ BE */}
            <div className="mt-6">
              {postId ? (
                /* Nếu chưa có user id ở FE, có thể bỏ currentUserId đi */
                <CommentsPanel postId={postId} />
                // hoặc nếu bạn có user id (ví dụ lấy từ context / localStorage):
                // <CommentsPanel postId={postId} currentUserId={me?.user_id} />
              ) : (
                <div className={`${CARD} p-4 text-sm text-gray-400`}>
                  Thiếu <code>post_id</code> trên URL — ví dụ: <br />
                  <code className="text-xs">/viewer/file?post_id=POST000000000100100001000001</code>
                </div>
              )}
            </div>

          </div>

          {/* Cột phải */}
          <aside className="space-y-6">
            <div className={`${CARD} p-5`}>
              <h2 className="text-sm font-semibold mb-4">Post information</h2>
              <div className="space-y-3 text-gray-300 text-xs">
                <div>
                  <p className="text-[11px] text-gray-400">Album</p>
                  <p>{album}</p>
                </div>
                <div>
                  <p className="text-[11px] text-gray-400">Category</p>
                  <p>{category}</p>
                </div>
                <div>
                  <p className="text-[11px] text-gray-400">Hashtag</p>
                  {hashtags.length ? (
                    <div className="flex flex-wrap gap-2 mt-1">
                      {hashtags.map((t, i) => (
                        <span key={`${t}-${i}`} className="bg-gray-700/40 px-2 py-0.5 rounded text-[11px]">
                          {t.startsWith("#") ? t : `#${t}`}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">—</p>
                  )}
                </div>
              </div>
            </div>

            <div className={`${CARD} p-5`}>
              <h2 className="text-sm font-semibold mb-4">User information</h2>
              <div className="flex items-center">
                <img
                  src={avatar || FALLBACK_AVATAR}
                  alt={authorName}
                  className="w-8 h-8 rounded-full mr-3 object-cover"
                  onError={(e) => {
                    e.currentTarget.src = FALLBACK_AVATAR;
                    e.currentTarget.onerror = null;
                  }}
                />
                <div className="text-xs">
                  <p className="font-semibold">{authorName}</p>
                  <p className="text-gray-400">{username}</p>
                  <p className="text-gray-500 mt-1">{followers}</p>
                </div>
              </div>
            </div>

            <div className={`${CARD} p-5 h-48 grid place-items-center text-center`}>
              <p className="text-xs text-gray-300 px-2">{summary}</p>
            </div>
          </aside>
        </section>

        <PageFooter />
      </div>
    </div>
  );
}
