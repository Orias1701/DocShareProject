import React from 'react';

/**
 * Component `HashtagLink`
 * @description Hiển thị một nút hashtag lớn, có thể bấm vào để điều hướng.
 * @param {{
 * tag: string // Nội dung của hashtag, không bao gồm dấu #
 * }} props
 */
function HashtagLink({ tag }) {
  // Đường dẫn URL cho hashtag, ví dụ: "/hashtags/hashtagishere"
  const path = `/hashtags/${tag}`;

  return (
    // Sử dụng thẻ `a` (link) cho toàn bộ nút
    <a 
      href={path} 
      className="bg-[#1C2028] rounded-xl p-4 border border-gray-700/80 text-white flex items-center justify-center hover:bg-[#2C323B] transition-colors"
    >
      <span className="font-semibold text-lg"># {tag}</span>
    </a>
  );
}

export default HashtagLink;