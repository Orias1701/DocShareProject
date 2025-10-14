import React from "react";
import { Link } from "react-router-dom";

const FALLBACK_IMG =
  "https://play-lh.googleusercontent.com/YkKvpRk6awQCkSi2oVDRBH7BAWpp0QBUWV9Pf-BVDTvJqwH8q3naROPyZET99DvO1HWq=w240-h480-rw";
const FALLBACK_AVATAR = "https://cdn2.fptshop.com.vn/small/avatar_trang_1_cd729c335b.jpg";

// Lấy <img src="..."> đầu tiên từ content HTML
function extractFirstImage(html) {
  const m = String(html || "").match(/<img[^>]+src=["']([^"']+)["']/i);
  return m?.[1] || "";
}

const statusClasses = {
  closed: "bg-emerald-500/15 text-emerald-200 border-emerald-500/20",
  "in-review": "bg-yellow-500/15 text-yellow-200 border-yellow-500/20",
  open: "bg-red-500/15 text-red-200 border-red-500/20",
};

// 🔧 nút View tông tối
const viewBtnClass =
  "inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium " +
  "bg-[#262B33] text-white/90 hover:text-white hover:bg-[#2F3540] active:bg-[#262B33] " +
  "border border-white/10 focus:outline-none focus:ring-2 focus:ring-white/10 " +
  "shadow-sm transition";
const viewBtnDisabled =
  "inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium " +
  "bg-white/5 text-white/45 border border-white/10 cursor-not-allowed";

export default function ReportItem({
  report,
  compact = true,
  onOpen,
  onEdit,
  onDelete,
  onAuthorClick,
}) {
  if (!report) return null;

  const raw = report.raw || {};
  const postId = report.postId || raw.post_id;
  const title = report.title || raw.post_title || `Report: ${raw.post_id || ""}`;

  const bannerUrl =
    report.bannerUrl || raw.banner_url || extractFirstImage(raw.post_content) || "";

  const fileUrl = report.fileUrl || raw.file_url || "";
  const hasFile = !!(fileUrl && String(fileUrl).trim());
  const fileTarget = hasFile
    ? `/viewer/file?url=${encodeURIComponent(fileUrl)}&title=${encodeURIComponent(
        title || ""
      )}${postId ? `&post_id=${encodeURIComponent(postId)}` : ""}`
    : null;
  const contentTarget = postId ? `/viewer/content/${encodeURIComponent(postId)}` : null;
  const viewerTarget = fileTarget || contentTarget;

  const authorName = raw.author_username || "Unknown";
  const authorAvatar = raw.reporter_avatar || FALLBACK_AVATAR;
  const reporterName = raw.reporter_name || "";
  const reason = raw.reason || "";
  const timeLabel = report.createdAt
    ? new Date(report.createdAt).toLocaleString()
    : raw.report_created_at
    ? new Date(raw.report_created_at).toLocaleString()
    : "";
  const statusKey = (report.status || "open").toLowerCase();
  const statusStyle = statusClasses[statusKey] || statusClasses.open;

  const hashtags = [raw.category_name, raw.album_name]
    .map((x) => (x ? `#${String(x).trim().replace(/\s+/g, "")}` : ""))
    .filter(Boolean);

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
          <span className="hidden sm:inline">View</span>
        </Link>
      );
    }
    return (
      <button className={viewBtnDisabled} disabled title="No content">
        <i className="fa-regular fa-eye text-[11px]" />
        <span className="hidden sm:inline">View</span>
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
      aria-label="Mở viewer"
    >
      <img
        src={bannerUrl || FALLBACK_IMG}
        alt={title || "report image"}
        className="w-full h-full object-cover"
        onError={(e) => (e.currentTarget.src = FALLBACK_IMG)}
        loading="lazy"
      />
    </Link>
  );

  // ---------- COMPACT ----------
  if (compact) {
    return (
      <div className="bg-[#1C2028] border border-white/10 rounded-xl p-3 text-white hover:border-white/20 transition">
        <div className="flex items-start gap-3">
          <Thumb className="block w-[140px] h-[88px] md:w-[160px] md:h-[96px] rounded-lg overflow-hidden border border-white/10 flex-shrink-0" />

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
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
                <span className="text-sm font-semibold truncate max-w-[180px] md:max-w-[220px]">
                  {authorName || "Unknown"}
                </span>
              </button>

              {timeLabel && (
                <span className="text-[11px] text-white/60 truncate">• {timeLabel}</span>
              )}

              <span className={`ml-1 px-1.5 py-0.5 text-[10px] rounded border ${statusStyle}`}>
                {statusKey}
              </span>
            </div>

            {viewerTarget ? (
              <Link
                to={viewerTarget}
                onClick={(e) => e.stopPropagation()}
                className="block font-semibold leading-snug line-clamp-1"
                title={title}
              >
                {title}
              </Link>
            ) : (
              <div className="font-semibold leading-snug line-clamp-1">{title}</div>
            )}

            {(reason || reporterName) && (
              <div className="text-xs text-white/60 mt-0.5 line-clamp-1">
                {reason ? `Reason: ${reason}` : ""}
                {reason && reporterName ? " — " : ""}
                {reporterName ? `by ${reporterName}` : ""}
              </div>
            )}

            {hashtags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-1">
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

          <div className="flex flex-col gap-2 ml-1">
            <ViewButton />
            {/* <button
              className="px-2 py-1 rounded-md border border-white/10 text-xs text-white/80 hover:text-white"
              onClick={(e) => {
                e.stopPropagation();
                onEdit && onEdit();
              }}
              title="Edit"
            >
              <i className="fa-regular fa-pen-to-square" />
            </button> */}
            <button
              className="px-2 py-1 rounded-md border border-red-500/30 text-xs text-red-300 hover:text-red-200"
              onClick={(e) => {
                e.stopPropagation();
                onDelete && onDelete();
              }}
              title="Delete"
            >
              <i className="fa-regular fa-trash-can" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ---------- NORMAL ----------
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
            {timeLabel && <div className="text-[11px] text-white/60 truncate">{timeLabel}</div>}
          </div>
        </button>

        <div className="flex items-center gap-2">
          <span className={`px-2 py-0.5 text-[11px] rounded border ${statusStyle}`}>
            {statusKey}
          </span>
          <Link to={viewerTarget || "#"} className={viewerTarget ? viewBtnClass : viewBtnDisabled}>
            <i className="fa-regular fa-eye text-[11px]" />
            View
          </Link>
          <button className="px-2 py-1 rounded-md border border-white/10 text-xs text-white/80 hover:text-white" onClick={onEdit}>
            <i className="fa-regular fa-pen-to-square mr-1" /> Edit
          </button>
          <button className="px-2 py-1 rounded-md border border-red-500/30 text-xs text-red-300 hover:text-red-200" onClick={onDelete}>
            <i className="fa-regular fa-trash-can mr-1" /> Delete
          </button>
        </div>
      </div>

      <h3 className="font-bold text-base leading-snug mb-1 line-clamp-2">{title}</h3>
      {(reason || reporterName) && (
        <div className="text-xs text-white/60 mb-2">
          {reason ? `Reason: ${reason}` : ""}
          {reason && reporterName ? " — " : ""}
          {reporterName ? `by ${reporterName}` : ""}
        </div>
      )}

      <div className="flex flex-wrap gap-2 mb-3">
        {hashtags.slice(0, 3).map((tag) => (
          <span key={tag} className="bg-blue-600/30 text-blue-200 text-[11px] font-semibold px-2 py-1 rounded">
            {tag}
          </span>
        ))}
      </div>

      <Link
        to={viewerTarget || "#"}
        onClick={(e) => {
          if (!viewerTarget) e.preventDefault();
        }}
        className="block rounded-lg overflow-hidden border border-white/10 w-full h-[220px] sm:h-[240px] md:h-[260px] lg:h-[320px]"
      >
        <img
          src={bannerUrl || FALLBACK_IMG}
          alt={title || "report image"}
          className="w-full h-full object-cover"
          onError={(e) => (e.currentTarget.src = FALLBACK_IMG)}
          loading="lazy"
        />
      </Link>
    </div>
  );
}
