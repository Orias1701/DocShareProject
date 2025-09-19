import React from "react";
import PropTypes from "prop-types";

/**
 * Hiển thị card thông tin người dùng + bài viết.
 * Có thể hiển thị avatar (imageUrl) hoặc icon (icon class).
 * Hiển thị thêm hashtags ngay dưới tiêu đề.
 */
export default function FollowingCard({
  imageUrl,
  icon,
  title,
  subtitle,
  description,
  hashtags = [],
  href = "#",
}) {
  return (
    <a
      href={href}
      className="block bg-[#1C2028] rounded-xl p-6 border border-gray-700/80 text-white text-center hover:border-gray-500 transition-colors h-full"
    >
      <div className="flex justify-center mb-4">
        <div className="w-16 h-16 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden">
          {/* Ưu tiên hiển thị ảnh avatar */}
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={title}
              className="w-full h-full object-cover"
            />
          ) : (
            // Nếu không có ảnh, mới hiển thị icon
            icon && <i className={`${icon} text-3xl text-white`} aria-hidden />
          )}
        </div>
      </div>

      {/* Tiêu đề */}
      <h3 className="font-bold text-lg text-white truncate">{title}</h3>

      {/* Hiện hashtag dưới tiêu đề */}
      {hashtags.length > 0 && (
        <div className="flex flex-wrap justify-center gap-2 mt-2 mb-2">
          {hashtags.map((tag, idx) => (
            <span
              key={idx}
              className="px-2 py-1 text-xs bg-blue-900/40 text-blue-300 rounded"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {subtitle && (
        <p className="text-sm text-gray-400 mb-3 truncate">{subtitle}</p>
      )}
      {description && (
        <p className="text-sm text-gray-400 line-clamp-2">{description}</p>
      )}
    </a>
  );
}

FollowingCard.propTypes = {
  imageUrl: PropTypes.string, // link ảnh
  icon: PropTypes.string,
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  description: PropTypes.string,
  hashtags: PropTypes.arrayOf(PropTypes.string), // ✅ thêm prop
  href: PropTypes.string,
};
