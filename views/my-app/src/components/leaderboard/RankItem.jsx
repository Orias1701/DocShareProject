import React from "react";
import PropTypes from "prop-types";

/**
 * Một dòng user trong bảng xếp hạng.
 * - Click vào dòng để chọn user
 * - Click avatar để đi tới trang profile
 */
export default function RankItem({
  rank,
  avatar,
  realName,
  userName,
  score,
  isSelected,
  onClick,
  onAvatarClick,
}) {
  // Màu ô thứ hạng 1/2/3
  const rankColors = {
    1: "bg-yellow-500 border-yellow-400",
    2: "bg-gray-400 border-gray-300",
    3: "bg-yellow-700 border-yellow-600",
  };
  const rankColor = rankColors[rank] || "bg-gray-600 border-gray-500";

  return (
    <div
      onClick={onClick}
      className={[
        "flex items-center p-3 rounded-lg border cursor-pointer transition-colors",
        isSelected
          ? "bg-[var(--color-surface-alt)] border-[var(--color-border-soft)]"
          : "bg-transparent border-transparent hover:bg-[var(--color-hover-bg)]",
      ].join(" ")}
    >
      {/* Ô thứ hạng */}
      <div
        className={[
          "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm mr-4 border",
          rankColor,
        ].join(" ")}
      >
        {rank}
      </div>

      {/* Avatar (bấm vào đi profile) */}
      <img
        src={avatar}
        alt={realName}
        className="w-10 h-10 rounded-full object-cover cursor-pointer"
        onClick={(e) => {
          e.stopPropagation(); // tránh kích hoạt chọn dòng
          onAvatarClick?.();
        }}
      />

      {/* Tên + username */}
      <div className="flex-grow min-w-0 ml-3">
        <p className="font-semibold text-[var(--color-text)] truncate">{realName}</p>
        <p className="text-sm text-[var(--color-text-muted)] truncate">{userName}</p>
      </div>

      {/* Điểm */}
      <div className="text-sm font-semibold text-[var(--color-text-secondary)]">
        {score}
      </div>
    </div>
  );
}

RankItem.propTypes = {
  rank: PropTypes.number.isRequired,
  avatar: PropTypes.string.isRequired,
  realName: PropTypes.string.isRequired,
  userName: PropTypes.string,
  score: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  isSelected: PropTypes.bool,
  onClick: PropTypes.func,
  onAvatarClick: PropTypes.func,
};
