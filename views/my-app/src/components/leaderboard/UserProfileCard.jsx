import React from "react";

const InfoRow = ({ icon, label, value }) => (
  <div className="flex items-center gap-2 text-sm">
    <i className={`${icon} text-[var(--color-text-muted)] w-4 text-center`}></i>
    <span className="text-[var(--color-text-muted)]">{label}:</span>
    <span className="text-[var(--color-text)] font-medium">{value}</span>
  </div>
);

/**
 * Thẻ hiển thị hồ sơ của user đang chọn (bên phải).
 */
export default function UserProfileCard({ user }) {
  return (
    <div className="p-6 rounded-lg border sticky top-24 bg-[var(--color-card-bg)] border-[var(--color-card-border)] text-left">
      {/* Header */}
      <div className="flex items-start gap-4 mb-6">
        <img
          src={user.avatar}
          alt={user.realName}
          className="w-20 h-20 rounded-lg object-cover"
        />
        <div className="flex flex-col">
          <h2 className="text-xl font-bold text-[var(--color-text)]">
            {user.realName}
          </h2>
          <p className="text-[var(--color-text-muted)]">{user.userName}</p>
          <p className="text-sm text-[var(--color-info)] mt-1">
            {user.followerCount} followers
          </p>
        </div>
      </div>

      {/* Tiểu sử */}
      <div className="mb-6">
        <h3 className="font-bold text-[var(--color-text)] mb-2">Biography</h3>
        <p className="text-sm text-[var(--color-text-secondary)] whitespace-pre-line">
          {user.biography || "—"}
        </p>
      </div>

      {/* Thông tin chi tiết */}
      <div className="flex flex-col gap-2">
        <InfoRow icon="fa-solid fa-cake-candles" label="Birthday" value={user.birthday || "—"} />
        <InfoRow icon="fa-solid fa-user-plus" label="Following number" value={user.followingCount} />
        <InfoRow icon="fa-solid fa-file-lines" label="Total post number" value={user.totalPosts} />
      </div>
    </div>
  );
}
