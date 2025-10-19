import React from "react";
import { Link } from "react-router-dom";

const FALLBACK =
  "https://i.pinimg.com/736x/18/bd/a5/18bda5a4616cd195fe49a9a32dbab836.jpg";

export default function AlbumItem({ album, active, onClick, onEdit, onDelete, onView }) {
  const thumb = album?.thumbnail || album?.url_thumbnail || FALLBACK;
  const created = album?.createdAt || album?.created_at || "";
  const albumId = album?.id || album?.album_id || "";
  const name = album?.name || album?.album_name || "Untitled album";
  const desc = album?.description || new Date(created).toLocaleString() || "No description";

  const viewBtn =
    "inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium " +
    "bg-[var(--color-surface-alt)] text-[var(--color-text-secondary)] hover:text-[var(--color-text)] " +
    "hover:bg-[var(--color-hover-bg)] border border-[var(--color-border-soft)] transition";
  const viewBtnDisabled =
    "inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium " +
    "bg-[var(--color-disabled-bg)] text-[var(--color-text-muted)] border border-[var(--color-border-soft)] cursor-not-allowed";

  return (
    <div
      className={`w-full flex items-center justify-between gap-4 rounded-xl px-4 py-3 border transition ${
        active
          ? "bg-[var(--color-surface-alt)] border-[var(--color-border-strong)] ring-1 ring-[var(--color-accent)]"
          : "bg-[var(--color-card-bg)] border-[var(--color-border-soft)] hover:bg-[var(--color-card-hover)]"
      }`}
    >
      {/* Item chọn */}
      <button onClick={onClick} className="flex items-center gap-3 min-w-0 text-left flex-1">
        <img
          src={thumb}
          alt={name}
          className="w-12 h-12 rounded-lg object-cover border border-[var(--color-border-soft)]"
          onError={(e) => (e.currentTarget.src = FALLBACK)}
        />
        <div className="min-w-0">
          <div className="font-semibold text-[var(--color-text)] truncate">{name}</div>
          <div className="text-xs text-[var(--color-text-muted)] truncate">{desc}</div>
        </div>
      </button>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {onView ? (
          <button
            className={viewBtn}
            onClick={(e) => {
              e.stopPropagation();
              onView();
            }}
          >
            <i className="fa-regular fa-eye text-[11px]" /> <span>View</span>
          </button>
        ) : albumId ? (
          <Link to={`/album/${albumId}`} onClick={(e) => e.stopPropagation()} className={viewBtn}>
            <i className="fa-regular fa-eye text-[11px]" /> <span>View</span>
          </Link>
        ) : (
          <button className={viewBtnDisabled} disabled>
            <i className="fa-regular fa-eye text-[11px]" /> <span>View</span>
          </button>
        )}

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
  );
}
