import React from "react";
import PropTypes from "prop-types";
// Import component 'FollowingCard' mà bạn đã có
import FollowingCard from "./FollowingCard";

/**
 * FollowingSection: Component hiển thị một khu vực gồm tiêu đề và một lưới
 * chứa nhiều thẻ 'FollowingCard'.
 */
export default function FollowingSection({ title, posts = [] }) {
  return (
    <section aria-label={title} className="w-full mb-12">
      {/* Tiêu đề của khu vực */}
      <h2 className="text-2xl font-bold mb-6 text-white text-start">{title}</h2>

      {/* Kiểm tra xem có bài viết nào không */}
      {posts.length === 0 ? (
        // Hiển thị thông báo nếu không có bài viết
        <div className="text-start text-gray-400 border border-dashed border-gray-700/60 rounded-xl py-10 px-6">
          Chưa có bài viết nào để hiển thị.
        </div>
      ) : (
        // Hiển thị lưới các bài viết nếu có
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {posts.map((post) => (
            // Với mỗi item trong mảng 'posts', render ra một FollowingCard
            // 'post.id' được dùng làm key để React nhận diện mỗi card
            <FollowingCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </section>
  );
}

// Định nghĩa các tham số (props) mà component này cần
FollowingSection.propTypes = {
  // Tiêu đề cho khu vực (ví dụ: "Bài viết mới nhất")
  title: PropTypes.string.isRequired,
  // Một mảng các object bài viết
  posts: PropTypes.array,
};