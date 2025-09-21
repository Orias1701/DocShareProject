import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import postService from "../../services/postService";

const FALLBACK_AVATAR = "/images/default-avatar.png";

// Ảnh?
function isImageUrl(url, type) {
  const u = String(url || "");
  if (!u) return false;
  const t = String(type || "").toLowerCase();
  if (t.startsWith("image/")) return true;
  const clean = u.split("#")[0].split("?")[0].toLowerCase();
  return /\.(png|jpe?g|gif|webp|bmp|svg)$/.test(clean);
}

// PDF? (nhận diện rộng tay: mime chứa pdf, đuôi .pdf, hoặc các host phổ biến cần gview)
function isProbablyPdf(url, type) {
  const u = String(url || "");
  if (!u) return false;
  const t = String(type || "").toLowerCase();
  if (t.includes("pdf")) return true;
  const clean = u.split("#")[0].split("?")[0].toLowerCase();
  if (clean.endsWith(".pdf")) return true;
  // nhiều dịch vụ không có .pdf ở URL nhưng vẫn là pdf embeddable:
  return /(drive\.google\.com|docs\.google\.com|dropbox\.com|onedrive\.live\.com|sharepoint\.com)/i.test(
    u
  );
}

const gview = (url) =>
  `https://docs.google.com/gview?embedded=1&url=${encodeURIComponent(url)}`;

function normalizeHashtags(hx) {
  const toDisplay = (s) => {
    const t = String(s || "").trim();
    if (!t) return "";
    return t.startsWith("#") ? t : `#${t}`;
  };
  if (Array.isArray(hx)) {
    return Array.from(
      new Set(
        hx
          .map((t) => {
            if (typeof t === "string") return toDisplay(t);
            const name = t?.name ?? t?.hashtag_name ?? "";
            return toDisplay(name);
          })
          .filter(Boolean)
      )
    );
  }
  if (typeof hx === "string") {
    return Array.from(
      new Set(
        hx
          .split(/[,\s]+/)
          .map((s) => toDisplay(s))
          .filter(Boolean)
      )
    );
  }
  return [];
}

export default function ViewPost() {
  const { postId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [useGview, setUseGview] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setUseGview(false);
        const res = await postService.getByIdCompact(postId);
        const p =
          (res?.data && (Array.isArray(res.data) ? res.data[0] : res.data)) ||
          (Array.isArray(res) ? res[0] : res) ||
          res;

        setData(
          p
            ? {
                id: p.post_id || p.id || postId,
                title: p.title || "Post title",
                author: {
                  name: p.full_name || p.author_name || "User name",
                  avatar: p.avatar_url || p.author_avatar || FALLBACK_AVATAR,
                  followers: p.followers_count ?? "-",
                  username: p.username || "",
                },
                created_at: p.created_at,
                album_name: p.album_name || "",
                category_name: p.category_name || "",
                hashtags: normalizeHashtags(p.hashtags),
                summary: p.summary || p.description || "",
                banner_url: p.banner_url || "",
                file_url: p.file_url || "",
                file_type: p.file_type || "",
                content_html: p.content || "",
              }
            : null
        );
      } finally {
        setLoading(false);
      }
    })();
  }, [postId]);

  const hasFile = !!data?.file_url;
  const looksPdf = useMemo(
    () => isProbablyPdf(data?.file_url, data?.file_type),
    [data?.file_url, data?.file_type]
  );
  const looksImg = useMemo(
    () => isImageUrl(data?.file_url, data?.file_type) || isImageUrl(data?.banner_url),
    [data?.file_url, data?.file_type, data?.banner_url]
  );

  if (loading) return <div className="text-white p-6">Đang tải post…</div>;
  if (!data) return <div className="text-white p-6">Không tìm thấy bài viết.</div>;

  return (
    <div className="bg-[#0D1117] text-white min-h-screen">
      <div className="container mx-auto p-4 lg:p-8">
        <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Nội dung chính */}
          <div className="lg:col-span-2">
            <h1 className="text-3xl font-bold mb-4">{data.title}</h1>

            <div className="bg-[#0F172A] w-full min-h-[480px] rounded-lg overflow-hidden relative">
              {hasFile && looksPdf ? (
                <div className="relative">
                  {/* Thử nhúng trực tiếp */}
                  {!useGview ? (
                    <object
                      data={data.file_url}
                      type="application/pdf"
                      className="w-full h-[80vh]"
                      onError={() => setUseGview(true)}
                    >
                      {setTimeout(() => setUseGview(true), 0)}
                    </object>
                  ) : (
                    <iframe
                      title="PDF Viewer"
                      src={gview(data.file_url)}
                      className="w-full h-[80vh] border-0"
                    />
                  )}
                  <div className="absolute right-3 top-3">
                    <a
                      href={data.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 text-xs bg-black/60 hover:bg-black/80 rounded border border-white/20"
                    >
                      Open original
                    </a>
                  </div>
                </div>
              ) : looksImg ? (
                <img
                  src={data.file_url || data.banner_url}
                  alt={data.title}
                  className="w-full h-auto object-contain"
                />
              ) : data.content_html ? (
                <div
                  className="prose prose-invert max-w-none p-6"
                  dangerouslySetInnerHTML={{ __html: data.content_html }}
                />
              ) : (
                <div className="w-full h-[480px] flex items-center justify-center text-gray-400">
                  Post content will be shown here
                </div>
              )}
            </div>
          </div>

          {/* Sidebar info */}
          <aside className="space-y-6">
            <div className="bg-[#0F172A] p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-4">Post information</h2>
              <div className="space-y-3 text-gray-300">
                {data.album_name && (
                  <div>
                    <p className="text-sm text-gray-400">Album</p>
                    <p>{data.album_name}</p>
                  </div>
                )}
                {data.category_name && (
                  <div>
                    <p className="text-sm text-gray-400">Category</p>
                    <p>{data.category_name}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-400 mb-1">Hashtags</p>
                  {data.hashtags.length ? (
                    <div className="flex flex-wrap gap-2">
                      {data.hashtags.map((t) => (
                        <span
                          key={t}
                          className="bg-white/10 text-white text-xs font-medium px-2 py-1 rounded"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">—</p>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-[#0F172A] p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-4">User information</h2>
              <div className="flex items-center">
                <img
                  src={data.author.avatar || FALLBACK_AVATAR}
                  alt={data.author.name}
                  onError={(e) => (e.currentTarget.src = FALLBACK_AVATAR)}
                  className="w-12 h-12 rounded-full mr-4 object-cover"
                />
                <div>
                  <p className="font-bold">{data.author.name}</p>
                  {data.author.username && (
                    <p className="text-sm text-gray-400">@{data.author.username}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    Followers: {data.author.followers}
                  </p>
                </div>
              </div>
            </div>

            {data.summary && (
              <div className="bg-[#0F172A] p-6 rounded-lg">
                <h2 className="text-xl font-semibold mb-4">Summary</h2>
                <p className="text-gray-300 whitespace-pre-line">{data.summary}</p>
              </div>
            )}
          </aside>
        </main>
      </div>
    </div>
  );
}
