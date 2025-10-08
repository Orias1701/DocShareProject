import React from "react";
import { Link } from "react-router-dom";

const FALLBACK_IMG =
  "https://i.pinimg.com/736x/18/bd/a5/18bda5a4616cd195fe49a9a32dbab836.jpg";
const FALLBACK_AVATAR = "https://i.pravatar.cc/100?img=12";

/**
 * PostItem
 * - compact=true: hiển thị dạng hàng (row) nhỏ gọn để quản trị
 * - compact=false: dạng thẻ có ảnh lớn
 */
export default function PostItem({
  post,
  compact = false,
  onOpen,        // optional: nếu truyền vào thì View sẽ gọi hàm này
  onEdit,
  onDelete,
  onAuthorClick,
}) {
  if (!post) return null;

  const {
    id,
    title,
    authorId,
    authorName,
    authorAvatar,
    uploadTime,
    hashtags = [],
    bannerUrl,
    fileUrl,
  } = post;

  const hasFile = !!(fileUrl && String(fileUrl).trim());
  const fileTarget = hasFile
    ? `/viewer/file?url=${encodeURIComponent(fileUrl)}&title=${encodeURIComponent(
        title || ""
      )}${id ? `&post_id=${encodeURIComponent(id)}` : ""}`
    : null;
  const contentTarget = id ? `/viewer/content/${encodeURIComponent(id)}` : null;

  // 👉 View luôn đi tới viewer: ưu tiên file → content
  const viewerTarget = fileTarget || contentTarget;

  // 🎨 nút View tông tối (đồng bộ dark theme)
  const viewBtnClass =
    "inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium " +
    "bg-[#262B33] text-white/90 hover:text-white hover:bg-[#2F3540] active:bg-[#262B33] " +
    "border border-white/10 focus:outline-none focus:ring-2 focus:ring-white/10 " +
    "shadow-sm transition";
  const viewBtnDisabled =
    "inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium " +
    "bg-white/5 text-white/45 border border-white/10 cursor-not-allowed";

  // ✅ Nút View: điều hướng tới viewer; chặn bubble để không trigger click ở thẻ cha
  const ViewButton = () => {
    if (onOpen) {
      return (
        <button
          className={viewBtnClass}
          onClick={(e) => {
            e.stopPropagation();
            onOpen();
          }}
          title="View"
          aria-label="View"
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
          title="View"
          aria-label="View"
        >
          <i className="fa-regular fa-eye text-[11px]" />
          {/* <span className="hidden sm:inline">View</span> */}
        </Link>
      );
    }
    return (
      <button className={viewBtnDisabled} disabled title="No content">
        <i className="fa-regular fa-eye text-[11px]" />
        {/* <span className="hidden sm:inline">View</span> */}
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
      <div className="bg-[#1C2028] border border-white/10 rounded-xl p-3 text-white">
        <div className="flex items-start gap-3">
          {/* thumb nhỏ → viewer */}
          <Thumb className="block w-[160px] h-[100px] md:w-[180px] md:h-[110px] rounded-lg overflow-hidden border border-white/10 flex-shrink-0" />

          {/* nội dung */}
          <div className="min-w-0 flex-1">
            {/* author + time */}
            <div className="flex items-center gap-2 mb-1">
              {authorId ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onAuthorClick && onAuthorClick();
                  }}
                  className="flex items-center gap-2 min-w-0"
                  title="Xem tác giả"
                >
                  <img
                    src={authorAvatar || FALLBACK_AVATAR}
                    alt={authorName || "author"}
                    className="w-7 h-7 rounded-full object-cover"
                    onError={(e) => (e.currentTarget.src = FALLBACK_AVATAR)}
                  />
                  <span className="text-sm font-semibold truncate max-w-[160px] md:max-w-[220px]">
                    {authorName || "Unknown"}
                  </span>
                </button>
              ) : (
                <div className="flex items-center gap-2 min-w-0">
                  <img
                    src={authorAvatar || FALLBACK_AVATAR}
                    className="w-7 h-7 rounded-full object-cover"
                    alt=""
                  />
                  <span className="text-sm font-semibold truncate">
                    {authorName || "Unknown"}
                  </span>
                </div>
              )}
              {uploadTime && (
                <span className="text-[11px] text-white/60 truncate">• {uploadTime}</span>
              )}
            </div>

            {/* title → viewer */}
            {viewerTarget ? (
              <Link
                to={viewerTarget}
                onClick={(e) => e.stopPropagation()}
                className="block font-semibold leading-snug line-clamp-2 mb-1"
                title={title}
              >
                {title || "Untitled"}
              </Link>
            ) : (
              <div className="font-semibold leading-snug line-clamp-2 mb-1">
                {title || "Untitled"}
              </div>
            )}

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
                {hashtags.length > 3 && (
                  <span className="text-[11px] text-white/60">
                    +{hashtags.length - 3}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* actions */}
          <div className="flex flex-col gap-2 ml-1">
            <ViewButton />

            <button
              className="px-2 py-1 rounded-md border border-white/10 text-xs text-white/80 hover:text-white"
              onClick={(e) => {
                e.stopPropagation();
                onEdit && onEdit();
              }}
              title="Edit"
              aria-label="Edit post"
            >
              <i className="fa-regular fa-pen-to-square" />
            </button>

            <button
              className="px-2 py-1 rounded-md border border-red-500/30 text-xs text-red-300 hover:text-red-200"
              onClick={(e) => {
                e.stopPropagation();
                onDelete && onDelete();
              }}
              title="Delete"
              aria-label="Delete post"
            >
              <i className="fa-regular fa-trash-can" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  /** --------- NORMAL (thẻ lớn) --------- */
  return (
    <div className="bg-[#1C2028] border border-white/10 rounded-xl p-4 text-white">
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAuthorClick && onAuthorClick();
          }}
          className="flex items-center gap-2 min-w-0"
        >
          <img
            src={authorAvatar || FALLBACK_AVATAR}
            alt={authorName || "author"}
            className="w-8 h-8 rounded-full object-cover"
            onError={(e) => (e.currentTarget.src = FALLBACK_AVATAR)}
          />
          <div className="min-w-0">
            <div className="font-semibold text-sm truncate">{authorName || "Unknown"}</div>
            {uploadTime && <div className="text-[11px] text-white/60 truncate">{uploadTime}</div>}
          </div>
        </button>

        <div className="flex items-center gap-2">
          <ViewButton />

          <button
            className="px-2 py-1 rounded-md border border-white/10 text-xs text-white/80 hover:text-white"
            onClick={(e) => {
              e.stopPropagation();
              onEdit && onEdit();
            }}
          >
            <i className="fa-regular fa-pen-to-square mr-1" />
            Edit
          </button>
          <button
            className="px-2 py-1 rounded-md border border-red-500/30 text-xs text-red-300 hover:text-red-200"
            onClick={(e) => {
              e.stopPropagation();
              onDelete && onDelete();
            }}
          >
            <i className="fa-regular fa-trash-can mr-1" />
            Delete
          </button>
        </div>
      </div>

      <h3 className="font-bold text-base mb-2 leading-snug line-clamp-2">
        {title || "Untitled"}
      </h3>

      {Array.isArray(hashtags) && hashtags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {hashtags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="bg-blue-600/30 text-blue-200 text-[11px] font-semibold px-2 py-1 rounded"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* ảnh lớn → viewer */}
      <Thumb className="block rounded-lg overflow-hidden border border-white/10 w-full h-[220px] sm:h-[240px] md:h-[260px] lg:h-[320px]" />
    </div>
  );
}
