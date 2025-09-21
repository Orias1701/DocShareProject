import React from "react";
import PropTypes from "prop-types";
import PostCardProfile from "./PostCardProfile";

const PostFeed = ({ posts = [] }) => {
  if (!Array.isArray(posts) || posts.length === 0) {
    return <div className="text-gray-400 text-sm">Chưa có bài viết nào.</div>;
  }
  return (
    <div className="flex flex-col gap-6">
      {posts.map((p) => (
        <PostCardProfile key={p.id || p.post_id || crypto.randomUUID()} post={p} />
      ))}
    </div>
  );
};

PostFeed.propTypes = { posts: PropTypes.array };
export default PostFeed;
