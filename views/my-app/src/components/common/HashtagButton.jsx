import React from 'react';

/**
 * Component `HashtagButton`
 * @description Hiển thị một nút hashtag lớn, có thể bấm vào.
 * @param {{
 * tag: string // Nội dung của hashtag, không bao gồm dấu #
 * }} props
 */
function HashtagButton({ tag }) {
  return (
    <a 
      href="#" 
      className="bg-[#1C2028] rounded-xl p-4 border border-gray-700/80 text-white flex items-center justify-center hover:bg-[#2C323B] transition-colors"
    >
      <span className="font-semibold text-lg"># {tag}</span>
    </a>
  );
}

export default HashtagButton;