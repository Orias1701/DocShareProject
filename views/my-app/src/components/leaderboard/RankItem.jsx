import React from 'react';

const RankItem = ({ rank, avatar, realName, userName, score, isSelected, onClick }) => {
  const rankColors = {
    1: 'bg-yellow-500 border-yellow-400',
    2: 'bg-gray-400 border-gray-300',
    3: 'bg-yellow-700 border-yellow-600',
  };
  const rankColor = rankColors[rank] || 'bg-gray-600 border-gray-500';

  return (
    <div
      onClick={onClick}
      className={`flex items-center p-3 rounded-lg border transition-all cursor-pointer
        ${isSelected 
          ? 'bg-[#2C323B] border-[#4A515B]' 
          : 'bg-transparent border-transparent hover:bg-[#2C323B]/50'
        }
      `}
    >
      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm mr-4 border ${rankColor}`}>
        {rank}
      </div>
      <img src={avatar} alt={realName} className="w-10 h-10 rounded-full mr-4" />
      <div className="flex-grow">
        <p className="font-semibold text-white">{realName}</p>
        <p className="text-sm text-gray-400">{userName}</p>
      </div>
      <div className="text-sm font-semibold text-gray-300">{score}</div>
    </div>
  );
};

export default RankItem;