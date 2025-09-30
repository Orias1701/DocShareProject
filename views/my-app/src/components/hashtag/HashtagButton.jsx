// src/components/hashtag/HashtagButton.jsx
import React from "react";

function HashtagButton({ tag, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full bg-[#1C2028] rounded-xl p-4 border border-gray-700/80 text-white flex items-center justify-center hover:bg-[#2C323B] transition-colors"
    >
      <span className="font-semibold text-lg">#{tag}</span>
    </button>
  );
}

export default HashtagButton;
