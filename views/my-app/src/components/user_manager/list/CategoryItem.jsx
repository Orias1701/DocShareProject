import React from "react";

export default function CategoryItem({ cat, onEdit, onDelete }) {
  return (
    <div
      className="
        w-full flex items-center justify-between gap-4 rounded-xl px-4 py-3
        bg-[var(--color-card-bg)] border border-[var(--color-border-soft)]
        hover:bg-[var(--color-card-hover)] transition
      "
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <i className="fa-solid fa-folder text-[var(--color-icon-default)]" />
        <div className="font-semibold text-[var(--color-text)] truncate">
          {cat.name || "Unnamed"}
        </div>
      </div>

      <div className="flex gap-2">
        <button
          className="px-2 py-1 rounded-md border border-[var(--color-border-soft)] text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
          onClick={onEdit}
        >
          <i className="fa-regular fa-pen-to-square mr-1" /> Edit
        </button>
        <button
          className="px-2 py-1 rounded-md border border-red-500/30 text-xs text-red-300 hover:text-red-200"
          onClick={onDelete}
        >
          <i className="fa-regular fa-trash-can mr-1" /> Delete
        </button>
      </div>
    </div>
  );
}
