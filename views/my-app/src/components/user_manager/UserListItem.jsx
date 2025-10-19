import React from "react";

export default function UserListItem({ user, selected, onSelect }) {
  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onSelect?.(user);
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect?.(user)}
      onKeyDown={handleKeyDown}
      className={[
        "flex items-center gap-3 p-2 rounded-xl cursor-pointer transition-colors",
        selected
          ? "bg-[var(--color-card-hover)] ring-1 ring-[var(--color-focus-ring)]"
          : "hover:bg-[var(--color-hover-bg)]",
        "border border-[var(--color-card-border)]",
      ].join(" ")}
    >
      <img
        src={user.avatar}
        alt={user.realName || user.username || "avatar"}
        className="w-12 h-12 rounded-full object-cover border border-[var(--color-border-soft)]"
        onError={(e) => {
          e.currentTarget.onerror = null;
          e.currentTarget.src =
            "https://cdn2.fptshop.com.vn/small/avatar_trang_1_cd729c335b.jpg";
        }}
      />
      <div className="min-w-0">
        <p className="text-[var(--color-text)] font-semibold truncate">
          {user.realName}
        </p>
        <p className="text-sm text-[var(--color-text-muted)] truncate">
          {user.userName}
        </p>
      </div>
    </div>
  );
}
