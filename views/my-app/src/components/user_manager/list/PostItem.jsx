import React from "react";
import { Link } from "react-router-dom";

const FALLBACK_IMG =
  "https://play-lh.googleusercontent.com/YkKvpRk6awQCkSi2oVDRBH7BAWpp0QBUWV9Pf-BVDTvJqwH8q3naROPyZET99DvO1HWq=w240-h480-rw";
const FALLBACK_AVATAR =
  "https://cdn2.fptshop.com.vn/small/avatar_trang_1_cd729c335b.jpg";

/**
 * PostItem
 * - compact=true: hiển thị dạng hàng (row) nhỏ gọn cho quản trị
 * - compact=false: dạng thẻ có ảnh lớn
 */
export default function PostItem({
  post,
  compact = false,
  onOpen,
  onEdit,
  onDelete,
  onAuthorClick,
}) {
  if (!post) return null;

  const {
    id,
    title,
    authorName,
    authorAvatar,
    uploadTime,
    hashtags = [],
    bannerUrl,
    fileUrl,
  } = post;

  const viewerTarget = id ? `/viewer/content/${encodeURIComponent(id)}` : "#";

  // Style nút View với biến CSS
  const viewBtnClass =
    "inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium " +
    "bg-[var(--color-surface-alt)] text-[var(--color-text-secondary)] " +
    "hover:text-[var(--color-text)] hover:bg-[var(--color-card-hover)] active:bg-[var(--color-surface-alt)] " +
    "border border-[var(--color-border-soft)] focus:outline-none focus:ring-2 focus:ring-[var(--color-border-strong)] " +
    "shadow-sm transition";
  const viewBtnDisabled =
    "inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium " +
    "bg-[var(--color-disabled-bg)] text-[var(--color-text-muted)] border border-[var(--color-border-soft)] cursor-not-allowed";

  const ViewButton = () => {
    if (onOpen) {
      return (
        <button
          className={viewBtnClass}
          onClick={(e) => {
            e.stopPropagation();
            onOpen();
          }}
        >
          <i className="fa-regular fa-eye text-[11px]" />
          <span className="hidden sm:inline">View</span>
        </button>
      );
    }
    if (viewerTarget) {
      return (
        <Link
          to={viewerTarget}
          className={viewBtnClass}
          onClick={(e) => e.stopPropagation()}
        >
          <i className="fa-regular fa-eye text-[11px]" />
        </Link>
      );
    }
    return (
      <button className={viewBtnDisabled} disabled>
        <i className="fa-regular fa-eye text-[11px]" />
      </button>
    );
  };

  const Thumb = ({ className = "" }) => (
    <Link
      to={viewerTarget || "#"}
      onClick={(e) => {
        if (!viewerTarget) e.preventDefault();
        e.stopPropagation();
      }}
      className={className}
      aria-label="Mở post"
    >
      <img
        src={bannerUrl || FALLBACK_IMG}
        alt={title || "post image"}
        className="w-full h-full object-cover"
        onError={(e) => (e.currentTarget.src = FALLBACK_IMG)}
        loading="lazy"
      />
    </Link>
  );

  /** --------- COMPACT (row) --------- */
  if (compact) {
    return (
      <div className="bg-[var(--color-card-bg)] border border-[var(--color-border-soft)] rounded-xl p-3 text-[var(--color-text)]">
        <div className="flex items-start gap-3">
          <Thumb className="block w-[160px] h-[100px] rounded-lg overflow-hidden border border-[var(--color-border-soft)] flex-shrink-0" />

          <div className="min-w-0 flex-1">
            {/* author */}
            <div className="flex items-center gap-2 mb-1">
              <img
                src={authorAvatar || FALLBACK_AVATAR}
                alt={authorName}
                className="w-7 h-7 rounded-full object-cover"
                onError={(e) => (e.currentTarget.src = FALLBACK_AVATAR)}
              />
              <span className="text-sm font-semibold truncate">
                {authorName || "Unknown"}
              </span>
              {uploadTime && (
                <span className="text-[11px] text-[var(--color-text-muted)]">
                  • {uploadTime}
                </span>
              )}
            </div>

            {/* title */}
            <div className="font-semibold line-clamp-2 mb-1">{title}</div>

            {/* tags */}
            {Array.isArray(hashtags) && hashtags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {hashtags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="bg-blue-600/30 text-blue-200 text-[11px] font-medium px-2 py-0.5 rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* actions */}
          <div className="flex flex-col gap-2 ml-1">
            <ViewButton />
            <button
              className="px-2 py-1 rounded-md border border-[var(--color-border-soft)] text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
              onClick={(e) => {
                e.stopPropagation();
                onEdit && onEdit();
              }}
            >
              <i className="fa-regular fa-pen-to-square" />
            </button>
            <button
              className="px-2 py-1 rounded-md border border-red-500/30 text-xs text-red-300 hover:text-red-200"
              onClick={(e) => {
                e.stopPropagation();
                onDelete && onDelete();
              }}
            >
              <i className="fa-regular fa-trash-can" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  /** --------- NORMAL (card) --------- */
  return (
    <div className="bg-[var(--color-card-bg)] border border-[var(--color-border-soft)] rounded-xl p-4 text-[var(--color-text)]">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <img
            src={authorAvatar || FALLBACK_AVATAR}
            alt={authorName}
            className="w-8 h-8 rounded-full object-cover"
          />
          <div className="min-w-0">
            <div className="font-semibold text-sm truncate">{authorName}</div>
            <div className="text-[11px] text-[var(--color-text-muted)]">
              {uploadTime}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ViewButton />
          <button
            className="px-2 py-1 rounded-md border border-[var(--color-border-soft)] text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
            onClick={(e) => {
              e.stopPropagation();
              onEdit && onEdit();
            }}
          >
            <i className="fa-regular fa-pen-to-square mr-1" /> Edit
          </button>
          <button
            className="px-2 py-1 rounded-md border border-red-500/30 text-xs text-red-300 hover:text-red-200"
            onClick={(e) => {
              e.stopPropagation();
              onDelete && onDelete();
            }}
          >
            <i className="fa-regular fa-trash-can mr-1" /> Delete
          </button>
        </div>
      </div>

      <h3 className="font-bold text-base mb-2">{title}</h3>
      <Thumb className="block rounded-lg overflow-hidden border border-[var(--color-border-soft)] w-full h-[240px]" />
    </div>
  );
}
