// src/components/leaderboard/RankItem.jsx
import React from "react";
import PropTypes from "prop-types";

const RankItem = ({
  rank,
  avatar,
  realName,
  userName,
  score,
  isSelected,
  onClick,
  onAvatarClick, // 👈 thêm prop ở đây
}) => {
  const rankColors = {
    1: "bg-yellow-500 border-yellow-400",
    2: "bg-gray-400 border-gray-300",
    3: "bg-yellow-700 border-yellow-600",
  };
  const rankColor = rankColors[rank] || "bg-gray-600 border-gray-500";

  return (
    <div
      onClick={onClick}
      className={`flex items-center p-3 rounded-lg border transition-all cursor-pointer
        ${
          isSelected
            ? "bg-[#2C323B] border-[#4A515B]"
            : "bg-transparent border-transparent hover:bg-[#2C323B]/50"
        }
      `}
    >
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm mr-4 border ${rankColor}`}
      >
        {rank}
      </div>

      <img
        src={avatar}
        alt={realName}
        className="w-10 h-10 rounded-full object-cover cursor-pointer"
        onClick={(e) => {
          e.stopPropagation(); // để click avatar không trigger onClick item
          if (onAvatarClick) onAvatarClick();
        }}
      />

      <div className="flex-grow">
        <p className="font-semibold text-white">{realName}</p>
        <p className="text-sm text-gray-400">{userName}</p>
      </div>

      <div className="text-sm font-semibold text-gray-300">{score}</div>
    </div>
  );
};

RankItem.propTypes = {
  rank: PropTypes.number.isRequired,
  avatar: PropTypes.string.isRequired,
  realName: PropTypes.string.isRequired,
  userName: PropTypes.string,
  score: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  isSelected: PropTypes.bool,
  onClick: PropTypes.func,
  onAvatarClick: PropTypes.func, // 👈 thêm vào propTypes
};

export default RankItem;
