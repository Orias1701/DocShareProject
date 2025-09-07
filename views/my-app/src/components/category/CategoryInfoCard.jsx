import React from 'react';

/**
 * Component `CategoryInfoCard`
 * @description Hiển thị một card chứa thông tin tóm tắt về một category.
 * @param {{
 * icon: string,        // Class Font Awesome cho icon (ví dụ: "fa-solid fa-house")
 * title: string,       // Tiêu đề chính của category
 * subtitle: string,    // Phụ đề ngắn (tối đa 2 dòng)
 * description: string  // Đoạn mô tả dài hơn
 * }} props
 */
function CategoryInfoCard({ icon, title, subtitle, description }) {
  return (
    // Thẻ `a` (link) chính cho toàn bộ card
    <a href="#" className="block bg-[#1C2028] rounded-xl p-6 border border-gray-700/80 text-white text-center hover:border-gray-500 transition-colors">
      
      {/* Vòng tròn chứa icon */}
      <div className="flex justify-center mb-4">
        <div className="w-16 h-16 rounded-full bg-gray-700 flex items-center justify-center">
          <i className={`${icon} text-3xl text-white`}></i>
        </div>
      </div>
      
      {/* Nội dung text */}
      <h3 className="font-bold text-lg text-white">{title}</h3>
      {/* `h-10` để giữ chỗ cho 2 dòng, tránh layout bị giật */}
      <p className="text-sm text-gray-400 mb-3 h-10">{subtitle}</p> 
      <p className="text-sm text-gray-400">{description}</p>
    </a>
  );
}

export default CategoryInfoCard;