// src/components/user_manager/list/AlbumItem.jsx
import React from "react";
import { Link } from "react-router-dom";

const FALLBACK =
  "https://i.pinimg.com/736x/18/bd/a5/18bda5a4616cd195fe49a9a32dbab836.jpg";

// style nút View tông tối
const viewBtnClass =
  "inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium " +
  "bg-[#262B33] text-white/90 hover:text-white hover:bg-[#2F3540] active:bg-[#262B33] " +
  "border border-white/10 focus:outline-none focus:ring-2 focus:ring-white/10 " +
  "shadow-sm transition";
const viewBtnDisabled =
  "inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium " +
  "bg-white/5 text-white/45 border border-white/10 cursor-not-allowed";

export default function AlbumItem({
  album,
  active,
  onClick,
  onEdit,
  onDelete,
  onView,
}) {
  const thumb = album?.thumbnail || album?.url_thumbnail || FALLBACK;
  const created = album?.createdAt
    ? new Date(album.createdAt).toLocaleString()
    : album?.created_at
    ? new Date(album.created_at).toLocaleString()
    : "";
  const albumId = album?.id || album?.album_id || "";

  const name = album?.name || album?.album_name || "Untitled album";
  const desc = album?.description || created || "No description";

  return (
    <div
      className={`w-full flex items-center justify-between gap-4 rounded-xl px-4 py-3 border transition ${
        active
          ? "bg-[#262b33] border-[#2d2d33] ring-1 ring-white/40"
          : "bg-[#1C2028] border-[#2d2d33] hover:bg-[#222732]"
      }`}
    >
      {/* chọn item */}
      <button
        onClick={onClick}
        className="flex items-center gap-3 min-w-0 text-left flex-1"
      >
        <img
          src={thumb}
          alt={name}
          className="w-12 h-12 rounded-lg object-cover border border-white/10"
          onError={(e) => (e.currentTarget.src = FALLBACK)}
        />
        <div className="min-w-0">
          <div className="text-white font-semibold leading-tight truncate">
            {name}
          </div>
          <div className="text-xs text-white/60 -mt-0.5 truncate">{desc}</div>
        </div>
      </button>

      {/* actions */}
      <div className="flex items-center gap-2">
        {/* View (ưu tiên onView; nếu không có thì Link, nếu thiếu id thì disabled) */}
        {onView ? (
          <button
            className={viewBtnClass}
            onClick={(e) => {
              e.stopPropagation();
              onView();
            }}
            title="View album"
            aria-label="View album"
          >
            <i className="fa-regular fa-eye text-[11px]" />
            <span className="hidden sm:inline">View</span>
          </button>
        ) : albumId ? (
          <Link
            to={`/album/${encodeURIComponent(albumId)}`}
            className={viewBtnClass}
            onClick={(e) => e.stopPropagation()}
            title="View album"
            aria-label="View album"
          >
            <i className="fa-regular fa-eye text-[11px]" />
            <span className="hidden sm:inline">View</span>
          </Link>
        ) : (
          <button className={viewBtnDisabled} disabled title="No album id">
            <i className="fa-regular fa-eye text-[11px]" />
            <span className="hidden sm:inline">View</span>
          </button>
        )}

        {/* Edit */}
        <button
          className="px-2 py-1 rounded-md border border-white/10 text-xs text-white/80 hover:text-white"
          onClick={(e) => {
            e.stopPropagation();
            onEdit && onEdit();
          }}
          title="Edit"
        >
          <i className="fa-regular fa-pen-to-square mr-1" />
          Edit
        </button>

        {/* Delete */}
        <button
          className="px-2 py-1 rounded-md border border-red-500/30 text-xs text-red-300 hover:text-red-200"
          onClick={(e) => {
            e.stopPropagation();
            onDelete && onDelete();
          }}
          title="Delete"
        >
          <i className="fa-regular fa-trash-can mr-1" />
          Delete
        </button>
      </div>
    </div>
  );
}
