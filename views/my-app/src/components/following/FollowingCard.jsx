import React from "react";
import PropTypes from "prop-types";

// --- Dữ liệu mẫu (Sample Data Structure) ---
// Đây là cấu trúc object 'post' mà trang page của bạn cần truyền vào component này.
/**
const samplePostData = {
  id: "POST001",
  authorName: "Nguyễn Văn A",
  authorAvatar: "https://i.pravatar.cc/150?img=1",
  title: "Maximum of Post title is 3 lines. This is a long title to test the line clamp.",
  hashtags: ["#hashtag-1", "#hashtag-2", "#hashtag-3"],
  uploadTime: "Post upload time",
  linkPreview: {
    siteName: "google/mangle",
    siteIcon: "https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg",
    favicon: "https://www.google.com/favicon.ico",
    url: "#"
  },
  stats: {
    likes: 1,
    comments: 1,
    views: "72",
  }
};
*/

/**
 * FollowingCard: Component hiển thị giao diện cho MỘT thẻ bài viết.
 * Nó nhận vào một prop duy nhất là 'post' chứa tất cả thông tin cần thiết.
 */
export default function FollowingCard({ post }) {
  // Hàm helper để render các icon thống kê, giúp code gọn hơn
  const renderStatIcon = (iconClass, value) => (
    <div className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors cursor-pointer">
      <i className={iconClass}></i>
      <span className="text-xs font-medium">{value ?? 0}</span>
    </div>
  );

  return (
    // Container chính của card: background, viền, bo góc, và padding
    <div className="bg-[#1C2028] border border-gray-700/80 rounded-xl p-4 flex flex-col h-full text-white">
      
      {/* Header: Thông tin tác giả và nút options */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <img
            src={post.authorAvatar || 'https://i.pravatar.cc/150'}
            alt={post.authorName}
            className="w-8 h-8 rounded-full object-cover"
          />
          <span className="font-semibold text-sm">{post.authorName}</span>
        </div>
        <button className="text-gray-400 hover:text-white">
          <i className="fa-solid fa-ellipsis-vertical"></i>
        </button>
      </div>

      {/* Body: Nội dung chính */}
      <div className="flex-grow">
        <h3 className="font-bold text-base mb-2 line-clamp-3 leading-snug">
          {post.title}
        </h3>

        {post.hashtags && post.hashtags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {post.hashtags.map((tag) => (
              <span key={tag} className="bg-gray-700/50 text-gray-300 text-xs font-medium px-2 py-1 rounded">
                {tag}
              </span>
            ))}
          </div>
        )}

        <p className="text-xs text-gray-500 mb-3">{post.uploadTime}</p>

        {post.linkPreview && (
          <a href={post.linkPreview.url} target="_blank" rel="noopener noreferrer" className="block bg-white rounded-lg p-3 mb-3 hover:bg-gray-200 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src={post.linkPreview.siteIcon} alt="Site Icon" className="w-6 h-6 object-contain" />
                <span className="text-black font-semibold text-sm">{post.linkPreview.siteName}</span>
              </div>
              <img src={post.linkPreview.favicon} alt="Favicon" className="w-4 h-4" />
            </div>
          </a>
        )}
      </div>

      {/* Footer: Thống kê và nút Bookmark */}
      <div className="border-t border-gray-700/80 pt-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
            {renderStatIcon("fa-solid fa-heart", post.stats.likes)}
            {renderStatIcon("fa-solid fa-comment", post.stats.comments)}
            {renderStatIcon("fa-solid fa-eye", post.stats.views)}
        </div>
        <button className="text-gray-400 hover:text-white">
            <i className="fa-solid fa-bookmark"></i>
        </button>
      </div>
    </div>
  );
}

// Định nghĩa các tham số (props) mà component này cần
FollowingCard.propTypes = {
  post: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    authorName: PropTypes.string.isRequired,
    authorAvatar: PropTypes.string,
    title: PropTypes.string.isRequired,
    hashtags: PropTypes.arrayOf(PropTypes.string),
    uploadTime: PropTypes.string,
    linkPreview: PropTypes.shape({
        siteName: PropTypes.string,
        siteIcon: PropTypes.string,
        favicon: PropTypes.string,
        url: PropTypes.string
    }),
    stats: PropTypes.shape({
        likes: PropTypes.number,
        comments: PropTypes.number,
        views: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    }).isRequired,
  }).isRequired,
};
