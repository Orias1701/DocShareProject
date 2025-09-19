import React from "react";
import PropTypes from "prop-types";
// THAY ĐỔI: Import PostCard thay vì FollowingCard
// Vui lòng kiểm tra lại đường dẫn này cho đúng với cấu trúc dự án của bạn
import PostCard from "../leaderboard/PostCard"; 

/**
 * Hiển thị một khu vực gồm tiêu đề và lưới các bài viết (PostCard).
 */
export default function FollowingSection({ title, posts = [] }) {
  return (
    <section aria-label={title} className="w-full mb-12">
      <h2 className="text-2xl font-bold mb-6 text-white text-start">{title}</h2>

      {posts.length === 0 ? (
        <div className="text-start text-gray-400 border border-dashed border-gray-700/60 rounded-xl py-10 px-6">
          Chưa có bài viết để hiển thị.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {posts.map((post) => (
            // === THAY ĐỔI QUAN TRỌNG ===
            // Render component PostCard và truyền vào toàn bộ object 'post'
            // PostCard sẽ tự xử lý các thuộc tính bên trong nó.
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </section>
  );
}

// PropTypes vẫn giữ nguyên vì chúng ta vẫn nhận vào một mảng
FollowingSection.propTypes = {
  title: PropTypes.string.isRequired,
  posts: PropTypes.array,
};