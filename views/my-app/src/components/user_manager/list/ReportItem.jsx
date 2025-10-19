import React from "react";
import { Link } from "react-router-dom";

const FALLBACK_IMG =
  "https://play-lh.googleusercontent.com/YkKvpRk6awQCkSi2oVDRBH7BAWpp0QBUWV9Pf-BVDTvJqwH8q3naROPyZET99DvO1HWq=w240-h480-rw";
const FALLBACK_AVATAR =
  "https://cdn2.fptshop.com.vn/small/avatar_trang_1_cd729c335b.jpg";

const statusClasses = {
  closed:
    "bg-emerald-500/15 text-emerald-200 border border-emerald-500/20 rounded px-2 py-0.5 text-[11px]",
  "in-review":
    "bg-yellow-500/15 text-yellow-200 border border-yellow-500/20 rounded px-2 py-0.5 text-[11px]",
  open:
    "bg-red-500/15 text-red-200 border border-red-500/20 rounded px-2 py-0.5 text-[11px]",
};

// nút view tối màu dùng biến CSS
const viewBtnClass =
  "inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium " +
  "bg-[var(--color-surface-alt)] text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-card-hover)] " +
  "border border-[var(--color-border-soft)] transition";

export default function ReportItem({
  report,
  compact = true,
  onOpen,
  onDelete,
}) {
  if (!report) return null;

  const raw = report.raw || {};
  const title =
    report.title || raw.post_title || `Report: ${raw.post_id || ""}`;
  const bannerUrl =
    report.bannerUrl || raw.banner_url || FALLBACK_IMG;
  const authorName = raw.author_username || "Unknown";
  const authorAvatar = raw.reporter_avatar || FALLBACK_AVATAR;
  const reason = raw.reason || "";
  const reporterName = raw.reporter_name || "";
  const timeLabel =
    report.createdAt ||
    raw.report_created_at
      ? new Date(report.createdAt || raw.report_created_at).toLocaleString()
      : "";
  const statusKey = (report.status || "open").toLowerCase();
  const statusStyle = statusClasses[statusKey] || statusClasses.open;

  const viewerTarget = raw.post_id
    ? `/viewer/content/${encodeURIComponent(raw.post_id)}`
    : null;

  const Thumb = ({ className = "" }) => (
    <Link
      to={viewerTarget || "#"}
      onClick={(e) => {
        if (!viewerTarget) e.preventDefault();
        e.stopPropagation();
      }}
      className={className}
    >
      <img
        src={bannerUrl}
        alt={title}
        className="w-full h-full object-cover"
        onError={(e) => (e.currentTarget.src = FALLBACK_IMG)}
      />
    </Link>
  );

  /** ---------- COMPACT ---------- */
  if (compact)
    return (
      <div className="bg-[var(--color-card-bg)] border border-[var(--color-border-soft)] rounded-xl p-3 text-[var(--color-text)] hover:border-[var(--color-border-strong)] transition">
        <div className="flex items-start gap-3">
          <Thumb className="block w-[140px] h-[88px] rounded-lg overflow-hidden border border-[var(--color-border-soft)] flex-shrink-0" />

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <img
                src={authorAvatar}
                alt={authorName}
                className="w-7 h-7 rounded-full object-cover"
              />
              <span className="text-sm font-semibold truncate">
                {authorName}
              </span>
              {timeLabel && (
                <span className="text-[11px] text-[var(--color-text-muted)]">
                  • {timeLabel}
                </span>
              )}
              <span className={statusStyle}>{statusKey}</span>
            </div>

            <div className="font-semibold line-clamp-1">{title}</div>
            {(reason || reporterName) && (
              <div className="text-xs text-[var(--color-text-muted)] line-clamp-1">
                {reason && `Reason: ${reason}`}
                {reason && reporterName && " — "}
                {reporterName && `by ${reporterName}`}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2 ml-1">
            {viewerTarget && (
              <Link
                to={viewerTarget}
                className={viewBtnClass}
                onClick={(e) => e.stopPropagation()}
              >
                <i className="fa-regular fa-eye text-[11px]" />
                <span className="hidden sm:inline">View</span>
              </Link>
            )}
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

  /** ---------- NORMAL ---------- */
  return (
    <div className="bg-[var(--color-card-bg)] border border-[var(--color-border-soft)] rounded-xl p-4 text-[var(--color-text)]">
      <div className="flex justify-between mb-3 items-center">
        <div className="flex items-center gap-2">
          <img
            src={authorAvatar}
            alt={authorName}
            className="w-8 h-8 rounded-full"
          />
          <div>
            <div className="font-semibold text-sm">{authorName}</div>
            <div className="text-[11px] text-[var(--color-text-muted)]">
              {timeLabel}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className={statusStyle}>{statusKey}</span>
          {viewerTarget && (
            <Link to={viewerTarget} className={viewBtnClass}>
              <i className="fa-regular fa-eye text-[11px]" /> View
            </Link>
          )}
          <button
            className="px-2 py-1 rounded-md border border-red-500/30 text-xs text-red-300 hover:text-red-200"
            onClick={onDelete}
          >
            <i className="fa-regular fa-trash-can mr-1" /> Delete
          </button>
        </div>
      </div>

      <h3 className="font-bold text-base leading-snug mb-2">{title}</h3>
      {(reason || reporterName) && (
        <p className="text-xs text-[var(--color-text-muted)] mb-3">
          {reason && `Reason: ${reason}`}
          {reason && reporterName && " — "}
          {reporterName && `by ${reporterName}`}
        </p>
      )}
      <Thumb className="block rounded-lg overflow-hidden border border-[var(--color-border-soft)] w-full h-[240px]" />
    </div>
  );
}
