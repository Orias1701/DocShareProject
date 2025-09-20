// src/components/post/PostCard.jsx
import React, { useMemo } from "react";
import PropTypes from "prop-types";
import BookmarkButton from "./BookmarkButton";

const FALLBACK_URL = "https://www.google.com/favicon.ico";
const FALLBACK_AVATAR = "https://via.placeholder.com/80?text=User";

/** Chuẩn hoá hashtag */
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

/** Check ảnh */
function isImageUrl(url, type) {
  const u = String(url || "");
  if (!u) return false;
  if (type && String(type).startsWith("image/")) return true;
  return /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(u);
}

export default function PostCard({
  post = {},
  showAlbum = true,
  maxTags = 3,
  placeholderImage = FALLBACK_URL,
  initiallyBookmarked, // optional
  onBookmarkChange,    // optional
}) {
  if (!post || typeof post !== "object") return null;

  const postId = useMemo(() => post?.post_id ?? post?.id ?? null, [post]);

  // ----- Normalize dữ liệu -----
  const title = post?.title ?? post?.name ?? post?.post_title ?? "Untitled";
  const authorName =
    post?.authorName ?? post?.author?.name ?? post?.full_name ?? "Ẩn danh";
  const authorAvatar =
    post?.authorAvatar ?? post?.author?.avatar ?? post?.avatar_url ?? FALLBACK_AVATAR;

  const uploadTime = post?.uploadTime ?? post?.createdAt ?? post?.created_at ?? "";
  const albumName = post?.albumName ?? post?.album?.name ?? post?.album_name ?? "";

  const hashtags = normalizeHashtags(post?.hashtags);
  const displayTags = hashtags.slice(0, maxTags);
  const extraTags = Math.max(0, hashtags.length - maxTags);

  const stats = {
    likes: Number(post?.stats?.likes ?? post?.reaction_count ?? 0),
    comments: Number(post?.stats?.comments ?? post?.comment_count ?? 0),
    views:
      typeof post?.stats?.views !== "undefined"
        ? post?.stats?.views
        : post?.view_count ?? 0,
  };

  // ---- Banner / Placeholder ----
  const rawBanner = post?.banner || post?.banner_url || post?.bannerUrl || "";
  const bannerUrl = rawBanner && isImageUrl(rawBanner) ? rawBanner : "";
  const displayImage = bannerUrl || placeholderImage;

  // ---- Link preview ----
  const fileUrl = (post?.file?.url || post?.file_url || "").trim();
  const previewClickUrl = fileUrl || bannerUrl || "";

  const contentEl = (
    <div className="w-full rounded-lg overflow-hidden">
      <img
        src={displayImage}
        alt={bannerUrl ? "Banner" : "Placeholder"}
        className="w-full h-auto aspect-video object-cover"
        loading="lazy"
      />
    </div>
  );

  const preview = previewClickUrl ? (
    <a
      href={previewClickUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="block"
      aria-label="Mở nội dung"
    >
      {contentEl}
    </a>
  ) : (
    <div>{contentEl}</div>
  );

  // Icon nhỏ
  const Icon = (cls, v) => (
    <div className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors cursor-pointer">
      <i className={cls}></i>
      <span className="text-xs font-medium">{v ?? 0}</span>
    </div>
  );

  // ✅ Lấy trạng thái bookmark ban đầu
  const initialBM =
    typeof initiallyBookmarked === "boolean"
      ? initiallyBookmarked
      : !!post?.is_bookmarked;

  return (
    <div className="bg-[#1C2028] border border-gray-700/80 rounded-xl p-4 flex flex-col h-full text-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <img
            src={authorAvatar}
            alt={authorName}
            className="w-8 h-8 rounded-full object-cover flex-shrink-0"
          />
          <span className="font-semibold text-sm truncate">{authorName}</span>
        </div>
        <button className="text-gray-400 hover:text-white" aria-label="more options">
          <i className="fa-solid fa-ellipsis-vertical"></i>
        </button>
      </div>

      {/* Body */}
      <div className="flex-grow">
        <h3 className="font-bold text-base mb-2 leading-snug line-clamp-3 min-h-[60px]">
          {title}
        </h3>

        {/* Album + Hashtags */}
        <div className="min-h-[28px] mb-2">
          <div className="flex flex-wrap gap-2">
            {showAlbum && albumName && (
              <span
                className="bg-blue-600/30 text-blue-200 text-[11px] font-semibold px-2 py-1 rounded max-w-[180px] truncate"
                title={albumName}
              >
                {albumName}
              </span>
            )}
            {displayTags.map((tag) => (
              <span
                key={tag}
                className="bg-gray-700/50 text-gray-300 text-xs font-medium px-2 py-1 rounded max-w-[140px] truncate"
                title={tag}
              >
                {tag}
              </span>
            ))}
            {extraTags > 0 && (
              <span className="bg-gray-700/50 text-gray-300 text-xs font-semibold px-2 py-1 rounded">
                +{extraTags}
              </span>
            )}
          </div>
        </div>

        {uploadTime && <p className="text-xs text-gray-500 mb-3">{uploadTime}</p>}

        {/* Preview */}
        <div className="mb-3">{preview}</div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-700/80 pt-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {Icon("fa-solid fa-heart", stats.likes)}
          {Icon("fa-solid fa-comment", stats.comments)}
          {Icon("fa-solid fa-eye", stats.views)}
        </div>

        {/* Bookmark */}
        <BookmarkButton
          postId={postId}
          initiallyBookmarked={initialBM}
          onChange={onBookmarkChange}
        />
      </div>
    </div>
  );
}

PostCard.propTypes = {
  post: PropTypes.oneOfType([
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      post_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      title: PropTypes.string,
      authorName: PropTypes.string,
      authorAvatar: PropTypes.string,
      author: PropTypes.shape({ name: PropTypes.string, avatar: PropTypes.string }),
      full_name: PropTypes.string,
      avatar_url: PropTypes.string,
      albumName: PropTypes.string,
      album: PropTypes.shape({ name: PropTypes.string }),
      album_name: PropTypes.string,
      hashtags: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.arrayOf(
          PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.shape({
              name: PropTypes.string,
              hashtag_name: PropTypes.string,
            }),
          ])
        ),
      ]),
      uploadTime: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      createdAt: PropTypes.string,
      created_at: PropTypes.string,
      banner: PropTypes.string,
      banner_url: PropTypes.string,
      bannerUrl: PropTypes.string,
      file: PropTypes.shape({ url: PropTypes.string, type: PropTypes.string }),
      file_url: PropTypes.string,
      file_type: PropTypes.string,
      is_bookmarked: PropTypes.bool,
      stats: PropTypes.shape({
        likes: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        comments: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        views: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      }),
      reaction_count: PropTypes.number,
      comment_count: PropTypes.number,
      view_count: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    }),
    PropTypes.oneOf([null, undefined]),
  ]),
  showAlbum: PropTypes.bool,
  maxTags: PropTypes.number,
  placeholderImage: PropTypes.string,
  initiallyBookmarked: PropTypes.bool,
  onBookmarkChange: PropTypes.func,
};
