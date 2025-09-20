// src/components/post/PostSection.jsx
import React from "react";
import PropTypes from "prop-types";
import PostCard from "./PostCard"; // đổi path nếu bạn đặt PostCard ở nơi khác

/**
 * PostSection — Section lưới card dùng chung (MyPosts, Following, Bookmarks).
 * Props:
 *  - title: tiêu đề section
 *  - posts: mảng post đã map
 *  - showAlbum: có hiển thị chip album hay không
 *  - maxTags: số hashtag tối đa hiển thị
 *  - emptyText: text khi rỗng
 *  - headerRight: node (button/filter...) hiển thị bên phải tiêu đề
 *  - wrapClassName, gridClassName: tuỳ biến className nếu cần
 *  - onBookmarkChange: (next:boolean, postId:string|number) => void
 */
export default function PostSection({
  title,
  posts = [],
  showAlbum = true,
  maxTags = 3,
  emptyText = "Chưa có bài viết nào để hiển thị.",
  headerRight = null,
  wrapClassName = "w-full mb-12",
  gridClassName = "grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
  onBookmarkChange, // ✅ thêm prop
}) {
  const items = Array.isArray(posts) ? posts : [];

  return (
    <section aria-label={title} className={wrapClassName}>
      <div className="mb-6 flex items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-white text-start">{title}</h2>
        {headerRight}
      </div>

      {items.length === 0 ? (
        <div className="text-start text-gray-400 border border-dashed border-gray-700/60 rounded-xl py-10 px-6">
          {emptyText}
        </div>
      ) : (
        <div className={gridClassName}>
          {items.map((post) => (
            <PostCard
              key={post.id || post.post_id}
              post={post}
              showAlbum={showAlbum}
              maxTags={maxTags}
              onBookmarkChange={onBookmarkChange} // ✅ forward xuống PostCard → BookmarkButton
            />
          ))}
        </div>
      )}
    </section>
  );
}

PostSection.propTypes = {
  title: PropTypes.string.isRequired,
  posts: PropTypes.array,
  showAlbum: PropTypes.bool,
  maxTags: PropTypes.number,
  emptyText: PropTypes.string,
  headerRight: PropTypes.node,
  wrapClassName: PropTypes.string,
  gridClassName: PropTypes.string,
  onBookmarkChange: PropTypes.func, // ✅ khai báo prop types
};
