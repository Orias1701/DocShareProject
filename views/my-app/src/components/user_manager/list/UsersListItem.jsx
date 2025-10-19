import React from "react";

export default function UsersListItem({ user, active, onClick, onEdit, onRequestDelete }) {
  return (
    <div
      className={`w-full flex flex-col rounded-xl border transition overflow-hidden ${
        active
          ? "bg-[var(--color-surface-alt)] border-[var(--color-border-strong)]"
          : "bg-[var(--color-card-bg)] border-[var(--color-border-soft)] hover:bg-[var(--color-card-hover)]"
      }`}
    >
      <div className="flex items-center justify-between gap-4 px-4 py-3">
        <button onClick={onClick} className="flex items-center gap-3 min-w-0 flex-1 text-left">
          <img
            src={user.avatar}
            alt={user.realName}
            className="w-8 h-8 rounded-full"
          />
          <div className="min-w-0">
            <div className="font-semibold text-[var(--color-text)] truncate">
              {user.realName}
            </div>
            <div className="text-xs text-[var(--color-text-muted)]">
              {user.userName}
            </div>
          </div>
        </button>

        <div className="flex items-center gap-2">
          <button
            className="px-2 py-1 rounded-md border border-[var(--color-border-soft)] text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
            onClick={(e) => {
              e.stopPropagation();
              onEdit && onEdit(user);
            }}
          >
            <i className="fa-regular fa-pen-to-square mr-1" /> Edit
          </button>
          <button
            className="px-2 py-1 rounded-md border border-red-500/30 text-xs text-red-300 hover:text-red-200"
            onClick={(e) => {
              e.stopPropagation();
              onRequestDelete && onRequestDelete(user);
            }}
          >
            <i className="fa-regular fa-trash-can mr-1" /> Delete
          </button>
        </div>
      </div>
    </div>
  );
}
