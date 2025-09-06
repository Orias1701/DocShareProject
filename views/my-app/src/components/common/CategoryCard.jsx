import React from 'react';

/**
 * Component `CategoryCard`
 * @description Hiển thị một card tóm tắt thông tin về một category.
 * @param {{
 * icon: string,          // Class Font Awesome cho icon, ví dụ: "fa-solid fa-house"
 * title: string,         // Tiêu đề của category
 * subtitle: string,      // Dòng mô tả ngắn dưới tiêu đề
 * description: string    // Đoạn văn mô tả chi tiết
 * }} props
 */
function CategoryCard({ icon, title, subtitle, description }) {
  return (
    // Thẻ div chính của card, style tương tự PostCard
    <a href="#" className="block bg-[#1C2028] rounded-xl p-6 border border-gray-700/80 text-white text-center hover:border-gray-500 transition-colors">
      
      {/* Vòng tròn chứa icon */}
      <div className="flex justify-center mb-4">
        <div className="w-16 h-16 rounded-full bg-gray-700 flex items-center justify-center">
          <i className={`${icon} text-3xl text-white`}></i>
        </div>
      </div>
      
      {/* Tiêu đề và mô tả */}
      <h3 className="font-bold text-lg text-white">{title}</h3>
      <p className="text-sm text-gray-400 mb-3">{subtitle}</p>
      <p className="text-sm text-gray-400">{description}</p>
    </a>
  );
}

export default CategoryCard;