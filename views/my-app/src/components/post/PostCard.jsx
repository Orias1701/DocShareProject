import React, { useMemo } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import BookmarkButton from "./BookmarkButton";
import ReactionThumbs from "./ReactionThumbs";
import PostOptionsMenu from "./PostOptionsMenu";

const FALLBACK_URL =
  "https://play-lh.googleusercontent.com/YkKvpRk6awQCkSi2oVDRBH7BAWpp0QBUWV9Pf-BVDTvJqwH8q3naROPyZET99DvO1HWq=w240-h480-rw";
const FALLBACK_AVATAR =
  "https://cdn2.fptshop.com.vn/small/avatar_trang_1_cd729c335b.jpg";

/** Chuẩn hoá hashtag sang dạng #tag */
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
      new Set(hx.split(/[,\s]+/).map((s) => toDisplay(s)).filter(Boolean))
    );
  }
  return [];
}

/** Kiểm tra URL ảnh hợp lệ */
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
  initiallyBookmarked,
  onBookmarkChange,
  hideReactions = false,
  onDeleted,
  onEdited,
}) {
  if (!post || typeof post !== "object") return null;

  const postId = useMemo(() => post?.post_id ?? post?.id ?? null, [post]);

  const title = post?.title ?? post?.name ?? post?.post_title ?? "Untitled";
  const authorName =
    post?.authorName ?? post?.author?.name ?? post?.full_name ?? "Ẩn danh";
  const authorAvatar =
    post?.authorAvatar ?? post?.author?.avatar ?? post?.avatar_url ?? FALLBACK_AVATAR;
  const authorId =
    post?.authorId ?? post?.author?.id ?? post?.author_id ?? post?.user_id ?? null;

  const uploadTime = post?.uploadTime ?? post?.createdAt ?? post?.created_at ?? "";
  const albumName = post?.albumName ?? post?.album?.name ?? post?.album_name ?? "";

  const hashtags = normalizeHashtags(post?.hashtags);
  const displayTags = hashtags.slice(0, maxTags);
  const extraTags = Math.max(0, hashtags.length - maxTags);

  const stats = {
    likes: Number(post?.stats?.likes ?? post?.reaction_like_count ?? 0),
    dislikes: Number(post?.stats?.dislikes ?? post?.reaction_dislike_count ?? 0),
  };

  const rawBanner = post?.banner || post?.banner_url || post?.bannerUrl || "";
  const bannerUrl = rawBanner && isImageUrl(rawBanner) ? rawBanner : "";
  const displayImage = bannerUrl || placeholderImage;
  const fileUrl = (post?.file?.url || post?.file_url || "").trim();

  // ---- Ảnh preview ----
  const contentEl = (
    <div className="w-full rounded-lg overflow-hidden">
      <img
        src={displayImage}
        alt={bannerUrl ? "Banner" : "Placeholder"}
        className="w-full h-auto aspect-video object-cover"
        loading="lazy"
        onError={(e) => (e.currentTarget.src = FALLBACK_URL)}
      />
    </div>
  );

  const preview = fileUrl ? (
    <Link
      to={`/viewer/file?url=${encodeURIComponent(fileUrl)}&title=${encodeURIComponent(title)}${
        postId ? `&post_id=${encodeURIComponent(postId)}` : ""
      }`}
      className="block"
      aria-label="Xem nội dung"
    >
      {contentEl}
    </Link>
  ) : bannerUrl ? (
    <a
      href={bannerUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="block"
      aria-label="Mở banner"
    >
      {contentEl}
    </a>
  ) : (
    <Link to={`/viewer/content/${postId}`} className="block" aria-label="Xem post">
      {contentEl}
    </Link>
  );

  const initialBM =
    typeof initiallyBookmarked === "boolean" ? initiallyBookmarked : !!post?.is_bookmarked;
  const initialThumbReaction =
    post?.my_reaction === "like" || post?.my_reaction === "dislike"
      ? post.my_reaction
      : null;

  // ---- UI ----
  return (
    <div
      className="
        bg-[var(--color-card-bg)]
        border border-[var(--color-card-border)]
        rounded-xl p-4 flex flex-col h-full
        text-[var(--color-text)]
        hover:bg-[var(--color-card-hover)]
        transition-colors
      "
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 min-w-0">
          {authorId ? (
            <Link
              to={`/profile/${encodeURIComponent(authorId)}`}
              className="flex items-center gap-2 min-w-0"
            >
              <img
                src={authorAvatar}
                alt={authorName}
                className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                onError={(e) => (e.currentTarget.src = FALLBACK_AVATAR)}
              />
              <span className="font-semibold text-sm truncate">{authorName}</span>
            </Link>
          ) : (
            <>
              <img
                src={authorAvatar}
                alt={authorName}
                className="w-8 h-8 rounded-full object-cover flex-shrink-0"
              />
              <span className="font-semibold text-sm truncate">{authorName}</span>
            </>
          )}
        </div>

        <PostOptionsMenu
          postId={postId}
          ownerId={authorId}
          postRaw={post}
          onDeleted={onDeleted}
          onEdited={onEdited}
        />
      </div>

      {/* Body */}
      <div className="flex-grow">
        <h3 className="font-bold text-base mb-2 leading-snug line-clamp-3 min-h-[60px]">
          {title}
        </h3>

        {/* Album & Hashtags */}
        <div className="min-h-[28px] mb-2">
          <div className="flex flex-wrap gap-2">
            {/* Album Chip — nổi bật hơn hashtag */}
            {showAlbum && albumName && (
              <span
                className="
                  inline-flex items-center gap-1
                  text-[11px] font-semibold px-2 py-1 rounded
                  max-w-[220px] truncate
                  bg-[var(--color-accent)]
                  hover:bg-[var(--color-accent-hover)]
                  text-[var(--color-text)]
                  border border-[var(--color-border-strong)]
                  transition-colors
                "
                title={albumName}
              >
                <i className="fa-regular fa-folder-open text-[12px]"></i>
                {albumName}
              </span>
            )}

            {/* Hashtags */}
            {displayTags.map((tag) => (
              <span
                key={tag}
                className="
                  text-xs font-medium px-2 py-1 rounded
                  max-w-[160px] truncate
                  bg-[var(--color-muted-bg)]
                  text-[var(--color-text-muted)]
                  border border-[var(--color-border-soft)]
                "
                title={tag}
              >
                {tag}
              </span>
            ))}

            {extraTags > 0 && (
              <span
                className="
                  text-xs font-semibold px-2 py-1 rounded
                  bg-[var(--color-muted-bg)]
                  text-[var(--color-text-muted)]
                  border border-[var(--color-border-soft)]
                "
              >
                +{extraTags}
              </span>
            )}
          </div>
        </div>

        {uploadTime && (
          <p className="text-xs text-[var(--color-info)] mb-3">{uploadTime}</p>
        )}

        <div className="mb-3">{preview}</div>
      </div>

      {/* Reactions + Bookmark */}
      {!hideReactions && (
        <div className="border-t border-[var(--color-border-soft)] pt-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <ReactionThumbs
              postId={postId}
              initialCounts={{ like: stats.likes, dislike: stats.dislikes }}
              initialMyReaction={initialThumbReaction}
              autoRefresh={true}
            />
          </div>
          <BookmarkButton
            postId={postId}
            initiallyBookmarked={initialBM}
            onChange={onBookmarkChange}
          />
        </div>
      )}
    </div>
  );
}

PostCard.propTypes = {
  post: PropTypes.object,
  showAlbum: PropTypes.bool,
  maxTags: PropTypes.number,
  placeholderImage: PropTypes.string,
  initiallyBookmarked: PropTypes.bool,
  onBookmarkChange: PropTypes.func,
  hideReactions: PropTypes.bool,
  onDeleted: PropTypes.func,
  onEdited: PropTypes.func,
};
