// src/components/profile/PostFeed.jsx
// Nhận danh sách posts + callback và render list PostCardProfile.
// Truyền tiếp onEdited/onDeleted/onReportChange xuống Card.

import React from "react";
import PropTypes from "prop-types";
import PostCardProfile from "./PostCardProfile";

const PostFeed = ({ posts = [], onPostEdited, onPostDeleted, onReportChange }) => {
  if (!Array.isArray(posts) || posts.length === 0) {
    return <div className="text-gray-400 text-sm">Chưa có bài viết nào.</div>;
  }
  return (
    <div className="flex flex-col gap-6">
      {posts.map((p) => (
        <PostCardProfile
          key={p.id || p.post_id || crypto.randomUUID()}
          post={p}
          onEdited={onPostEdited}
          onDeleted={onPostDeleted}
          onReportChange={onReportChange}
        />
      ))}
    </div>
  );
};

PostFeed.propTypes = {
  posts: PropTypes.array,
  onPostEdited: PropTypes.func,   // (updated) => void
  onPostDeleted: PropTypes.func,  // (postId) => void
  onReportChange: PropTypes.func, // (postId, nextIsReported) => void
};

export default PostFeed;
